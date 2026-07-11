import logging

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from db import get_session
from models import Journal, User
from rag.store import embed_journal
from schemas import JournalDeleteRequest, JournalEntry
from security import get_current_username

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["journal"])


def _get_user(session: Session, username: str) -> User:
    user = session.exec(select(User).where(User.username == username)).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user


def _embed_best_effort(session: Session, journal: Journal) -> None:
    # Semantic search over journals is a bonus feature — never fail the
    # save because the embeddings provider is down or rate-limited.
    try:
        embed_journal(session, journal)
    except Exception:
        logger.warning("Failed to embed journal %s; it just won't be semantically searchable.", journal.id, exc_info=True)


@router.post("/add-journal")
def add_journal(journal: JournalEntry, username: str = Depends(get_current_username), session: Session = Depends(get_session)):
    user = _get_user(session, username)

    existing = session.get(Journal, journal.id)
    if existing and existing.user_id == user.id:
        existing.title = journal.title
        existing.content = journal.content
        existing.date = journal.date
        existing.color = journal.color
        existing.emoji = journal.emoji
        session.add(existing)
        session.commit()
        _embed_best_effort(session, existing)
        return {"message": "Journal updated successfully"}

    db_journal = Journal(
        id=journal.id,
        user_id=user.id,
        title=journal.title,
        content=journal.content,
        date=journal.date,
        color=journal.color,
        emoji=journal.emoji,
    )
    session.add(db_journal)
    session.commit()
    _embed_best_effort(session, db_journal)
    return {"message": "Journal added successfully"}


@router.get("/get-journals")
def get_journals(username: str = Depends(get_current_username), session: Session = Depends(get_session)):
    user = _get_user(session, username)
    journals = session.exec(select(Journal).where(Journal.user_id == user.id)).all()
    return [
        {
            "id": j.id,
            "title": j.title,
            "content": j.content,
            "date": j.date.isoformat(),
            "color": j.color,
            "emoji": j.emoji,
        }
        for j in journals
    ]


@router.delete("/delete-journal")
def delete_journal(request: JournalDeleteRequest, username: str = Depends(get_current_username), session: Session = Depends(get_session)):
    user = _get_user(session, username)
    journal = session.get(Journal, request.id)

    if not journal or journal.user_id != user.id:
        return {"message": "No journal found with that ID"}

    session.delete(journal)
    session.commit()
    return {"message": "Journal deleted successfully"}
