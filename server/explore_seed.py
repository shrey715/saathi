"""Seeds the /explore page's reference content (yoga, breathing, quotes,
wellness facts, mood-based movie picks) — moved here from what used to be
hardcoded arrays in the frontend, so it's real data behind an API rather
than UI-baked content. Runs once, only when the tables are empty, same
pattern as demo_seed.py and rag/seed.py.
"""

import logging

from sqlmodel import Session, select

from models import BreathingExercise, InspiringQuote, MovieRecommendation, WellnessFactEntry, YogaExercise

logger = logging.getLogger(__name__)


def seed_if_empty(session: Session) -> None:
    if session.exec(select(YogaExercise)).first() is not None:
        return

    logger.info("Seeding explore page content...")

    session.add_all([
        YogaExercise(
            name="Mountain Pose (Tadasana)",
            description="A foundational standing pose that improves posture, balance, and calm focus.",
            duration="5 min", level="Beginner",
            benefits=["Improves posture", "Reduces anxiety", "Increases body awareness"],
            tone="focus", icon="Mountain",
        ),
        YogaExercise(
            name="Child's Pose (Balasana)",
            description="A restful pose that gently stretches the hips, thighs, and ankles while calming the mind.",
            duration="3 min", level="Beginner",
            benefits=["Relieves stress", "Calms the nervous system", "Stretches the back"],
            tone="tender", icon="Feather",
        ),
        YogaExercise(
            name="Downward-Facing Dog (Adho Mukha Svanasana)",
            description="An energizing pose that stretches and strengthens the whole body.",
            duration="5 min", level="Intermediate",
            benefits=["Strengthens arms and legs", "Stretches shoulders and hamstrings", "Increases energy"],
            tone="growth", icon="Dog",
        ),
        YogaExercise(
            name="Corpse Pose (Savasana)",
            description="A rejuvenating pose of complete relaxation to integrate the benefits of practice.",
            duration="10 min", level="Beginner",
            benefits=["Deep relaxation", "Reduces blood pressure", "Calms the mind"],
            tone="calm", icon="Moon",
        ),
    ])

    session.add_all([
        BreathingExercise(
            name="Box Breathing",
            description="Inhale, hold, exhale, and hold again for equal counts to reduce stress and improve focus.",
            duration="5 min",
            steps=[
                "Inhale through nose for 4 counts", "Hold breath for 4 counts",
                "Exhale through mouth for 4 counts", "Hold breath for 4 counts", "Repeat cycle",
            ],
            benefits=["Reduces stress", "Improves concentration", "Manages anxiety"],
            tone="calm", icon="Wind",
        ),
        BreathingExercise(
            name="4-7-8 Breathing",
            description="A relaxing breath pattern that acts as a natural tranquilizer for the nervous system.",
            duration="3 min",
            steps=[
                "Inhale quietly through nose for 4 counts", "Hold breath for 7 counts",
                "Exhale completely through mouth for 8 counts", "Repeat cycle 3-4 times",
            ],
            benefits=["Reduces anxiety", "Helps with sleep", "Manages cravings"],
            tone="focus", icon="Moon",
        ),
        BreathingExercise(
            name="Alternate Nostril Breathing",
            description="Balances the left and right hemispheres of the brain for improved well-being.",
            duration="7 min",
            steps=[
                "Close right nostril, inhale through left", "Close left nostril, exhale through right",
                "Inhale through right nostril", "Close right, exhale through left", "Continue alternating",
            ],
            benefits=["Balances nervous system", "Enhances mental clarity", "Reduces stress"],
            tone="growth", icon="Waves",
        ),
    ])

    session.add_all([
        InspiringQuote(
            quote="You don't have to see the whole staircase, just take the first step.",
            author="Martin Luther King Jr.", theme="Progress", tone="growth", icon="Footprints",
        ),
        InspiringQuote(
            quote="The most beautiful things in the world cannot be seen or even touched, "
                  "they must be felt with the heart.",
            author="Helen Keller", theme="Beauty", tone="tender", icon="Heart",
        ),
        InspiringQuote(
            quote="It is never too late to be what you might have been.",
            author="George Eliot", theme="Possibility", tone="focus", icon="Sparkles",
        ),
        InspiringQuote(
            quote="The way I see it, if you want the rainbow, you gotta put up with the rain.",
            author="Dolly Parton", theme="Resilience", tone="joy", icon="Rainbow",
        ),
        InspiringQuote(
            quote="You are never too old to set another goal or to dream a new dream.",
            author="C.S. Lewis", theme="Dreams", tone="calm", icon="Star",
        ),
    ])

    session.add_all([
        WellnessFactEntry(
            fact="Spending just 20 minutes in nature can significantly lower stress hormone levels.",
            source="Frontiers in Psychology", category="Nature", tone="calm", icon="Leaf",
        ),
        WellnessFactEntry(
            fact="Hugging for 20 seconds or more releases oxytocin, which can reduce stress and "
                 "create a sense of bonding.",
            source="Journal of Psychosomatic Research", category="Connection", tone="tender", icon="HeartHandshake",
        ),
        WellnessFactEntry(
            fact="Singing releases endorphins, serotonin and dopamine, promoting feelings of pleasure "
                 "and well-being.",
            source="Evolution and Human Behavior", category="Expression", tone="joy", icon="Music2",
        ),
        WellnessFactEntry(
            fact="Keeping a gratitude journal can increase long-term well-being by more than 10%.",
            source="Harvard Health", category="Gratitude", tone="growth", icon="BookOpen",
        ),
        WellnessFactEntry(
            fact="Dancing combines the benefits of physical exercise with social connection and has "
                 "been shown to reduce the risk of dementia by 76%.",
            source="New England Journal of Medicine", category="Movement", tone="focus", icon="Dumbbell",
        ),
    ])

    session.add_all([
        MovieRecommendation(
            title="Inside Out",
            description="A heartwarming animated film that explores emotions in a thoughtful way, "
                         "helping viewers understand and process their feelings.",
            year=2015, genre="Animation/Comedy", tone="tender", icon="HeartHandshake", mood_category="anxiety",
        ),
        MovieRecommendation(
            title="The Secret Life of Walter Mitty",
            description="An uplifting adventure that inspires viewers to embrace life's uncertainties "
                         "and find courage.",
            year=2013, genre="Adventure/Comedy", tone="joy", icon="Globe", mood_category="anxiety",
        ),
        MovieRecommendation(
            title="Soul",
            description="A moving exploration of what makes life worth living, perfect for finding "
                         "meaning during difficult times.",
            year=2020, genre="Animation/Adventure", tone="focus", icon="Sparkles", mood_category="sadness",
        ),
        MovieRecommendation(
            title="Amélie",
            description="A whimsical French film about finding joy in small things and spreading "
                         "happiness to others.",
            year=2001, genre="Comedy/Romance", tone="tender", icon="Heart", mood_category="sadness",
        ),
        MovieRecommendation(
            title="My Neighbor Totoro",
            description="A gentle, comforting film with beautiful animation that provides an escape "
                         "from life's pressures.",
            year=1988, genre="Animation/Fantasy", tone="calm", icon="Leaf", mood_category="stress",
        ),
        MovieRecommendation(
            title="The Mitchells vs. the Machines",
            description="A fun, chaotic adventure that will have you laughing and forgetting your worries.",
            year=2021, genre="Animation/Comedy", tone="joy", icon="Bot", mood_category="stress",
        ),
        MovieRecommendation(
            title="Wonder",
            description="An inspiring story about kindness, acceptance, and the impact we have on "
                         "each other's lives.",
            year=2017, genre="Drama/Family", tone="growth", icon="Star", mood_category="inspiration",
        ),
        MovieRecommendation(
            title="The Pursuit of Happyness",
            description="Based on a true story of perseverance and determination through extreme hardship.",
            year=2006, genre="Biography/Drama", tone="focus", icon="Briefcase", mood_category="inspiration",
        ),
    ])

    session.commit()
