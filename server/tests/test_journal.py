from tests.conftest import signup_and_login

JOURNAL = {
    "id": "j1", "title": "Rough day", "content": "Work was overwhelming today.",
    "date": "2026-07-11T00:00:00", "color": "#fff", "emoji": "😩",
}


def test_add_and_get_journal(client):
    headers = signup_and_login(client)
    assert client.post("/api/add-journal", json=JOURNAL, headers=headers).status_code == 200

    resp = client.get("/api/get-journals", headers=headers)
    assert resp.status_code == 200
    entries = resp.json()
    assert len(entries) == 1
    assert entries[0]["title"] == "Rough day"


def test_add_journal_with_existing_id_updates_it(client):
    headers = signup_and_login(client)
    client.post("/api/add-journal", json=JOURNAL, headers=headers)

    updated = {**JOURNAL, "title": "Actually a fine day"}
    client.post("/api/add-journal", json=updated, headers=headers)

    entries = client.get("/api/get-journals", headers=headers).json()
    assert len(entries) == 1
    assert entries[0]["title"] == "Actually a fine day"


def test_delete_journal(client):
    headers = signup_and_login(client)
    client.post("/api/add-journal", json=JOURNAL, headers=headers)

    resp = client.request("DELETE", "/api/delete-journal", json={"id": "j1"}, headers=headers)
    assert resp.status_code == 200
    assert client.get("/api/get-journals", headers=headers).json() == []


def test_delete_nonexistent_journal_is_a_no_op(client):
    headers = signup_and_login(client)
    resp = client.request("DELETE", "/api/delete-journal", json={"id": "does-not-exist"}, headers=headers)
    assert resp.status_code == 200
    assert "No journal found" in resp.json()["message"]


def test_journals_are_isolated_per_user(client):
    alice_headers = signup_and_login(client, username="alice")
    bob_headers = signup_and_login(client, username="bob")

    client.post("/api/add-journal", json=JOURNAL, headers=alice_headers)

    assert len(client.get("/api/get-journals", headers=alice_headers).json()) == 1
    assert client.get("/api/get-journals", headers=bob_headers).json() == []


def test_user_cannot_delete_another_users_journal(client):
    alice_headers = signup_and_login(client, username="alice")
    bob_headers = signup_and_login(client, username="bob")

    client.post("/api/add-journal", json=JOURNAL, headers=alice_headers)

    # Bob "deleting" j1 should be a no-op, not actually remove Alice's entry.
    client.request("DELETE", "/api/delete-journal", json={"id": "j1"}, headers=bob_headers)
    assert len(client.get("/api/get-journals", headers=alice_headers).json()) == 1
