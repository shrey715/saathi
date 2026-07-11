"""LangGraph conversation graph.

classify -> retrieve -> respond

`classify` asks the LLM to pick a specialist from AGENTS by name.
`retrieve` runs a semantic search over the curated wellness resource corpus
(rag/store.py) for the user's latest message — this is the RAG step: it
grounds the specialist's response in a small evidence-based knowledge base
instead of relying purely on the model's parametric knowledge.
`respond` runs the chosen specialist's system prompt, plus retrieved
context, against the full checkpointed message history, then (optionally,
see ENABLE_GUARDRAIL) passes the draft through a safety review before it's
added to the conversation.

Conversation history is kept per thread_id by LangGraph's MemorySaver
checkpointer — in-memory only, matching the original app's ephemeral memory
(and reset the same way: handing out a fresh thread_id clears history).
"""

import logging
import os
from functools import lru_cache
from typing import Annotated, Sequence, TypedDict

from langchain_core.messages import AIMessage, BaseMessage, HumanMessage, SystemMessage
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import END, StateGraph
from langgraph.graph.message import add_messages
from sqlmodel import Session

from agents.specialists import AGENTS, DEFAULT_AGENT, GUARDRAIL
from db import engine
from llm import provider as llm_provider
from rag.store import search_resources

logger = logging.getLogger(__name__)


class ChatState(TypedDict):
    messages: Annotated[Sequence[BaseMessage], add_messages]
    agent_name: str
    retrieved_context: str


def _classify(state: ChatState) -> dict:
    user_message = state["messages"][-1].content
    roster = "\n".join(f"- {spec.name}: {spec.description}" for spec in AGENTS.values())
    router_prompt = (
        "Classify the user's message into exactly one of the specialists below. "
        "Reply with the specialist's name only, nothing else.\n\n"
        f"Specialists:\n{roster}\n\n"
        f"User message: {user_message}"
    )
    llm = llm_provider.get_chat_model(temperature=0, max_tokens=20)
    result = llm.invoke([HumanMessage(content=router_prompt)])
    choice = result.content.strip()
    agent_name = choice if choice in AGENTS else DEFAULT_AGENT
    return {"agent_name": agent_name}


def _retrieve(state: ChatState) -> dict:
    user_message = state["messages"][-1].content
    try:
        with Session(engine) as session:
            results = search_resources(session, user_message, top_k=3)
    except Exception:
        logger.warning("Retrieval failed; responding without grounding context.", exc_info=True)
        return {"retrieved_context": ""}

    if not results:
        return {"retrieved_context": ""}

    context = "\n".join(f"- {resource.title}: {resource.content}" for resource, _score in results)
    return {"retrieved_context": context}


def _apply_guardrail(user_message: str, draft: str) -> str:
    llm = llm_provider.get_chat_model(temperature=GUARDRAIL.temperature, max_tokens=GUARDRAIL.max_tokens)
    check_prompt = (
        f"User said: {user_message}\n\n"
        f"Draft response: {draft}\n\n"
        "Return the draft response unchanged if it is safe, or a safer replacement if it "
        "is not. Reply with only the final response text."
    )
    result = llm.invoke([SystemMessage(content=GUARDRAIL.system_prompt), HumanMessage(content=check_prompt)])
    return result.content.strip()


def _respond(state: ChatState) -> dict:
    spec = AGENTS[state["agent_name"]]
    llm = llm_provider.get_chat_model(temperature=spec.temperature, max_tokens=spec.max_tokens)

    system_prompt = spec.system_prompt
    if state.get("retrieved_context"):
        system_prompt += (
            "\n\nYou have access to the following evidence-based wellness resources. Draw on "
            "them naturally where relevant, in your own words — don't just copy them verbatim "
            "or cite them like a bibliography:\n" + state["retrieved_context"]
        )

    history = [SystemMessage(content=system_prompt), *state["messages"]]
    result = llm.invoke(history)
    final_text = result.content

    if os.environ.get("ENABLE_GUARDRAIL", "false").lower() == "true":
        final_text = _apply_guardrail(state["messages"][-1].content, final_text)

    return {"messages": [AIMessage(content=final_text)]}


def build_graph():
    graph = StateGraph(ChatState)
    graph.add_node("classify", _classify)
    graph.add_node("retrieve", _retrieve)
    graph.add_node("respond", _respond)
    graph.set_entry_point("classify")
    graph.add_edge("classify", "retrieve")
    graph.add_edge("retrieve", "respond")
    graph.add_edge("respond", END)
    return graph.compile(checkpointer=MemorySaver())


@lru_cache(maxsize=1)
def get_graph():
    """Build the graph once, lazily, on first use."""
    return build_graph()
