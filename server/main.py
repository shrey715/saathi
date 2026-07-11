"""Saathi API entrypoint."""

import logging
from contextlib import asynccontextmanager

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from sqlmodel import Session

import demo_seed
import explore_seed
from config import settings
from db import engine, init_db
from limiter import limiter
from rag.seed import seed_if_empty
from routers import auth, chat, community, explore, journal, search

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    try:
        with Session(engine) as session:
            seed_if_empty(session)
    except Exception:
        # Don't block startup on the embeddings provider being unreachable —
        # the app is still usable without the seeded corpus, just without
        # chat grounding / /api/search results until it's seeded later.
        logger.warning("Could not seed wellness resource corpus at startup.", exc_info=True)

    if settings.seed_demo_data:
        try:
            with Session(engine) as session:
                demo_seed.seed_if_empty(session)
        except Exception:
            logger.warning("Could not seed demo data at startup.", exc_info=True)

    with Session(engine) as session:
        explore_seed.seed_if_empty(session)

    yield


app = FastAPI(title="Saathi API", lifespan=lifespan)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(chat.router)
app.include_router(journal.router)
app.include_router(community.router)
app.include_router(explore.router)
app.include_router(search.router)


@app.get("/api/health")
def health():
    return {"status": "ok"}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=settings.port, reload=False)
