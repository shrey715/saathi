from tests.conftest import signup_and_login


def test_search_resources_returns_ranked_results(client):
    headers = signup_and_login(client)
    resp = client.get("/api/search", params={"q": "trouble sleeping"}, headers=headers)
    assert resp.status_code == 200
    results = resp.json()
    assert len(results) > 0
    # ranked descending by score
    scores = [r["score"] for r in results]
    assert scores == sorted(scores, reverse=True)


def test_search_requires_auth(client):
    resp = client.get("/api/search", params={"q": "anxiety"})
    assert resp.status_code == 401


def test_search_empty_query_returns_empty_list(client):
    headers = signup_and_login(client)
    resp = client.get("/api/search", params={"q": "   "}, headers=headers)
    assert resp.status_code == 200
    assert resp.json() == []


def test_search_journals_only_returns_own_journals(client):
    alice_headers = signup_and_login(client, username="alice")
    bob_headers = signup_and_login(client, username="bob")

    journal = {
        "id": "j1", "title": "Burnout", "content": "Work has been exhausting and overwhelming.",
        "date": "2026-07-11T00:00:00", "color": "#fff", "emoji": "😩",
    }
    client.post("/api/add-journal", json=journal, headers=alice_headers)

    alice_results = client.get("/api/search-journals", params={"q": "exhausting work"}, headers=alice_headers).json()
    bob_results = client.get("/api/search-journals", params={"q": "exhausting work"}, headers=bob_headers).json()

    assert len(alice_results) == 1
    assert bob_results == []
