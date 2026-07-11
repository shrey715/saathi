import {
  Brain,
  Feather,
  Flame,
  HeartCrack,
  HeartHandshake,
  Lightbulb,
  type LucideIcon,
  Moon,
  PartyPopper,
  Smile,
  Sparkles,
  Sunrise,
  UserCheck,
  Wind,
} from "lucide-react";

import type { MoodTone } from "./mood-tone";

interface EmotionSpec {
  icon: LucideIcon;
  tone: MoodTone;
}

/**
 * One icon + mood tone per emotion the backend's emotion-detection agent can
 * return (see server/agents/emotion.py's VALID_EMOTIONS) — keeps the chat
 * UI's mood indicator in sync with the actual set of labels the model
 * produces.
 */
export const EMOTIONS: Record<string, EmotionSpec> = {
  default: { icon: Smile, tone: "neutral" },
  thinking: { icon: Brain, tone: "focus" },
  supportive: { icon: HeartHandshake, tone: "tender" },
  celebration: { icon: PartyPopper, tone: "joy" },
  concern: { icon: HeartCrack, tone: "alert" },
  calm: { icon: Wind, tone: "calm" },
  motivated: { icon: Flame, tone: "growth" },
  curious: { icon: Lightbulb, tone: "focus" },
  empathetic: { icon: HeartHandshake, tone: "tender" },
  hopeful: { icon: Sunrise, tone: "growth" },
  gentle: { icon: Feather, tone: "tender" },
  confident: { icon: Sparkles, tone: "joy" },
  reflective: { icon: Moon, tone: "focus" },
  respectful: { icon: UserCheck, tone: "neutral" },
  warm: { icon: Sunrise, tone: "joy" },
};

function spec(emotion: string): EmotionSpec {
  return EMOTIONS[emotion] || EMOTIONS.default;
}

export function getEmotionIcon(emotion: string): LucideIcon {
  return spec(emotion).icon;
}

export function getEmotionTone(emotion: string): MoodTone {
  return spec(emotion).tone;
}
