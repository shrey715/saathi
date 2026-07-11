"""Hybrid ranking: vector similarity blended with lexical overlap.

Pure vector similarity ranks a technically-close-but-off-topic snippet above
one that shares the user's actual vocabulary. A small lexical boost fixes
that without needing a full learning-to-rank pipeline.
"""

import math
from typing import Sequence, TypeVar

T = TypeVar("T")

VECTOR_WEIGHT = 0.85
LEXICAL_WEIGHT = 0.15


def cosine_similarity(a: Sequence[float], b: Sequence[float]) -> float:
    dot = sum(x * y for x, y in zip(a, b))
    norm_a = math.sqrt(sum(x * x for x in a))
    norm_b = math.sqrt(sum(y * y for y in b))
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return dot / (norm_a * norm_b)


def _lexical_overlap(query: str, text: str) -> float:
    query_words = set(query.lower().split())
    if not query_words:
        return 0.0
    text_words = set(text.lower().split())
    return len(query_words & text_words) / len(query_words)


def rerank(query: str, candidates: list[tuple[T, float, str]], top_k: int) -> list[tuple[T, float]]:
    """candidates: (item, vector_similarity, searchable_text). Returns (item, score) sorted desc."""
    scored = [
        (item, VECTOR_WEIGHT * sim + LEXICAL_WEIGHT * _lexical_overlap(query, text))
        for item, sim, text in candidates
    ]
    scored.sort(key=lambda pair: pair[1], reverse=True)
    return scored[:top_k]
