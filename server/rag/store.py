"""Embedding storage and similarity search.

On Postgres, similarity search is pushed down to the database via pgvector's
cosine-distance operator (indexable, scales past what fits in memory). On
SQLite, the same call falls back to pulling candidate rows and scoring them
in Python — fine for a corpus of hundreds to low-thousands of rows, and
means local dev never needs Postgres running just to exercise this code
path.
"""

from sqlmodel import Session, select

from llm import embeddings as llm_embeddings
from models import IS_POSTGRES, Journal, WellnessResource
from rag.ranking import cosine_similarity, rerank


def embed_text(text: str) -> list[float]:
    return llm_embeddings.get_embeddings().embed_query(text)


def add_resource(session: Session, title: str, content: str, category: str) -> WellnessResource:
    resource = WellnessResource(
        title=title,
        content=content,
        category=category,
        embedding=embed_text(f"{title}\n{content}"),
    )
    session.add(resource)
    session.commit()
    session.refresh(resource)
    return resource


def embed_journal(session: Session, journal: Journal) -> None:
    journal.embedding = embed_text(f"{journal.title}\n{journal.content}")
    session.add(journal)
    session.commit()


def search_resources(session: Session, query: str, top_k: int = 3) -> list[tuple[WellnessResource, float]]:
    query_vec = embed_text(query)

    if IS_POSTGRES:
        stmt = (
            select(WellnessResource)
            .order_by(WellnessResource.embedding.cosine_distance(query_vec))
            .limit(max(top_k * 3, 10))
        )
        candidates = session.exec(stmt).all()
    else:
        candidates = session.exec(select(WellnessResource)).all()

    scored = [
        (r, cosine_similarity(query_vec, r.embedding), f"{r.title} {r.content}")
        for r in candidates
        if r.embedding
    ]
    return rerank(query, scored, top_k)


def search_journals(session: Session, user_id: int, query: str, top_k: int = 5) -> list[tuple[Journal, float]]:
    query_vec = embed_text(query)

    if IS_POSTGRES:
        stmt = (
            select(Journal)
            .where(Journal.user_id == user_id, Journal.embedding.is_not(None))
            .order_by(Journal.embedding.cosine_distance(query_vec))
            .limit(max(top_k * 3, 10))
        )
        candidates = session.exec(stmt).all()
    else:
        candidates = session.exec(select(Journal).where(Journal.user_id == user_id)).all()

    scored = [
        (j, cosine_similarity(query_vec, j.embedding), f"{j.title} {j.content}")
        for j in candidates
        if j.embedding
    ]
    return rerank(query, scored, top_k)
