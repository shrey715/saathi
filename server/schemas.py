"""Pydantic request/response models shared across routers."""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class UserSignup(BaseModel):
    username: str
    password: str
    gender: str
    dob: str  # "YYYY-MM-DD"


class UserLogin(BaseModel):
    username: str
    password: str


class UserUpdate(BaseModel):
    gender: Optional[str] = None
    dob: Optional[str] = None
    currentPassword: Optional[str] = None
    newPassword: Optional[str] = None


class JournalEntry(BaseModel):
    id: str
    title: str
    content: str
    date: datetime
    color: str
    emoji: str


class JournalDeleteRequest(BaseModel):
    id: str


class ChatMessage(BaseModel):
    message: str


class MoodSet(BaseModel):
    emotion: str
    message: Optional[str] = None


class PostBase(BaseModel):
    content: str
    mood: str
    emoji: str
    color: str


class PostCreate(PostBase):
    is_anonymous: bool = False


class PostInDB(PostBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    # None when the author posted anonymously — the real username is never
    # sent to the client in that case, only known server-side.
    username: Optional[str]
    is_anonymous: bool = False
    timePosted: datetime
    likes: int = 0
    liked: bool = False


class PostLikeRequest(BaseModel):
    id: str
