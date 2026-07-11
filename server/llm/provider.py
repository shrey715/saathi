"""Modular chat-model factory.

Every agent in this app asks for a model through `get_chat_model()` instead of
importing a specific provider SDK. Swapping providers — Mistral today, Groq or
a friend's self-hosted box tomorrow — is a matter of changing environment
variables, not code.

Env vars:
    LLM_PROVIDER   "mistralai" | "groq" | "openai" | "google_genai" | "ollama"
                   (defaults to "mistralai"). These are the provider ids
                   LangChain's `init_chat_model` understands.
    LLM_MODEL      Model name for the chosen provider. Falls back to a sane
                   free-tier-friendly default per provider if unset.
    LLM_BASE_URL   Optional. Points an OpenAI-compatible endpoint at a custom
                   host — e.g. a friend's machine running Ollama/vLLM/
                   llama.cpp's server. Use LLM_PROVIDER=openai with this set
                   and OPENAI_API_KEY set to any non-empty string if the
                   server doesn't check it.

    Each provider reads its API key from the SDK's own standard env var:
    MISTRAL_API_KEY, GROQ_API_KEY, OPENAI_API_KEY, GOOGLE_API_KEY.
"""

import os
from functools import lru_cache

from langchain.chat_models import init_chat_model
from langchain_core.language_models.chat_models import BaseChatModel

_DEFAULT_MODELS = {
    "mistralai": "mistral-small-latest",
    "groq": "llama-3.3-70b-versatile",
    "openai": "gpt-4o-mini",
    "google_genai": "gemini-1.5-flash",
    "ollama": "llama3.1",
}


@lru_cache(maxsize=16)
def _build(provider: str, model: str, base_url: str | None, temperature: float, max_tokens: int) -> BaseChatModel:
    kwargs = {"temperature": temperature, "max_tokens": max_tokens}
    if base_url:
        kwargs["base_url"] = base_url
    return init_chat_model(model, model_provider=provider, **kwargs)


def get_chat_model(*, temperature: float = 0.7, max_tokens: int = 400) -> BaseChatModel:
    """Build (and cache) a chat model for the currently configured provider."""
    provider = os.environ.get("LLM_PROVIDER", "mistralai")
    model = os.environ.get("LLM_MODEL") or _DEFAULT_MODELS.get(provider)
    if not model:
        raise ValueError(f"No default model known for provider '{provider}'; set LLM_MODEL.")
    base_url = os.environ.get("LLM_BASE_URL") or None
    return _build(provider, model, base_url, temperature, max_tokens)
