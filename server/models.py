"""SQLModel table definitions.

Storage-adaptive embedding column: on Postgres we use pgvector for real ANN
similarity search (with an index); on SQLite (zero-config local dev) the
same field falls back to a plain JSON list of floats, searched with a
brute-force cosine scan in rag/store.py. Application code never needs to
know which one it's talking to.
"""

from datetime import datetime
from typing import Any, Optional

from sqlalchemy import JSON, Column
from sqlmodel import Field, SQLModel

from db import IS_POSTGRES

if IS_POSTGRES:
    from pgvector.sqlalchemy import Vector

    from llm.embeddings import get_embedding_dim

    _EmbeddingType = Vector(get_embedding_dim())
else:
    _EmbeddingType = JSON


class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(unique=True, index=True)
    password: str
    gender: str
    dob: str
    created_at: datetime = Field(default_factory=datetime.now)


class Journal(SQLModel, table=True):
    id: str = Field(primary_key=True)  # client-generated id
    user_id: int = Field(foreign_key="user.id", index=True)
    title: str
    content: str
    date: datetime
    color: str
    emoji: str
    embedding: Optional[Any] = Field(default=None, sa_column=Column(_EmbeddingType))


class MoodEntry(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    emotion: str
    timestamp: datetime = Field(default_factory=datetime.now)
    message: Optional[str] = None


class CommunityPost(SQLModel, table=True):
    id: str = Field(primary_key=True)
    # Real author, always stored — needed for the author's own "my posts"
    # view and for moderation. Never returned to other users when
    # is_anonymous is set; see routers/community.py for the masking.
    username: str
    content: str
    mood: str
    emoji: str
    color: str
    is_anonymous: bool = False
    time_posted: datetime = Field(default_factory=datetime.now)
    likes: int = 0


class PostLike(SQLModel, table=True):
    post_id: str = Field(foreign_key="communitypost.id", primary_key=True)
    username: str = Field(primary_key=True)


class AuditLog(SQLModel, table=True):
    """Security-relevant event trail: signups, logins, password changes.

    Kept separate from application logging (stdout) so it survives
    container restarts and can be queried — e.g. "how many failed logins
    for this username in the last hour" — without grepping log files.
    """

    id: Optional[int] = Field(default=None, primary_key=True)
    event_type: str = Field(index=True)  # "signup" | "login" | "password_change"
    username: Optional[str] = Field(default=None, index=True)
    ip_address: Optional[str] = None
    success: bool = True
    detail: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.now, index=True)


class WellnessResource(SQLModel, table=True):
    """Curated knowledge base grounding chat responses and powering /api/search."""

    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    content: str
    category: str
    embedding: Optional[Any] = Field(default=None, sa_column=Column(_EmbeddingType))


# --- Explore page content -------------------------------------------------
# Plain reference content (yoga poses, breathing techniques, quotes, facts,
# mood-based movie picks) for the /explore page. Previously hardcoded in the
# frontend bundle; moved server-side and seeded once (see explore_seed.py)
# so it's real data behind an API, not UI-baked content. `tone` is a
# MoodTone value and `icon` a lucide-react icon name, both resolved to
# actual colors/components client-side — never a raw hex or JSX in the DB.

class YogaExercise(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    description: str
    duration: str
    level: str
    benefits: list[str] = Field(sa_column=Column(JSON))
    tone: str
    icon: str


class BreathingExercise(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    description: str
    duration: str
    steps: list[str] = Field(sa_column=Column(JSON))
    benefits: list[str] = Field(sa_column=Column(JSON))
    tone: str
    icon: str


class InspiringQuote(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    quote: str
    author: str
    theme: str
    tone: str
    icon: str


class WellnessFactEntry(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    fact: str
    source: str
    category: str
    tone: str
    icon: str


class MovieRecommendation(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    description: str
    year: int
    genre: str
    tone: str
    icon: str
    mood_category: str  # "anxiety" | "sadness" | "stress" | "inspiration"
