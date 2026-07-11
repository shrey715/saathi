"""Emotion tagging for assistant responses, used to drive the UI's mood icon."""

from langchain_core.messages import HumanMessage, SystemMessage

from llm import provider as llm_provider

VALID_EMOTIONS = [
    "default", "thinking", "supportive", "celebration", "concern",
    "calm", "motivated", "curious", "empathetic", "hopeful",
    "gentle", "confident", "reflective", "respectful", "warm",
]

_SYSTEM_PROMPT = f"""You are an emotion detection specialist for a mental health chatbot application.
Your role is to analyze the assistant's messages and determine the most appropriate
emotional expression to display alongside the message.

For each message, return ONLY ONE of the following emotion categories:
{chr(10).join(f"    - {e}" for e in VALID_EMOTIONS)}

DO NOT include any explanations or additional text in your response.
Return ONLY the emotion category name as a single word."""


def detect_emotion(assistant_message: str) -> str:
    llm = llm_provider.get_chat_model(temperature=0, max_tokens=10)
    result = llm.invoke([SystemMessage(content=_SYSTEM_PROMPT), HumanMessage(content=assistant_message)])
    emotion = result.content.strip().lower()
    return emotion if emotion in VALID_EMOTIONS else "default"
