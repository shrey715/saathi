# Saathi

An AI-powered mental wellness companion: a Next.js client backed by a FastAPI
service that routes conversations through a small LangGraph multi-agent
system, grounds responses in a retrieved knowledge base, and supports
journaling, mood tracking, and community posts.

See [ARCHITECTURE.md](ARCHITECTURE.md) for how it's built and why.

## Quick start (Docker)

The fastest way to run the full stack — client, API, and a Postgres +
pgvector database — is Docker Compose. It also seeds a demo account and
sample data so there's something to explore immediately.

```bash
cp .env.example .env
# edit .env: set JWT_SECRET_KEY (see the comment in the file for how to
# generate one) and MISTRAL_API_KEY (or swap in another provider — see
# server/.env.example)

docker compose up --build
```

- Client: <http://localhost:3000>
- API: <http://localhost:8000> (docs at `/docs`, health at `/api/health`)
- Log in with `demo` / `demo1234` — a seeded account with sample journals,
  mood history, and community posts. Disable this by setting
  `SEED_DEMO_DATA=false` before a real deployment (see
  `server/.env.example`).

## Features

- **Multi-agent chat**, routed by an LLM classifier to one of several
  specialists (guided coping, crisis support, behavioral health, wellness,
  psychological support, emotional validation), with an optional safety
  review pass before a response is returned.
- **Retrieval-augmented responses** — chat is grounded in a curated,
  embedded wellness resource corpus rather than relying purely on the
  model's own knowledge.
- **Semantic search** over that resource corpus and over your own journal
  entries, ranked by a blend of vector similarity and lexical overlap.
- **Mood-aware book recommendations** based on recent mood history.
- **Journaling** with per-entry mood tagging.
- **Mood tracking** — either a deliberate daily check-in or recorded
  automatically from chat's detected emotion; both feed the same history.
- **Mood-adaptive UI** — the app's color palette is a shared, live piece of
  state: setting your mood (or just chatting) re-tints the whole app in a
  flat, pastel wash of that mood's color, everywhere, automatically.
- **Community posts** with mood tags, likes, and optional anonymous
  posting — the real author is never exposed to other users on an
  anonymous post.
- **Explore page** — yoga, breathing exercises, quotes, wellness facts, and
  mood-based movie picks, all served from the database rather than
  hardcoded in the frontend.
- **Security & privacy** — per-IP rate limiting on signup/login, an audit
  log of auth events, and per-user data isolation enforced at the query
  layer (verified by tests, not just the UI).

## Tech stack

- **Client**: Next.js (App Router), TypeScript, Tailwind CSS v4, Radix UI
  primitives, lucide-react icons, Framer Motion. Fixed light theme with a
  playful, pastel, neumorphism-inspired design system.
- **API**: FastAPI, SQLModel/SQLAlchemy, JWT auth, bcrypt, slowapi for rate
  limiting.
- **AI**: LangChain + LangGraph, with a modular provider layer — Mistral,
  Groq, Google, any OpenAI-compatible endpoint (including a self-hosted
  model on another machine), or Ollama, swappable via environment
  variables only.
- **Storage**: Postgres + pgvector in production/Docker; SQLite with a
  brute-force cosine fallback for zero-config local development. Schema
  changes self-heal on startup (new columns on existing tables are
  patched additively — see `server/db.py`), since there's no separate
  migration framework.
- **Deployment**: Docker, Docker Compose.

## Local development (without Docker)

### Backend

Requires [uv](https://docs.astral.sh/uv/).

```bash
cd server
cp .env.example .env   # fill in JWT_SECRET_KEY and an LLM provider key
uv sync
uv run uvicorn main:app --reload
```

Defaults to a local SQLite file (`server/saathi.db`) — no database service
required. Run the test suite (uses fake, network-free LLM/embeddings
providers) with:

```bash
uv run pytest
```

### Frontend

Requires Node 22+.

```bash
cd client
cp .env.local.example .env.local   # or just set NEXT_PUBLIC_BACKEND_URL
npm install
npm run dev
```

## Configuration

Every environment-specific value is a variable, never hardcoded — see
`server/.env.example` and `client/.env.local.example` for the full list
with explanations. The two things every setup needs:

- `JWT_SECRET_KEY` (server) — no default; the app won't start without one.
- An LLM provider API key matching `LLM_PROVIDER` (server) — defaults to
  Mistral.

## Project structure

```text
client/   Next.js app
  src/app/               routes (one folder per page)
  src/lib/api.ts         typed backend client
  src/lib/mood-context.tsx   shared "current mood" state driving the
                          app-wide color wash — set from the home check-in
                          or chat's auto-detected emotion
  src/lib/*-icons.tsx     mood/emotion/category → icon + color lookups
  src/components/ui/     UI kit (shadcn-derived)
server/   FastAPI app
  agents/       LangGraph graph, specialist prompts, emotion + book helpers
  llm/          Modular chat-model and embeddings provider factories
  rag/          Embedding storage, similarity ranking, resource corpus seed
  routers/      auth, chat, journal, community, explore, search
  limiter.py    Shared slowapi rate limiter (signup/login)
  audit.py      Security event audit log writer
  demo_seed.py, explore_seed.py   One-time seed data for the demo account
                and the explore page's reference content
  tests/        pytest suite with fake LLM/embeddings providers
```
