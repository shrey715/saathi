import os

# Must happen before config.py (or anything importing it) is first loaded,
# so pydantic-settings picks these up instead of a real .env / real keys.
os.environ["JWT_SECRET_KEY"] = "test-secret-key-not-for-production"
os.environ.setdefault("MISTRAL_API_KEY", "unused-because-the-llm-is-mocked")
os.environ["DATABASE_URL"] = "sqlite:///./test_saathi.db"
os.environ["ENABLE_GUARDRAIL"] = "false"
os.environ["SEED_DEMO_DATA"] = "false"  # keep test data isolated from demo fixtures
os.environ["RATE_LIMIT_ENABLED"] = "false"  # tests fire far more requests/IP than a real user would

import pytest
from fastapi.testclient import TestClient
from sqlmodel import SQLModel

from tests.fakes import FakeChatModel, FakeEmbeddings


@pytest.fixture()
def client(monkeypatch):
    monkeypatch.setattr("llm.provider.get_chat_model", lambda **kwargs: FakeChatModel())
    monkeypatch.setattr("llm.embeddings.get_embeddings", lambda: FakeEmbeddings())

    from db import engine
    SQLModel.metadata.drop_all(engine)
    SQLModel.metadata.create_all(engine)

    from main import app
    with TestClient(app) as test_client:
        yield test_client

    SQLModel.metadata.drop_all(engine)


def signup_and_login(client: TestClient, username: str = "alice", password: str = "pw12345") -> dict:
    client.post("/api/signup", json={
        "username": username, "password": password, "gender": "other", "dob": "2000-01-01",
    })
    resp = client.post("/api/login", json={"username": username, "password": password})
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
