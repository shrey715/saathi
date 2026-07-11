"""Central app configuration, loaded from environment / .env.

Secrets (JWT_SECRET_KEY, provider API keys) have no insecure fallback — the
app fails fast at startup if they're missing rather than silently running
with a default that would be identical across every deployment.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "sqlite:///./saathi.db"

    jwt_secret_key: str
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 240

    allowed_origins: str = "http://localhost:3000,https://saathi-eight.vercel.app"

    port: int = 8000

    # Populates an empty database with a login-ready demo account, sample
    # journals/mood history/community posts. Only runs when the users table
    # is empty, so it's a no-op on any database that already has real data —
    # but turn this off for a real deployment anyway, since it creates an
    # account with a known password ("demo" / "demo1234").
    seed_demo_data: bool = True

    # Per-IP rate limiting on auth endpoints, to slow down brute-force
    # password guessing and username-enumeration via signup/login timing
    # and status codes. Disabled in tests (see tests/conftest.py), since a
    # single test run fires far more than a real user's worth of requests.
    rate_limit_enabled: bool = True

    @property
    def allowed_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.allowed_origins.split(",") if origin.strip()]


settings = Settings()
