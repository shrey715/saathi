/**
 * The app's mood palette — 7 fixed tones, defined once in globals.css
 * (--color-mood-*) and referenced everywhere else through this map instead
 * of hardcoded hex values. Every "what color is this emotion/mood/category"
 * decision in the app should resolve to one of these seven, via the
 * *-icons.tsx maps in this directory (emotion-icons, mood-icons,
 * category-icons, journal-icons) — never inline a new hex color.
 *
 * Class names below are written out in full (not template-interpolated) so
 * Tailwind's static scanner can find them.
 */
export type MoodTone = "calm" | "joy" | "focus" | "tender" | "alert" | "growth" | "neutral";

interface ToneClasses {
  /** Soft background tint — cards, badges, icon wells. */
  soft: string;
  /** Icon/text color at full saturation. */
  text: string;
  /** Border accent, same hue as `text`. */
  border: string;
}

export const MOOD_TONE_CLASSES: Record<MoodTone, ToneClasses> = {
  calm: {
    soft: "bg-mood-calm-soft",
    text: "text-mood-calm",
    border: "border-mood-calm",
  },
  joy: {
    soft: "bg-mood-joy-soft",
    text: "text-mood-joy",
    border: "border-mood-joy",
  },
  focus: {
    soft: "bg-mood-focus-soft",
    text: "text-mood-focus",
    border: "border-mood-focus",
  },
  tender: {
    soft: "bg-mood-tender-soft",
    text: "text-mood-tender",
    border: "border-mood-tender",
  },
  alert: {
    soft: "bg-mood-alert-soft",
    text: "text-mood-alert",
    border: "border-mood-alert",
  },
  growth: {
    soft: "bg-mood-growth-soft",
    text: "text-mood-growth",
    border: "border-mood-growth",
  },
  neutral: {
    soft: "bg-mood-neutral-soft",
    text: "text-mood-neutral",
    border: "border-mood-neutral",
  },
};

export function toneClasses(tone: MoodTone): ToneClasses {
  return MOOD_TONE_CLASSES[tone] ?? MOOD_TONE_CLASSES.neutral;
}

/**
 * For call sites that need a raw CSS color (inline `style`, SVG fill/stroke,
 * dynamic gradient strings) rather than a Tailwind class — still resolves
 * through the same --mood-* custom properties, so it stays theme- and
 * dark-mode-aware instead of hardcoding a hex value.
 */
export function moodVar(tone: MoodTone): string {
  return `var(--mood-${tone})`;
}

/** Same idea as moodVar, alpha-blended against transparent — replaces the
 * old `${hexColor}40`-style alpha-hex suffix trick, which doesn't work with
 * CSS custom properties. */
export function moodMix(tone: MoodTone, percent: number): string {
  return `color-mix(in oklch, var(--mood-${tone}) ${percent}%, transparent)`;
}

/** Light tint toward white — for surfaces (the page canvas, cards, borders)
 * that should read as "part of the current mood's palette" without being
 * the full vivid hue. Complements moodMix, which blends toward transparent
 * instead of a solid color. */
export function moodTint(tone: MoodTone, percent: number): string {
  return `color-mix(in oklch, var(--mood-${tone}) ${percent}%, white)`;
}
