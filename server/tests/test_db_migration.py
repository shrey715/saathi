from sqlalchemy import inspect, text

from db import engine, init_db


def _columns(table_name: str) -> set[str]:
    return {col["name"] for col in inspect(engine).get_columns(table_name)}


def test_init_db_backfills_columns_missing_from_an_older_schema(client):
    """Regression test for a real production bug: create_all() only creates
    tables that don't exist yet — it never alters an existing table to add
    a column a newer model definition introduced. A long-running
    deployment's database (e.g. a persistent Postgres volume) can end up
    missing columns like CommunityPost.is_anonymous forever unless
    something explicitly patches it. Simulate that by dropping a column
    SQLModel expects, then confirm init_db() adds it back."""
    with engine.begin() as conn:
        conn.execute(text("ALTER TABLE communitypost DROP COLUMN is_anonymous"))
    assert "is_anonymous" not in _columns("communitypost")

    init_db()

    assert "is_anonymous" in _columns("communitypost")


def test_init_db_backfills_existing_rows_with_the_column_default(client):
    """Old rows shouldn't come back as NULL against a non-Optional field —
    they should get the column's Python-side default."""
    import uuid

    from sqlmodel import Session, select

    from models import CommunityPost

    with Session(engine) as session:
        session.add(CommunityPost(
            id=uuid.uuid4().hex, username="alice", content="hi", mood="happy", emoji="😊", color="#fff",
        ))
        session.commit()

    with engine.begin() as conn:
        conn.execute(text("ALTER TABLE communitypost DROP COLUMN is_anonymous"))

    init_db()

    with Session(engine) as session:
        post = session.exec(select(CommunityPost)).first()
        assert post is not None
        assert post.is_anonymous is False
