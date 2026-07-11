"""Curated wellness resource corpus — the knowledge base chat grounds on and
/api/search queries. Seeded once, on first startup with an empty table.
"""

import logging

from sqlmodel import Session, select

from models import WellnessResource
from rag.store import add_resource

logger = logging.getLogger(__name__)

RESOURCES = [
    ("Box breathing for acute anxiety", "Inhale for 4 counts, hold for 4, exhale for 4, hold for 4. Repeat for two minutes. Slowing the exhale activates the parasympathetic nervous system and lowers heart rate within seconds.", "anxiety"),
    ("The 5-4-3-2-1 grounding technique", "Name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, 1 you can taste. This interrupts spiraling thoughts by redirecting attention to concrete sensory input.", "anxiety"),
    ("Worry postponement", "When an intrusive worry shows up, jot it down and schedule a fixed 15-minute 'worry time' later in the day. Most worries lose urgency by the time that slot arrives.", "anxiety"),
    ("Sleep hygiene basics", "Keep a consistent wake time even on weekends, avoid screens for 30 minutes before bed, and keep the bedroom cool and dark. Consistency in wake time matters more than bedtime for regulating circadian rhythm.", "sleep"),
    ("What to do when you can't fall asleep", "If you're not asleep after 20 minutes, get up and do something calm and dim-lit until you feel drowsy, then return to bed. Lying awake trains your brain to associate the bed with wakefulness.", "sleep"),
    ("Progressive muscle relaxation", "Tense each muscle group for 5 seconds, then release, working from feet to head. The contrast between tension and release teaches your body what relaxation actually feels like.", "sleep"),
    ("The physiological sigh for fast stress relief", "Two short inhales through the nose followed by one long exhale through the mouth. This is the fastest known voluntary way to lower real-time stress and arousal.", "stress"),
    ("Time-blocking to reduce overwhelm", "Break a large task into 25-minute focused blocks with 5-minute breaks. Overwhelm often comes from treating a whole project as one unit rather than a sequence of small ones.", "stress"),
    ("Recognizing burnout vs. ordinary tiredness", "Burnout includes cynicism and detachment from work you used to care about, not just fatigue. Rest alone doesn't fix it — the underlying workload or mismatch usually needs to change too.", "stress"),
    ("A 3-minute breathing space", "Pause, notice what's present in your thoughts and body without judgment, then narrow attention to the breath, then widen it back out to the whole body. A compact reset for the middle of a busy day.", "mindfulness"),
    ("Noting practice for racing thoughts", "Silently label each thought as it arises — 'planning,' 'worrying,' 'remembering' — without engaging with its content. Naming a thought creates a small gap between you and it.", "mindfulness"),
    ("Mindful eating in five minutes", "Eat one small bite with full attention to texture, taste, and smell before returning to normal pace. It's a low-effort way to practice present-moment awareness without setting aside extra time.", "mindfulness"),
    ("Setting a boundary without over-explaining", "State the boundary plainly and stop — 'I can't take this on right now' is a complete sentence. Over-justifying a boundary invites negotiation over something that isn't up for negotiation.", "relationships"),
    ("Repairing after a conflict", "A genuine repair names the specific impact of what happened, not just 'sorry you're upset.' Specificity is what makes an apology land as sincere rather than reflexive.", "relationships"),
    ("Active listening in one sentence", "Reflect back what you heard before responding with your own view — it costs ten seconds and prevents most miscommunication. Most conflicts escalate because neither side feels heard yet.", "relationships"),
    ("Reframing a setback", "Ask 'what does this make possible now?' instead of only 'why did this happen?' Both questions are valid, but only one of them points forward.", "self-esteem"),
    ("The self-compassion break", "Notice the pain, remind yourself difficulty is part of being human, and offer yourself the same kindness you'd offer a friend. Self-criticism rarely improves performance — it mostly just adds suffering on top of the setback.", "self-esteem"),
    ("Separating your worth from your output", "Productivity measures what you did today; it doesn't measure your value as a person. Conflating the two is a fast route to burnout and chronic low self-esteem.", "self-esteem"),
    ("Grief has no fixed timeline", "The 'five stages' model was never meant to be linear or universal — grief moves in waves, and returning to sadness after weeks of feeling okay isn't a regression. There is no correct pace for grieving.", "grief"),
    ("Continuing bonds after loss", "Maintaining a relationship with someone who died — talking to them, keeping a ritual — is a healthy part of grieving for most people, not a sign of being 'stuck.' Grief researchers stopped treating this as pathological decades ago.", "grief"),
    ("Behavioral activation for low motivation", "Schedule one small, concrete, achievable action today rather than waiting to feel motivated first. Motivation reliably follows action more often than it precedes it.", "motivation"),
    ("The two-minute rule for getting started", "If a task takes less than two minutes, do it immediately; if it's larger, commit to just the first two minutes of it. Starting is almost always the hardest part of any task.", "motivation"),
    ("Habit stacking", "Attach a new small habit to an existing one you already do reliably — 'after I pour my coffee, I'll write one line in my journal.' Anchoring to an existing routine removes the need to remember on your own.", "motivation"),
    ("Recognizing catastrophizing", "Catastrophizing jumps straight to the worst-case outcome and treats it as the likely one. Asking 'what's the most probable outcome, not just the worst possible one?' is a concrete way to interrupt it.", "cognitive-patterns"),
    ("Cognitive defusion for self-critical thoughts", "Prefix the thought with 'I'm having the thought that...' — e.g. 'I'm having the thought that I'm failing.' This small shift creates distance between you and the thought instead of fusing with it as fact.", "cognitive-patterns"),
]


def seed_if_empty(session: Session) -> None:
    existing = session.exec(select(WellnessResource)).first()
    if existing:
        return

    logger.info("Seeding wellness resource corpus (%d entries)...", len(RESOURCES))
    for title, content, category in RESOURCES:
        add_resource(session, title=title, content=content, category=category)
    logger.info("Wellness resource corpus seeded.")
