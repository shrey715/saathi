import { motion } from "framer-motion";

import { type MoodTone, moodVar } from "@/lib/mood-tone";

interface ExpressionSpec {
  eyes: "open" | "closed" | "sleepy" | "worried";
  mouth: string;
}

/** One face per mood tone — a flat, illustrated expression rather than an
 * icon, meant to read at large size as the home page's mood check-in
 * centerpiece. Ink color is fixed (not theme-aware) since the face always
 * sits on its own vivid tone-colored disc, not the page background. */
const EXPRESSIONS: Record<MoodTone, ExpressionSpec> = {
  joy: { eyes: "open", mouth: "M 32 62 Q 50 82 68 62" },
  growth: { eyes: "open", mouth: "M 28 58 Q 50 88 72 58" },
  calm: { eyes: "closed", mouth: "M 36 64 Q 50 72 64 64" },
  focus: { eyes: "open", mouth: "M 38 66 Q 50 70 62 66" },
  neutral: { eyes: "sleepy", mouth: "M 38 66 L 62 66" },
  alert: { eyes: "worried", mouth: "M 34 70 Q 50 60 66 70" },
  tender: { eyes: "open", mouth: "M 34 70 Q 50 56 66 70" },
};

const INK = "rgba(38, 28, 20, 0.82)";

function Eyes({ style }: { style: ExpressionSpec["eyes"] }) {
  if (style === "closed") {
    return (
      <>
        <path d="M 30 42 Q 36 36 42 42" stroke={INK} strokeWidth={4} strokeLinecap="round" fill="none" />
        <path d="M 58 42 Q 64 36 70 42" stroke={INK} strokeWidth={4} strokeLinecap="round" fill="none" />
      </>
    );
  }
  if (style === "sleepy") {
    return (
      <>
        <path d="M 30 40 Q 36 44 42 40" stroke={INK} strokeWidth={4} strokeLinecap="round" fill="none" />
        <path d="M 58 40 Q 64 44 70 40" stroke={INK} strokeWidth={4} strokeLinecap="round" fill="none" />
      </>
    );
  }
  if (style === "worried") {
    return (
      <>
        <circle cx="36" cy="42" r="4.5" fill={INK} />
        <circle cx="64" cy="42" r="4.5" fill={INK} />
        <path d="M 28 32 L 40 36" stroke={INK} strokeWidth={3.5} strokeLinecap="round" />
        <path d="M 72 32 L 60 36" stroke={INK} strokeWidth={3.5} strokeLinecap="round" />
      </>
    );
  }
  return (
    <>
      <circle cx="36" cy="40" r="5" fill={INK} />
      <circle cx="64" cy="40" r="5" fill={INK} />
    </>
  );
}

export function MoodFace({
  tone,
  size = 140,
  animated = true,
  className,
}: {
  tone: MoodTone;
  size?: number;
  animated?: boolean;
  className?: string;
}) {
  const expression = EXPRESSIONS[tone];

  return (
    <motion.svg
      key={tone}
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      initial={{ scale: 0.85, opacity: 0 }}
      animate={
        animated
          ? { scale: [0.85, 1.04, 1], opacity: 1, y: [0, -4, 0] }
          : { scale: 1, opacity: 1 }
      }
      transition={
        animated
          ? { scale: { duration: 0.5, ease: "easeOut" }, y: { duration: 3.2, repeat: Infinity, ease: "easeInOut" } }
          : { duration: 0.35 }
      }
    >
      <circle cx="50" cy="50" r="48" fill={moodVar(tone)} />
      <circle cx="50" cy="50" r="48" fill="white" opacity="0.08" />
      <Eyes style={expression.eyes} />
      <path d={expression.mouth} stroke={INK} strokeWidth={4.5} strokeLinecap="round" fill="none" />
    </motion.svg>
  );
}
