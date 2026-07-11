from tests.conftest import signup_and_login


def test_chat_returns_response_and_emotion(client):
    headers = signup_and_login(client)
    resp = client.post("/api/chat", json={"message": "I've been feeling anxious about exams."}, headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["response"]
    assert data["emotion"] == "supportive"  # from FakeChatModel


def test_chat_records_mood_history(client):
    headers = signup_and_login(client)
    client.post("/api/chat", json={"message": "I've been feeling anxious."}, headers=headers)

    history = client.get("/api/get-mood-history", headers=headers).json()
    assert len(history) == 1
    assert history[0]["emotion"] == "supportive"
    assert history[0]["message"] == "I've been feeling anxious."


def test_chat_requires_auth(client):
    resp = client.post("/api/chat", json={"message": "hello"})
    assert resp.status_code == 401


def test_reset_chat_requires_auth(client):
    resp = client.post("/api/reset-chat")
    assert resp.status_code == 401


def test_reset_chat_succeeds_when_authenticated(client):
    headers = signup_and_login(client)
    resp = client.post("/api/reset-chat", headers=headers)
    assert resp.status_code == 200


def test_get_books_uses_mood_context(client):
    headers = signup_and_login(client)
    client.post("/api/chat", json={"message": "I've been feeling anxious."}, headers=headers)

    resp = client.post("/api/get-books", headers=headers)
    assert resp.status_code == 200
    books = resp.json()
    assert len(books) == 1
    assert books[0]["title"] == "Test Book"


def test_set_mood_records_a_direct_mood_entry(client):
    """The home page's mood check-in logs a mood entry without going
    through the chat/emotion-detection pipeline at all."""
    headers = signup_and_login(client)
    resp = client.post("/api/set-mood", json={"emotion": "happy"}, headers=headers)
    assert resp.status_code == 200
    assert resp.json()["emotion"] == "happy"

    history = client.get("/api/get-mood-history", headers=headers).json()
    assert len(history) == 1
    assert history[0]["emotion"] == "happy"


def test_set_mood_requires_auth(client):
    resp = client.post("/api/set-mood", json={"emotion": "happy"})
    assert resp.status_code == 401
