import { Brain, Heart, HeartHandshake, Lightbulb, type LucideIcon, Sparkles, Wind } from "lucide-react";

import type { MoodTone } from "./mood-tone";

interface CategorySpec {
  icon: LucideIcon;
  tone: MoodTone;
}

/**
 * Books are recommended live by the backend's LLM agent (server/agents/books.py),
 * so their category is model output, not something we control keyword-for-keyword.
 * Rather than trust the model to pick a good decorative color/emoji itself (it
 * won't always), we map its `category` field to a fixed icon + tone on our side.
 */
const CATEGORIES: Record<string, CategorySpec> = {
  "personal development": { icon: Sparkles, tone: "growth" },
  "mental wellness": { icon: HeartHandshake, tone: "tender" },
  "self-help": { icon: Lightbulb, tone: "joy" },
  psychology: { icon: Brain, tone: "focus" },
  mindfulness: { icon: Wind, tone: "calm" },
  relationships: { icon: Heart, tone: "tender" },
  "stress management": { icon: Wind, tone: "alert" },
};

function spec(category: string): CategorySpec {
  return CATEGORIES[category?.toLowerCase()?.trim()] || { icon: Sparkles, tone: "neutral" };
}

export function getCategoryIcon(category: string): LucideIcon {
  return spec(category).icon;
}

export function getCategoryTone(category: string): MoodTone {
  return spec(category).tone;
}
