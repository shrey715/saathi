from tests.conftest import signup_and_login


def test_explore_content_requires_auth(client):
    resp = client.get("/api/explore/content")
    assert resp.status_code == 401


def test_explore_content_is_seeded_and_served_from_db(client):
    """Regression test for the app's yoga/breathing/quotes/facts/movies
    content: it used to be hardcoded in the frontend bundle. It's now
    real rows, seeded once at startup and served over the API."""
    headers = signup_and_login(client)
    resp = client.get("/api/explore/content", headers=headers)
    assert resp.status_code == 200
    data = resp.json()

    assert len(data["yoga"]) > 0
    assert len(data["breathing"]) > 0
    assert len(data["quotes"]) > 0
    assert len(data["facts"]) > 0
    assert set(data["movies"].keys()) == {"anxiety", "sadness", "stress", "inspiration"}

    yoga = data["yoga"][0]
    assert {"id", "name", "description", "duration", "level", "benefits", "tone", "icon"} <= yoga.keys()
    assert isinstance(yoga["benefits"], list)
