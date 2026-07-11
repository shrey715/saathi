"""Demo data — seeded once on first startup against an empty database so
that anyone running `docker compose up` gets a fully populated app to
explore immediately: a login-ready account, a journal history (embedded,
so semantic journal search has something to find), mood history (so book
recommendations have real context to work from), and a community feed
with multiple authors and likes.

This is demo content, not a fixture for tests — tests build their own
minimal data (see server/tests/).
"""

import logging
from datetime import datetime, timedelta

from sqlmodel import Session, select

from models import CommunityPost, Journal, MoodEntry, PostLike, User
from rag.store import embed_journal
from security import hash_password

logger = logging.getLogger(__name__)

DEMO_USERNAME = "demo"
DEMO_PASSWORD = "demo1234"


def _days_ago(n: int) -> datetime:
    return datetime.now() - timedelta(days=n)


def _make_user(session: Session, username: str, gender: str, dob: str) -> User:
    user = User(username=username, password=hash_password(DEMO_PASSWORD), gender=gender, dob=dob)
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


def seed_if_empty(session: Session) -> None:
    if session.exec(select(User)).first():
        return

    logger.info("Seeding demo data (users, journals, mood history, community posts)...")

    demo = _make_user(session, DEMO_USERNAME, "prefer_not_to_say", "1996-04-12")
    maya = _make_user(session, "maya_chen", "female", "1994-08-22")
    alex = _make_user(session, "alex_rivera", "male", "1999-01-30")

    # --- Journals for the demo account, embedded for semantic search -----
    journal_entries = [
        ("Starting Fresh",
         "I've decided to start journaling again. It's been a while, but I want to build a habit "
         "of checking in with myself instead of letting thoughts pile up unspoken.", 21),
        ("Rough Week at Work",
         "This week has been a lot. Back-to-back meetings, a deadline that snuck up on me, and I "
         "feel like I haven't had a moment to breathe. I know I need better boundaries but it's "
         "hard when everything feels urgent.", 16),
        ("Small Wins",
         "Today I actually took a proper lunch break away from my desk. Small thing, but it made "
         "the afternoon so much more manageable. Trying to remember that rest isn't a reward, "
         "it's part of the work.", 12),
        ("Trouble Sleeping",
         "Lying awake again at 2am with my mind racing through tomorrow's to-do list. I know I "
         "should get up and do something calm instead of just lying there getting frustrated, "
         "but it's a hard habit to break.", 8),
        ("Weekend Reset",
         "Spent a couple hours outside today, no phone, just walking. It's amazing how much "
         "clearer my head feels after even a short amount of time in nature.", 4),
        ("Feeling Anxious About the Presentation",
         "I have a big presentation tomorrow and my stomach is in knots. Logically I know I'm "
         "prepared, but the what-ifs keep creeping in. Going to try a breathing exercise tonight.", 1),
    ]
    colors = ["#8A6FE8", "#4AD295", "#FF9F5A", "#5AA9FF", "#F355A0"]
    tags = ["note", "sparkle", "star", "thought", "pin"]
    for i, (title, content, days) in enumerate(journal_entries):
        journal = Journal(
            id=f"demo-journal-{i + 1}",
            user_id=demo.id,
            title=title,
            content=content,
            date=_days_ago(days),
            color=colors[i % len(colors)],
            emoji=tags[i % len(tags)],
        )
        session.add(journal)
        session.commit()
        try:
            embed_journal(session, journal)
        except Exception:
            logger.warning("Could not embed demo journal %s (embeddings provider unreachable?)", journal.id, exc_info=True)

    # --- Mood history for the demo account --------------------------------
    mood_entries = [
        ("hopeful", "I've decided to start journaling again.", 21),
        ("motivated", "Setting some goals for the month.", 19),
        ("concern", "Work has been a lot lately.", 16),
        ("supportive", "Talked it through with a friend, feeling a bit better.", 15),
        ("calm", "Took a proper lunch break today.", 12),
        ("reflective", "Thinking about how I want to spend my evenings.", 10),
        ("concern", "Having trouble sleeping again.", 8),
        ("warm", "Caught up with an old friend today.", 6),
        ("celebration", "Finished a project I'd been putting off!", 5),
        ("calm", "Spent time outside, felt recharged.", 4),
        ("empathetic", "Listened to a friend who was struggling.", 3),
        ("default", "Just a normal, steady day.", 2),
        ("concern", "Nervous about tomorrow's presentation.", 1),
    ]
    for emotion, message, days in mood_entries:
        session.add(MoodEntry(user_id=demo.id, emotion=emotion, message=message, timestamp=_days_ago(days)))
    session.commit()

    # --- Community posts across all three demo users ----------------------
    # The 2am post is seeded anonymous — it's the most sensitive share in
    # the batch, and demonstrates that anonymous posts really do hide the
    # author's username from other viewers (see routers/community.py).
    post_data = [
        (demo, "Finally finished a 5k run this morning, feeling proud of myself!", "proud", "🎉", "#FF9F5A", 9, False),
        (maya, "Trying to be more mindful about my screen time before bed. Anyone have tips that actually stuck?", "reflective", "🧠", "#F355A0", 8, False),
        (alex, "Anyone else find Sunday scaries hit different lately?", "anxious", "😰", "#FFC837", 7, False),
        (demo, "Grateful for my morning coffee ritual, it's the small things.", "peaceful", "✨", "#8A6FE8", 6, False),
        (maya, "Rough week, but reaching out here helps more than I expected.", "tired", "😴", "#5AA9FF", 5, False),
        (alex, "Celebrating 30 days of consistent journaling! Small streaks, big difference.", "proud", "🎉", "#FF9F5A", 4, False),
        (demo, "Does anyone have tips for quieting a racing mind around 2am?", "anxious", "😰", "#FFC837", 3, True),
        (maya, "Sunshine and a good playlist today. Simple joys.", "happy", "😊", "#4AD295", 2, False),
        (alex, "Slowly learning that rest is productive too.", "reflective", "🧠", "#F355A0", 1, False),
    ]
    posts = []
    for i, (author, content, mood, emoji, color, days, is_anonymous) in enumerate(post_data):
        post = CommunityPost(
            id=f"demo-post-{i + 1}",
            username=author.username,
            content=content,
            mood=mood,
            emoji=emoji,
            color=color,
            is_anonymous=is_anonymous,
            time_posted=_days_ago(days),
        )
        session.add(post)
        posts.append(post)
    session.commit()

    # A handful of cross-user likes so like counts aren't all zero.
    like_pairs = [
        (0, maya), (0, alex),
        (1, demo),
        (2, demo), (2, maya),
        (3, alex),
        (5, demo), (5, maya),
        (7, demo), (7, alex),
    ]
    for post_index, liker in like_pairs:
        post = posts[post_index]
        session.add(PostLike(post_id=post.id, username=liker.username))
        post.likes += 1
        session.add(post)
    session.commit()

    logger.info(
        "Demo data seeded — log in as '%s' / '%s'. %d journals, %d mood entries, %d community posts.",
        DEMO_USERNAME, DEMO_PASSWORD, len(journal_entries), len(mood_entries), len(posts),
    )
