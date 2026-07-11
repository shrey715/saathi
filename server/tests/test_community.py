from tests.conftest import signup_and_login

POST = {"content": "Feeling hopeful today", "mood": "happy", "emoji": "😊", "color": "#4AD295"}


def test_create_and_list_post(client):
    headers = signup_and_login(client)
    resp = client.post("/api/community/posts", json=POST, headers=headers)
    assert resp.status_code == 200
    created = resp.json()
    assert created["username"] == "alice"
    assert created["likes"] == 0

    posts = client.get("/api/community/posts", headers=headers).json()
    assert len(posts) == 1
    assert posts[0]["id"] == created["id"]


def test_like_then_unlike_toggles_and_persists(client):
    """Regression test for a bug in the original app: liking a post updated
    MongoDB with the raw request dict as the query filter instead of its
    'id' field, so the update silently never matched anything and likes
    never actually persisted."""
    headers = signup_and_login(client)
    post = client.post("/api/community/posts", json=POST, headers=headers).json()

    like_resp = client.post("/api/community/posts/like", json={"id": post["id"]}, headers=headers)
    assert like_resp.status_code == 200
    assert like_resp.json() == {"id": post["id"], "likes": 1, "liked": True}

    # Confirm it actually persisted, not just returned in the response.
    posts = client.get("/api/community/posts", headers=headers).json()
    assert posts[0]["likes"] == 1

    unlike_resp = client.post("/api/community/posts/like", json={"id": post["id"]}, headers=headers)
    assert unlike_resp.json() == {"id": post["id"], "likes": 0, "liked": False}

    posts = client.get("/api/community/posts", headers=headers).json()
    assert posts[0]["likes"] == 0


def test_like_nonexistent_post_404s(client):
    headers = signup_and_login(client)
    resp = client.post("/api/community/posts/like", json={"id": "does-not-exist"}, headers=headers)
    assert resp.status_code == 404


def test_two_users_liking_the_same_post_counts_both(client):
    alice_headers = signup_and_login(client, username="alice")
    bob_headers = signup_and_login(client, username="bob")

    post = client.post("/api/community/posts", json=POST, headers=alice_headers).json()

    client.post("/api/community/posts/like", json={"id": post["id"]}, headers=alice_headers)
    resp = client.post("/api/community/posts/like", json={"id": post["id"]}, headers=bob_headers)

    assert resp.json()["likes"] == 2


def test_liked_flag_reflects_current_user_only(client):
    """The list endpoint no longer leaks the full set of usernames who
    liked each post (that let anyone cross-reference who's connected to
    which mood post). Instead each viewer just sees their own liked state."""
    alice_headers = signup_and_login(client, username="alice")
    bob_headers = signup_and_login(client, username="bob")

    post = client.post("/api/community/posts", json=POST, headers=alice_headers).json()
    client.post("/api/community/posts/like", json={"id": post["id"]}, headers=alice_headers)

    alice_view = client.get("/api/community/posts", headers=alice_headers).json()[0]
    bob_view = client.get("/api/community/posts", headers=bob_headers).json()[0]

    assert alice_view["liked"] is True
    assert bob_view["liked"] is False
    assert "likedBy" not in alice_view


def test_anonymous_post_hides_username_from_other_users(client):
    alice_headers = signup_and_login(client, username="alice")
    bob_headers = signup_and_login(client, username="bob")

    created = client.post(
        "/api/community/posts", json={**POST, "is_anonymous": True}, headers=alice_headers
    ).json()
    # The author still sees their own name on the create response.
    assert created["username"] == "alice"
    assert created["is_anonymous"] is True

    alice_view = client.get("/api/community/posts", headers=alice_headers).json()[0]
    bob_view = client.get("/api/community/posts", headers=bob_headers).json()[0]

    assert alice_view["username"] == "alice"
    assert bob_view["username"] is None
    assert bob_view["is_anonymous"] is True


def test_non_anonymous_post_still_shows_username(client):
    headers = signup_and_login(client, username="alice")
    other = signup_and_login(client, username="bob")

    client.post("/api/community/posts", json=POST, headers=headers)
    bob_view = client.get("/api/community/posts", headers=other).json()[0]
    assert bob_view["username"] == "alice"
