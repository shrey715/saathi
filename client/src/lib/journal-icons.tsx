import { NotebookPen, Pin, Sparkle, Star, type LucideIcon, MessageCircleHeart } from "lucide-react";

import type { MoodTone } from "./mood-tone";

interface TagSpec {
  icon: LucideIcon;
  tone: MoodTone;
}

/**
 * New entries get a random tag from this fixed set (still stored as an
 * opaque string in the same `emoji` column journal rows have always used —
 * only the rendering changed, not the API shape).
 */
const TAGS: Record<string, TagSpec> = {
  note: { icon: NotebookPen, tone: "focus" },
  sparkle: { icon: Sparkle, tone: "joy" },
  star: { icon: Star, tone: "growth" },
  thought: { icon: MessageCircleHeart, tone: "tender" },
  pin: { icon: Pin, tone: "calm" },
};

export const JOURNAL_TAGS = Object.keys(TAGS);

function spec(tag: string): TagSpec {
  return TAGS[tag] || TAGS.note;
}

export function randomJournalTag(): string {
  return JOURNAL_TAGS[Math.floor(Math.random() * JOURNAL_TAGS.length)];
}

export function getJournalIcon(tag: string): LucideIcon {
  return spec(tag).icon;
}

export function getJournalTone(tag: string): MoodTone {
  return spec(tag).tone;
}
