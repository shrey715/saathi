from sqlmodel import Session, select

from models import AuditLog
from tests.conftest import signup_and_login


def test_signup_creates_user(client):
    resp = client.post("/api/signup", json={
        "username": "alice", "password": "pw12345", "gender": "other", "dob": "2000-01-01",
    })
    assert resp.status_code == 200


def test_signup_rejects_duplicate_username(client):
    payload = {"username": "alice", "password": "pw12345", "gender": "other", "dob": "2000-01-01"}
    client.post("/api/signup", json=payload)
    resp = client.post("/api/signup", json=payload)
    assert resp.status_code == 400


def test_login_wrong_password_rejected(client):
    client.post("/api/signup", json={
        "username": "alice", "password": "pw12345", "gender": "other", "dob": "2000-01-01",
    })
    resp = client.post("/api/login", json={"username": "alice", "password": "wrong"})
    assert resp.status_code == 401


def test_protected_route_requires_token(client):
    resp = client.get("/api/get-user-details")
    assert resp.status_code == 401


def test_get_user_details_returns_profile(client):
    headers = signup_and_login(client)
    resp = client.get("/api/get-user-details", headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["username"] == "alice"
    assert data["journals"] == []
    assert data["mood_history"] == []


def test_update_user_changes_password(client):
    headers = signup_and_login(client)

    resp = client.post("/api/update-user", json={
        "currentPassword": "pw12345", "newPassword": "newpass123",
    }, headers=headers)
    assert resp.status_code == 200

    # Old password no longer works, new one does.
    assert client.post("/api/login", json={"username": "alice", "password": "pw12345"}).status_code == 401
    assert client.post("/api/login", json={"username": "alice", "password": "newpass123"}).status_code == 200


def test_update_user_rejects_wrong_current_password(client):
    headers = signup_and_login(client)
    resp = client.post("/api/update-user", json={
        "currentPassword": "wrong", "newPassword": "newpass123",
    }, headers=headers)
    assert resp.status_code == 400


def test_update_user_cannot_mass_assign_arbitrary_fields(client):
    """UserUpdate is a fixed schema — a client can't smuggle in fields like
    'username' or 'password' the way the old raw-dict endpoint allowed."""
    headers = signup_and_login(client)
    resp = client.post("/api/update-user", json={
        "gender": "female", "username": "hacked", "password": "not-a-real-hash",
    }, headers=headers)
    assert resp.status_code == 200

    details = client.get("/api/get-user-details", headers=headers).json()
    assert details["username"] == "alice"
    assert details["gender"] == "female"


def _audit_events(event_type: str) -> list[AuditLog]:
    from db import engine
    with Session(engine) as session:
        return list(session.exec(select(AuditLog).where(AuditLog.event_type == event_type)))


def test_signup_and_login_write_audit_events(client):
    signup_and_login(client)
    client.post("/api/login", json={"username": "alice", "password": "wrong"})

    signups = _audit_events("signup")
    assert len(signups) == 1
    assert signups[0].username == "alice"
    assert signups[0].success is True

    logins = _audit_events("login")
    assert len(logins) == 2
    assert {(entry.success) for entry in logins} == {True, False}


def test_failed_login_writes_audit_event_without_leaking_which_field_was_wrong(client):
    resp = client.post("/api/login", json={"username": "nobody", "password": "wrong"})
    assert resp.status_code == 401
    # Same generic message whether the username doesn't exist or the
    # password is wrong — this is what actually prevents username
    # enumeration; the audit trail behind it is for our own visibility.
    assert resp.json()["detail"] == "Incorrect username or password"

    logins = _audit_events("login")
    assert len(logins) == 1
    assert logins[0].success is False


def test_login_rate_limit_blocks_after_threshold(client, monkeypatch):
    from limiter import limiter
    monkeypatch.setattr(limiter, "enabled", True)

    signup_and_login(client)
    for _ in range(5):
        client.post("/api/login", json={"username": "alice", "password": "wrong"})

    resp = client.post("/api/login", json={"username": "alice", "password": "wrong"})
    assert resp.status_code == 429
