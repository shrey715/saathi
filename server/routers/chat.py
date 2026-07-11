import logging
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from langchain_core.messages import HumanMessage
from sqlmodel import Session, select

from agents.books import recommend_books
from agents.emotion import detect_emotion
from agents.graph import get_graph
from db import get_session
from models import MoodEntry, User
from schemas import ChatMessage, MoodSet
from security import get_current_username

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["chat"])

# In-memory thread-id map, one active conversation thread per username.
# Ephemeral by design (mirrors the previous implementation): restarting the
# process or calling /reset-chat both start a fresh thread.
_user_threads: dict[str, str] = {}


def _thread_id(username: str) -> str:
    if username not in _user_threads:
        _user_threads[username] = f"thread_{username}_{datetime.now().timestamp()}"
    return _user_threads[username]


def _get_user(session: Session, username: str) -> User:
    user = session.exec(select(User).where(User.username == username)).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user


@router.post("/chat")
def chat(chat_data: ChatMessage, username: str = Depends(get_current_username), session: Session = Depends(get_session)):
    thread_id = _thread_id(username)
    try:
        result = get_graph().invoke(
            {"messages": [HumanMessage(content=chat_data.message)]},
            config={"configurable": {"thread_id": thread_id}},
        )
        response = result["messages"][-1].content
        emotion = detect_emotion(response)

        user = _get_user(session, username)
        session.add(MoodEntry(user_id=user.id, emotion=emotion, message=chat_data.message))
        session.commit()

        return {"response": response, "emotion": emotion}
    except Exception as exc:
        logger.exception("Error processing chat message")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Agent processing error: {exc}",
        )


@router.post("/reset-chat")
def reset_chat(username: str = Depends(get_current_username)):
    _user_threads[username] = f"thread_{username}_{datetime.now().timestamp()}"
    return {"message": "Chat thread reset successfully"}


@router.get("/get-mood-history")
def get_mood_history(username: str = Depends(get_current_username), session: Session = Depends(get_session)):
    user = _get_user(session, username)
    moods = session.exec(select(MoodEntry).where(MoodEntry.user_id == user.id)).all()
    return [
        {"emotion": m.emotion, "timestamp": m.timestamp.isoformat(), "message": m.message}
        for m in moods
    ]


@router.post("/set-mood")
def set_mood(mood: MoodSet, username: str = Depends(get_current_username), session: Session = Depends(get_session)):
    """Directly log a mood entry — the daily check-in on the home page,
    independent of chat's automatic emotion detection."""
    user = _get_user(session, username)
    entry = MoodEntry(user_id=user.id, emotion=mood.emotion, message=mood.message)
    session.add(entry)
    session.commit()
    session.refresh(entry)
    return {"emotion": entry.emotion, "timestamp": entry.timestamp.isoformat(), "message": entry.message}


@router.post("/get-books")
def get_books(username: str = Depends(get_current_username), session: Session = Depends(get_session)):
    user = _get_user(session, username)
    latest = session.exec(
        select(MoodEntry).where(MoodEntry.user_id == user.id).order_by(MoodEntry.timestamp.desc())
    ).first()

    mood_context = ""
    if latest:
        mood_context = f"User's latest recorded emotion is '{latest.emotion}'. "
        if latest.message:
            mood_context += f"Context for this emotion: '{latest.message}'. "

    try:
        return recommend_books(mood_context)
    except Exception as exc:
        logger.exception("Error fetching book recommendations")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching book recommendations: {exc}",
        )
