from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from db import get_session
from models import User
from rag.store import search_journals, search_resources
from security import get_current_username

router = APIRouter(prefix="/api", tags=["search"])


@router.get("/search")
def search(q: str, session: Session = Depends(get_session), _: str = Depends(get_current_username)):
    """Semantic search over the curated wellness resource corpus, ranked by
    a blend of vector similarity and lexical overlap (see rag/ranking.py)."""
    if not q.strip():
        return []

    results = search_resources(session, q, top_k=5)
    return [
        {
            "id": resource.id,
            "title": resource.title,
            "content": resource.content,
            "category": resource.category,
            "score": round(score, 4),
        }
        for resource, score in results
    ]


@router.get("/search-journals")
def search_journals_endpoint(q: str, username: str = Depends(get_current_username), session: Session = Depends(get_session)):
    """Semantic search over the current user's own journal entries only —
    every query is scoped to session.user_id, never cross-user."""
    if not q.strip():
        return []

    user = session.exec(select(User).where(User.username == username)).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    results = search_journals(session, user.id, q, top_k=5)
    return [
        {
            "id": journal.id,
            "title": journal.title,
            "content": journal.content,
            "date": journal.date.isoformat(),
            "color": journal.color,
            "emoji": journal.emoji,
            "score": round(score, 4),
        }
        for journal, score in results
    ]
