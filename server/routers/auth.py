import logging
from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlmodel import Session, select

import audit
from config import settings
from db import get_session
from limiter import limiter
from models import Journal, MoodEntry, User
from schemas import UserLogin, UserSignup, UserUpdate
from security import create_access_token, get_current_username, hash_password, verify_password

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["auth"])

# Deliberately generous compared to the login limit — a legitimate user
# rarely signs up more than once, but shares an office/NAT IP with others.
SIGNUP_RATE_LIMIT = "10/minute"
# Tight enough to make password brute-forcing impractical without locking
# out a user who mistypes their password a few times in a row.
LOGIN_RATE_LIMIT = "5/minute"


@router.post("/signup")
@limiter.limit(SIGNUP_RATE_LIMIT)
def signup(request: Request, user: UserSignup, session: Session = Depends(get_session)):
    existing = session.exec(select(User).where(User.username == user.username)).first()
    if existing:
        audit.record(session, event_type="signup", request=request, username=user.username,
                     success=False, detail="username already exists")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already exists")

    session.add(User(
        username=user.username,
        password=hash_password(user.password),
        gender=user.gender,
        dob=user.dob,
    ))
    session.commit()
    audit.record(session, event_type="signup", request=request, username=user.username, success=True)
    return {"message": "User created successfully"}


@router.post("/login")
@limiter.limit(LOGIN_RATE_LIMIT)
def login(request: Request, user: UserLogin, session: Session = Depends(get_session)):
    db_user = session.exec(select(User).where(User.username == user.username)).first()
    if not db_user or not verify_password(user.password, db_user.password):
        audit.record(session, event_type="login", request=request, username=user.username,
                     success=False, detail="incorrect username or password")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(
        data={"sub": user.username},
        expires_delta=timedelta(minutes=settings.access_token_expire_minutes),
    )
    audit.record(session, event_type="login", request=request, username=user.username, success=True)
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/update-user")
def update_user(
    update: UserUpdate,
    request: Request,
    username: str = Depends(get_current_username),
    session: Session = Depends(get_session),
):
    user = session.exec(select(User).where(User.username == username)).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if update.currentPassword and update.newPassword:
        if not verify_password(update.currentPassword, user.password):
            audit.record(session, event_type="password_change", request=request, username=username,
                         success=False, detail="incorrect current password")
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Incorrect current password")
        user.password = hash_password(update.newPassword)
        audit.record(session, event_type="password_change", request=request, username=username, success=True)

    if update.gender is not None:
        user.gender = update.gender
    if update.dob is not None:
        user.dob = update.dob

    session.add(user)
    session.commit()
    return {"message": "User details updated successfully"}


@router.get("/get-user-details")
def get_user_details(username: str = Depends(get_current_username), session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.username == username)).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    journals = session.exec(select(Journal).where(Journal.user_id == user.id)).all()
    moods = session.exec(select(MoodEntry).where(MoodEntry.user_id == user.id)).all()

    return {
        "username": user.username,
        "gender": user.gender,
        "dob": user.dob,
        "created_at": user.created_at.isoformat(),
        "journals": [
            {
                "id": j.id,
                "title": j.title,
                "content": j.content,
                "date": j.date.isoformat(),
                "color": j.color,
                "emoji": j.emoji,
            }
            for j in journals
        ],
        "mood_history": [
            {"emotion": m.emotion, "timestamp": m.timestamp.isoformat(), "message": m.message}
            for m in moods
        ],
    }
