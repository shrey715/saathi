"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
  Activity,
  Brain,
  Check,
  ChevronRight,
  Gem,
  Hand,
  HeartHandshake,
  type LucideIcon,
  Moon,
  Music2,
  NotebookPen,
  PartyPopper,
  Rainbow,
  Rocket,
  Sparkle,
  Sparkles,
  Star,
  Sun,
  Target,
  Trees,
  Trophy,
  Users,
  Wand2,
  Wind,
  Zap,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from "framer-motion";
import { toast } from 'sonner';
import { useAuthGuard } from '@/hooks/use-auth-guard';
import { MoodFace } from '@/components/MoodFace';
import { chatApi, type MoodEntryDTO } from '@/lib/api';
import { useMood } from '@/lib/mood-context';
import { MOODS, resolveMoodTone } from '@/lib/mood-icons';
import { type MoodTone, moodVar, toneClasses } from '@/lib/mood-tone';

// Define the UserType interface
interface UserType {
  id?: string;
  username?: string;
  name?: string;
  email?: string;
  dob?: string;
  age?: number | null;
  journalCount?: number;
  joinDate?: Date | null;
  created_at?: string;
  createdAt?: string;
  journals?: unknown[];
}

const enhanceUser = (data: UserType | null): UserType | null => {
  if (!data) return null;
  return {
    ...data,
    name: data.username,
    age: data.dob ? calculateAge(data.dob) : null,
    journalCount: Array.isArray(data.journals) ? data.journals.length : 0,
    joinDate: data.created_at || data.createdAt ? new Date(data.created_at || data.createdAt || '') : null,
  };
};

const HomePage = () => {
  const [currentDay] = useState(7);
  const [totalDays] = useState(30);
  const { user: rawUser, isLoading } = useAuthGuard();
  const user = enhanceUser(rawUser);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
        <p className="mt-4 text-muted-foreground font-medium">Loading ...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 md:px-8 md:pt-8">
        <div className="pt-6 pb-2">
          <MoodCheckIn displayName={user?.username || "Friend"} />
        </div>
        <JourneyPath currentDay={currentDay} totalDays={totalDays} />
        <FeatureGrid />
      </div>
    </div>
  );
};

// Icon rotation and motivational phrases for the day-streak celebration
const dayIcons: LucideIcon[] = [Rainbow, Star, Sparkle, Sparkles, Wand2, PartyPopper, Target, Rocket, Gem, Sun, Trophy, Zap];
const motivationalPhrases = [
  "You're awesome!",
  "Keep shining!",
  "Great job!",
  "You rock!",
  "Fantastic!",
  "Superstar!",
  "Keep going!",
  "You got this!",
  "Woo-hoo!",
  "Brilliant!",
  "Epic progress!",
  "Unstoppable!"
];

const calculateAge = (dob?: string): number | null => {
  if (!dob) return null;

  const birthDate = new Date(dob);
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();

  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
};

const mentalHealthFacts: { fact: string; source: string; icon: LucideIcon }[] = [
  { fact: "Regular meditation can reduce anxiety by up to 39%.", source: "JAMA Internal Medicine", icon: Brain },
  { fact: "Just 30 minutes of physical activity can improve your mood for up to 12 hours.", source: "American Psychological Association", icon: Activity },
  { fact: "Keeping a gratitude journal can increase happiness by 25%.", source: "Harvard Health", icon: NotebookPen },
  { fact: "Deep breathing can reduce stress hormones in the blood within minutes.", source: "Mayo Clinic", icon: Wind },
  { fact: "Getting 7-9 hours of sleep improves mental performance by 35%.", source: "Sleep Foundation", icon: Moon },
  { fact: "Social connections can improve your chances of longevity by 50%.", source: "National Institute on Aging", icon: Users },
  { fact: "Spending just 20 minutes in nature decreases stress hormone levels.", source: "Frontiers in Psychology", icon: Trees },
  { fact: "Mindfulness practice can actually change the structure of your brain.", source: "Harvard Neuroscience", icon: Sparkles },
];

interface ActivitySpec {
  type: string;
  icon: LucideIcon;
  tone: MoodTone;
  name: string;
}

const activities: ActivitySpec[] = [
  { type: "meditation", icon: Wind, tone: "calm", name: "Meditation" },
  { type: "journal", icon: NotebookPen, tone: "focus", name: "Journaling" },
  { type: "exercise", icon: Activity, tone: "growth", name: "Exercise" },
  { type: "mood", icon: Sparkle, tone: "joy", name: "Mood Check" },
  { type: "gratitude", icon: HeartHandshake, tone: "tender", name: "Gratitude" },
  { type: "mindfulness", icon: Brain, tone: "focus", name: "Mindfulness" },
  { type: "music", icon: Music2, tone: "joy", name: "Music" },
];

// The 7 self-report moods line up 1:1 with the 7 mood tones — see
// lib/mood-icons.tsx. Order kept stable for the picker grid.
const MOOD_CHECKIN_OPTIONS = Object.entries(MOODS).map(([name, spec]) => ({ name, ...spec }));

/** Flagship interactive moment: a full-bleed, mood-colored card with a big
 * illustrated face and a live "Set Mood" picker. Distinct from chat's
 * automatic emotion detection — this is the deliberate daily check-in. */
const MoodCheckIn = ({ displayName }: { displayName: string }) => {
  const [history, setHistory] = useState<MoodEntryDTO[]>([]);
  const [selected, setSelected] = useState<{ name: string; tone: MoodTone } | null>(null);
  const [isPicking, setIsPicking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { setMood } = useMood();

  useEffect(() => {
    chatApi.moodHistory().then(setHistory).catch(() => {});
  }, []);

  const sortedHistory = [...history].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  const latest = sortedHistory[sortedHistory.length - 1];
  const displayTone: MoodTone = selected?.tone ?? (latest ? resolveMoodTone(latest.emotion) : "calm");
  const displayLabel = selected?.name ?? latest?.emotion ?? "good";
  const trail = sortedHistory.slice(-7);

  const handlePick = async (name: string, tone: MoodTone) => {
    setSelected({ name, tone });
    setMood(name, tone);
    setIsPicking(false);
    setIsSaving(true);
    try {
      const entry = await chatApi.setMood(name);
      setHistory((prev) => [...prev, entry]);
      toast.success(`Mood set to ${name}`);
    } catch {
      toast.error("Couldn't save your mood — try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div
      className="rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-neu-sm"
      style={{ backgroundColor: moodVar(displayTone) }}
    >
      <p className="text-sm font-medium text-white/85 flex items-center gap-1.5">
        <Hand className="h-4 w-4" /> Hey {displayName}!
      </p>
      <h1 className="font-display text-3xl sm:text-4xl font-extrabold leading-tight mt-1 mb-6 text-balance">
        How are you feeling today?
      </h1>

      <div className="flex flex-col items-center py-2">
        <MoodFace tone={displayTone} size={128} />
        <div className="mt-4 inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-semibold capitalize">
          I&apos;m feeling {displayLabel}
        </div>
      </div>

      {trail.length > 0 && (
        <div className="flex items-center justify-center gap-1 mt-6" aria-hidden="true">
          {trail.map((entry, i) => (
            <React.Fragment key={`${entry.timestamp}-${i}`}>
              {i > 0 && <span className="w-4 h-0.5 bg-white/30" />}
              <span
                className="rounded-full bg-white transition-all"
                style={{
                  width: i === trail.length - 1 ? 12 : 8,
                  height: i === trail.length - 1 ? 12 : 8,
                  opacity: i === trail.length - 1 ? 1 : 0.5,
                }}
              />
            </React.Fragment>
          ))}
        </div>
      )}

      <div className="mt-6 flex justify-center">
        <AnimatePresence mode="wait">
          {!isPicking ? (
            <motion.button
              key="trigger"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={() => setIsPicking(true)}
              disabled={isSaving}
              className="inline-flex items-center gap-2 bg-white text-foreground font-semibold px-5 py-2.5 rounded-full shadow-neu-sm hover:scale-105 active:scale-95 transition-transform disabled:opacity-60"
            >
              Set Mood <Check className="h-4 w-4" />
            </motion.button>
          ) : (
            <motion.div
              key="picker"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="grid grid-cols-4 sm:grid-cols-7 gap-1.5 bg-white/10 backdrop-blur-sm p-2.5 rounded-2xl"
            >
              {MOOD_CHECKIN_OPTIONS.map((opt) => (
                <button
                  key={opt.name}
                  onClick={() => handlePick(opt.name, opt.tone)}
                  className="flex flex-col items-center gap-1 px-2 py-2 rounded-xl hover:bg-white/15 transition-colors"
                >
                  <opt.icon className="h-5 w-5" />
                  <span className="text-[10px] capitalize font-medium">{opt.name}</span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

const JourneyPath = ({ currentDay, totalDays }: { currentDay: number; totalDays: number }) => {
  const [currentFact, setCurrentFact] = useState(0);
  const [currentIcon, setCurrentIcon] = useState(0);
  const [currentPhrase, setCurrentPhrase] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const generateDays = () => {
    return Array.from({ length: totalDays }, (_, i) => {
      const activity = activities[i % activities.length];
      const dayNumber = i + 1;
      const completed = dayNumber <= currentDay;
      const isCurrent = dayNumber === currentDay;
      const isSpecial = dayNumber % 5 === 0;
      const icon = dayIcons[i % dayIcons.length];
      const phrase = motivationalPhrases[i % motivationalPhrases.length];

      return {
        day: dayNumber,
        completed,
        isCurrent,
        isSpecial,
        activity,
        icon,
        phrase,
        waveFactor: Math.sin(dayNumber * 0.5) * 10,
      };
    });
  };

  const days = generateDays();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIcon((prev) => (prev + 1) % dayIcons.length);
      setCurrentPhrase((prev) => (prev + 1) % motivationalPhrases.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const currentDayElement = container.querySelector('.current-day');
      if (currentDayElement) {
        const containerWidth = container.clientWidth;
        const elementLeft = (currentDayElement as HTMLElement).offsetLeft;
        const elementWidth = (currentDayElement as HTMLElement).clientWidth;
        const scrollPosition = elementLeft - (containerWidth / 2) + (elementWidth / 2);
        container.scrollTo({ left: scrollPosition, behavior: 'smooth' });
      }
    }
  }, [currentDay]);

  useEffect(() => {
    const tipTimer = setInterval(() => {
      setCurrentFact((prev) => (prev + 1) % mentalHealthFacts.length);
    }, 4000);
    return () => clearInterval(tipTimer);
  }, []);

  const CurrentDayIcon = dayIcons[currentIcon];
  const TodayIcon = days[currentDay - 1].icon;
  const TodayActivityIcon = days[currentDay - 1].activity.icon;
  const FactIcon = mentalHealthFacts[currentFact].icon;
  const todayTone = toneClasses(days[currentDay - 1].activity.tone);

  const getMilestoneIcon = (day: number): LucideIcon | null => {
    if (day % 10 === 0) return Trophy;
    if (day % 5 === 0) return Star;
    if (day % 3 === 0) return Sparkle;
    return null;
  };

  return (
    <div className="py-6">
      <motion.h2
        className="text-xl font-bold text-center mb-6 text-foreground flex items-center justify-center gap-2"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Your Journey <CurrentDayIcon className="h-5 w-5 text-primary" />
      </motion.h2>

      <div className="grid md:grid-cols-2 gap-4 mb-8">
        {/* Current Day Celebration Card */}
        <motion.div
          className="bg-card rounded-2xl p-5 shadow-neu-md relative overflow-hidden"
          whileHover={{ scale: 1.01 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Sun className="absolute top-0 right-0 h-20 w-20 opacity-[0.06] text-primary" />

          <div className="flex justify-between items-center mb-3">
            <div>
              <h3 className="text-lg font-bold text-foreground flex items-center">
                Day {currentDay} <TodayIcon className="inline h-4 w-4 ml-2 text-primary" />
              </h3>
              <motion.p
                className="text-sm text-primary font-medium"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {motivationalPhrases[currentPhrase]}
              </motion.p>
            </div>
            <motion.div
              className="bg-primary text-primary-foreground rounded-2xl w-16 h-16 flex items-center justify-center shadow-sm relative"
              whileHover={{ rotate: 10 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="text-center">
                <div className="text-2xl font-bold">{currentDay}</div>
                <div className="text-[10px] uppercase tracking-wider">Day</div>
              </div>
              <Trophy className="absolute -top-1 -right-1 h-4 w-4 text-mood-joy fill-mood-joy" />
            </motion.div>
          </div>

          <div className="relative h-2.5 w-full bg-muted rounded-full mb-2 overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-primary rounded-full"
              style={{ width: `${(currentDay / totalDays) * 100}%` }}
            />
          </div>

          <div className="flex justify-between text-xs font-medium text-muted-foreground">
            <span>Streak: {currentDay} days</span>
            <span>{totalDays - currentDay} days to go</span>
          </div>
        </motion.div>

        {/* Daily Activity Card */}
        <motion.div
          className={`rounded-2xl p-5 shadow-neu-md relative overflow-hidden ${todayTone.soft}`}
          whileHover={{ scale: 1.01 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
            Today's Focus
            <motion.span
              animate={{ rotate: [0, 10, 0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatType: "loop" }}
              className={todayTone.text}
            >
              <Sparkles className="h-4 w-4" />
            </motion.span>
          </h3>

          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${todayTone.soft} ${todayTone.text}`}>
              <TodayActivityIcon className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-foreground text-sm">{days[currentDay - 1].activity.name}</h4>
              <p className="text-xs text-muted-foreground">
                A {days[currentDay - 1].activity.name.toLowerCase()} session to brighten your day.
              </p>
            </div>
          </div>

          <motion.button
            className="mt-4 w-full py-2.5 bg-primary text-primary-foreground font-medium rounded-full text-center shadow-neu-sm text-sm"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              if (days[currentDay - 1].activity.name.toLowerCase() === 'music') {
                window.location.href = '/music';
              }
            }}
          >
            <span className="flex items-center justify-center gap-2">
              Start now <Sparkles className="h-4 w-4" />
            </span>
          </motion.button>
        </motion.div>
      </div>

      {/* Day path visualization */}
      <div className="mb-10">
        <h3 className="text-sm font-semibold mb-4 text-center text-muted-foreground">Your wellness trail</h3>

        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

          <div
            ref={scrollContainerRef}
            className="flex overflow-x-auto pb-10 pt-6 hide-scrollbar md:justify-center"
            style={{ scrollbarWidth: 'none' }}
          >
            <div className="flex space-x-1 px-10 relative">
              {days.map((day) => {
                const tone = toneClasses(day.completed || day.isCurrent ? day.activity.tone : "neutral");
                const DayIcon = day.icon;
                const MilestoneIcon = getMilestoneIcon(day.day);
                const offsetY = day.waveFactor;

                return (
                  <div
                    key={day.day}
                    className={`flex flex-col items-center z-10 ${day.isCurrent ? 'current-day' : ''}`}
                    style={{
                      marginTop: `${day.isCurrent ? -15 : offsetY}px`,
                      transition: "all 0.3s ease"
                    }}
                  >
                    <div
                      className={`relative w-10 mb-1 transition-all duration-300 ${day.isCurrent ? 'scale-110' : ''}`}
                      style={{ height: day.isCurrent ? '85px' : '70px' }}
                    >
                      <div
                        className={`absolute left-1/2 bottom-0 w-1.5 rounded-full -translate-x-1/2 ${day.completed ? 'bg-primary' : 'bg-muted'}`}
                        style={{ height: day.isCurrent ? '85px' : '70px' }}
                      />

                      <motion.div
                        className={`absolute top-0 left-1/2 transform -translate-x-1/2 w-10 h-10 rounded-xl flex flex-col items-center justify-center gap-0.5 ${day.completed || day.isCurrent ? tone.soft : 'bg-muted'} ${day.completed || day.isCurrent ? tone.text : 'text-muted-foreground'}`}
                        whileHover={{ scale: 1.1 }}
                      >
                        <span className="font-bold text-xs leading-none">{day.day}</span>
                        <DayIcon className="h-3 w-3" />
                      </motion.div>

                      {(day.isSpecial || day.isCurrent) && MilestoneIcon && (
                        <motion.div
                          className="absolute -top-2 -right-2 text-mood-joy"
                          animate={day.isCurrent ? { rotate: [0, 20, 0, -20, 0] } : {}}
                          transition={day.isCurrent ? { duration: 2, repeat: Infinity } : {}}
                        >
                          <MilestoneIcon className="h-3.5 w-3.5 fill-mood-joy" />
                        </motion.div>
                      )}
                    </div>

                    <span className={`text-[11px] mt-1 font-medium ${day.isCurrent ? 'text-primary' : 'text-muted-foreground'}`}>
                      Day {day.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Mental Health Tip Card */}
      <div className="bg-card rounded-2xl p-5 shadow-neu-md mb-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentFact}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5 }}
            className="flex items-start gap-3"
          >
            <div className="text-primary shrink-0"><FactIcon className="h-7 w-7" /></div>
            <div>
              <h3 className="text-sm font-bold text-foreground mb-1.5">Wellness Tip</h3>
              <p className="text-sm text-muted-foreground mb-2 leading-relaxed">
                {mentalHealthFacts[currentFact].fact}
              </p>
              <div className="text-xs text-muted-foreground/70">
                Source: {mentalHealthFacts[currentFact].source}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-center mt-4 gap-1">
          {mentalHealthFacts.map((_, index) => (
            <div
              key={index}
              className={`h-1.5 rounded-full transition-all ${index === currentFact ? 'w-4 bg-primary' : 'w-1.5 bg-muted'}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const FeatureGrid = () => {
  const router = useRouter();
  const features: { title: string; description: string; icon: LucideIcon; tone: MoodTone; href: string }[] = [
    { title: "Meditate", description: "Find your inner peace", icon: Wind, tone: "calm", href: "/music" },
    { title: "Journal", description: "Express your thoughts", icon: NotebookPen, tone: "focus", href: "/journal" },
    { title: "Community", description: "Connect with others", icon: Users, tone: "tender", href: "/community" },
    { title: "Explore", description: "Discover resources", icon: Activity, tone: "growth", href: "/explore" },
  ];

  return (
    <section className="pb-10">
      <div className="flex justify-center mb-6">
        <button
          className="text-sm font-semibold text-primary flex items-center gap-1.5 hover:gap-2.5 transition-all"
          onClick={() => router.push('/explore')}
        >
          Explore more
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {features.map((feature) => {
          const tone = toneClasses(feature.tone);
          return (
            <button
              key={feature.title}
              onClick={() => router.push(feature.href)}
              className="text-left bg-card p-4 rounded-2xl shadow-neu-md hover:scale-[1.02] active:scale-[0.98] transition-transform"
            >
              <div className={`mb-3 w-10 h-10 rounded-full flex items-center justify-center ${tone.soft} ${tone.text}`}>
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-semibold mb-1 text-foreground">{feature.title}</h3>
              <p className="text-xs text-muted-foreground">{feature.description}</p>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default HomePage;
