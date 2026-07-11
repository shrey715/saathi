"""Book recommendations based on the user's recent mood."""

import json
import re

from langchain_core.messages import HumanMessage, SystemMessage

from llm import provider as llm_provider

_SYSTEM_PROMPT = """You are a book recommendation specialist for a mental health app called Saathi.
Your role is to recommend books that can support users' mental well-being and personal growth.

When asked to recommend books, return a JSON array of book objects with the following structure:
[
  {
    "id": 1,
    "title": "Book Title",
    "author": "Author Name",
    "description": "A brief description of the book that explains its relevance to mental health and wellness.",
    "category": "Personal Development",
    "mood": ["growth", "motivation"],
    "color": "#5AA9FF"
  }
]

"category" must be exactly one of: "Personal Development", "Mental Wellness", "Self-Help",
"Psychology", "Mindfulness", "Relationships", "Stress Management" — the client maps this
category to a fixed icon, so do not invent new category names.

Limit your response to 3-5 high-quality recommendations that are directly relevant to the user's needs.
Focus on widely respected, evidence-based books by reputable authors.
Include a diverse range of perspectives and approaches.
Vary the colors for visual diversity in the UI.
Ensure descriptions highlight mental health benefits and are concise.

Return ONLY valid JSON without code blocks, explanations, or additional text."""

_CODE_FENCE = re.compile(r"^```(?:json)?|```$", re.MULTILINE)


def recommend_books(mood_context: str) -> list[dict]:
    llm = llm_provider.get_chat_model(temperature=0.7, max_tokens=800)
    prompt = f"{mood_context}Recommend books for the user that will help improve their mood."
    result = llm.invoke([SystemMessage(content=_SYSTEM_PROMPT), HumanMessage(content=prompt)])
    text = _CODE_FENCE.sub("", result.content).strip()

    # Models occasionally add stray commentary before/after the array despite
    # instructions not to; parse just the outermost [...] span rather than
    # assuming the whole response is valid JSON.
    start, end = text.find("["), text.rfind("]")
    if start != -1 and end != -1:
        text = text[start:end + 1]

    return json.loads(text)
