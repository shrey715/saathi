import { Brain, CloudRain, Frown, type LucideIcon, Moon, PartyPopper, Smile, Sparkles } from "lucide-react";

import { getEmotionTone } from "./emotion-icons";
import type { MoodTone } from "./mood-tone";

interface MoodSpec {
  icon: LucideIcon;
  tone: MoodTone;
}

/** Fixed mood vocabulary for community posts and the home page's daily
 * check-in, keyed by mood name (lowercase) — one entry per MoodTone, so
 * the check-in picker maps 1:1 onto the 7-tone palette. */
export const MOODS: Record<string, MoodSpec> = {
  happy: { icon: Smile, tone: "joy" },
  peaceful: { icon: Sparkles, tone: "calm" },
  proud: { icon: PartyPopper, tone: "growth" },
  reflective: { icon: Brain, tone: "focus" },
  tired: { icon: Moon, tone: "neutral" },
  anxious: { icon: CloudRain, tone: "alert" },
  sad: { icon: Frown, tone: "tender" },
};

function spec(mood: string): MoodSpec {
  return MOODS[mood?.toLowerCase()?.trim()] || MOODS.happy;
}

export function getMoodIcon(mood: string): LucideIcon {
  return spec(mood).icon;
}

export function getMoodTone(mood: string): MoodTone {
  return spec(mood).tone;
}

/** Mood-history entries can carry either vocabulary — the self-reported
 * check-in (MOODS, e.g. "happy") or the chatbot's detected emotion
 * (EMOTIONS, e.g. "supportive"). This resolves whichever one it is to a
 * tone instead of silently defaulting through getMoodTone's fallback. */
export function resolveMoodTone(label: string): MoodTone {
  const key = label?.toLowerCase()?.trim();
  if (key && key in MOODS) return MOODS[key].tone;
  return getEmotionTone(key);
}
