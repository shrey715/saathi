from collections import defaultdict

from fastapi import APIRouter, Depends
from sqlmodel import Session, select

from db import get_session
from models import BreathingExercise, InspiringQuote, MovieRecommendation, WellnessFactEntry, YogaExercise
from security import get_current_username

router = APIRouter(prefix="/api/explore", tags=["explore"])


@router.get("/content")
def get_explore_content(username: str = Depends(get_current_username), session: Session = Depends(get_session)):
    """Everything the /explore page renders that isn't a per-user book
    recommendation (those stay in /api/get-books, mood-context-aware via
    the LLM) — bundled into one response since the page needs all of it
    on load anyway."""
    yoga = session.exec(select(YogaExercise)).all()
    breathing = session.exec(select(BreathingExercise)).all()
    quotes = session.exec(select(InspiringQuote)).all()
    facts = session.exec(select(WellnessFactEntry)).all()
    movies = session.exec(select(MovieRecommendation)).all()

    movies_by_mood: dict[str, list[dict]] = defaultdict(list)
    for m in movies:
        movies_by_mood[m.mood_category].append({
            "id": m.id, "title": m.title, "description": m.description,
            "year": m.year, "genre": m.genre, "tone": m.tone, "icon": m.icon,
        })

    return {
        "yoga": [
            {
                "id": y.id, "name": y.name, "description": y.description, "duration": y.duration,
                "level": y.level, "benefits": y.benefits, "tone": y.tone, "icon": y.icon,
            }
            for y in yoga
        ],
        "breathing": [
            {
                "id": b.id, "name": b.name, "description": b.description, "duration": b.duration,
                "steps": b.steps, "benefits": b.benefits, "tone": b.tone, "icon": b.icon,
            }
            for b in breathing
        ],
        "quotes": [
            {"id": q.id, "quote": q.quote, "author": q.author, "theme": q.theme, "tone": q.tone, "icon": q.icon}
            for q in quotes
        ],
        "facts": [
            {"id": f.id, "fact": f.fact, "source": f.source, "category": f.category, "tone": f.tone, "icon": f.icon}
            for f in facts
        ],
        "movies": dict(movies_by_mood),
    }
