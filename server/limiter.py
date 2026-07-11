"""Shared slowapi Limiter instance, keyed by client IP.

A single instance is imported by both main.py (to register it on the app
and handle RateLimitExceeded) and any router that needs to decorate an
endpoint with @limiter.limit(...).
"""

from slowapi import Limiter
from slowapi.util import get_remote_address

from config import settings

limiter = Limiter(key_func=get_remote_address, enabled=settings.rate_limit_enabled)
