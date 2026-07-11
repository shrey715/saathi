"""Fake LLM and embeddings providers so tests never hit a network or need an
API key. They stand in for llm.provider.get_chat_model / llm.embeddings.get_embeddings.
"""

import json


class FakeMessage:
    def __init__(self, content: str):
        self.content = content


class FakeChatModel:
    """Inspects the prompt to return a plausible response for whichever
    node called it — classifier, specialist, emotion detector, guardrail,
    or book recommender all share this one fake."""

    def invoke(self, messages) -> FakeMessage:
        combined = " ".join(getattr(m, "content", "") for m in messages)

        if "Classify the user's message" in combined:
            return FakeMessage("guided_helper")

        if "emotion detection specialist" in combined:
            return FakeMessage("supportive")

        if "book recommendation specialist" in combined:
            return FakeMessage(json.dumps([
                {
                    "id": 1,
                    "title": "Test Book",
                    "author": "Test Author",
                    "description": "A test description.",
                    "category": "Self-Help",
                    "mood": ["calm"],
                    "color": "#5AA9FF",
                    "emoji": "📖",
                }
            ]))

        if "guardrail agent" in combined and "Draft response:" in combined:
            draft = combined.split("Draft response:", 1)[1]
            draft = draft.split("Reply with only", 1)[0].strip()
            return FakeMessage(draft)

        return FakeMessage("I hear you, and I'm here to support you through this.")


class FakeEmbeddings:
    """Deterministic bag-of-words hash embedding — good enough to exercise
    the retrieval/ranking code paths without a real embeddings API."""

    DIM = 16

    def embed_query(self, text: str) -> list[float]:
        vec = [0.0] * self.DIM
        for word in text.lower().split():
            vec[hash(word) % self.DIM] += 1.0
        norm = sum(v * v for v in vec) ** 0.5
        if norm:
            vec = [v / norm for v in vec]
        return vec
