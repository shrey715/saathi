import {
  BookOpen,
  Bot,
  Briefcase,
  Dog,
  Dumbbell,
  Feather,
  Footprints,
  Globe,
  Heart,
  HeartHandshake,
  Leaf,
  type LucideIcon,
  Moon,
  Mountain,
  Music2,
  Rainbow,
  Sparkles,
  Star,
  Waves,
  Wind,
} from "lucide-react";

/** The backend stores a lucide-react icon *name* (a plain string) for
 * explore-page content — this is the only place that name gets resolved
 * back to an actual component. Keep in sync with server/explore_seed.py;
 * unrecognized names fall back to Sparkles rather than crashing. */
const EXPLORE_ICONS: Record<string, LucideIcon> = {
  Mountain, Feather, Dog, Moon, Wind, Waves, Footprints, Heart, Sparkles,
  Rainbow, Star, Leaf, HeartHandshake, Music2, BookOpen, Dumbbell, Globe,
  Bot, Briefcase,
};

export function getExploreIcon(name: string): LucideIcon {
  return EXPLORE_ICONS[name] ?? Sparkles;
}
