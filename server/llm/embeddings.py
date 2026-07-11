"""Modular embeddings factory — the retrieval-side counterpart to provider.py.

Same idea as chat models: pick a provider via env vars, no code changes to
swap. Each provider's dimension differs, which is why the vector column
width is configurable via EMBEDDING_DIM (see models.py) rather than hardcoded.
"""

import os
from functools import lru_cache

from langchain.embeddings import init_embeddings
from langchain_core.embeddings import Embeddings

_DEFAULT_MODELS = {
    "mistralai": "mistral-embed",
    "openai": "text-embedding-3-small",
    "google_genai": "models/embedding-001",
    "ollama": "nomic-embed-text",
}

_DEFAULT_DIMS = {
    "mistralai": 1024,
    "openai": 1536,
    "google_genai": 768,
    "ollama": 768,
}


@lru_cache(maxsize=4)
def _build(provider: str, model: str) -> Embeddings:
    return init_embeddings(model, provider=provider)


def get_embeddings() -> Embeddings:
    provider = os.environ.get("EMBEDDING_PROVIDER") or os.environ.get("LLM_PROVIDER", "mistralai")
    model = os.environ.get("EMBEDDING_MODEL") or _DEFAULT_MODELS.get(provider)
    if not model:
        raise ValueError(f"No default embedding model for provider '{provider}'; set EMBEDDING_MODEL.")
    return _build(provider, model)


def get_embedding_dim() -> int:
    provider = os.environ.get("EMBEDDING_PROVIDER") or os.environ.get("LLM_PROVIDER", "mistralai")
    configured = os.environ.get("EMBEDDING_DIM")
    if configured:
        return int(configured)
    return _DEFAULT_DIMS.get(provider, 1024)
