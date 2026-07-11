"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

import { chatApi } from "./api";
import { resolveMoodTone } from "./mood-icons";
import type { MoodTone } from "./mood-tone";

interface MoodContextValue {
  /** The app's current ambient mood — drives the shell background wash and
   * nav accent color everywhere, automatically. Nothing renders this
   * except this context: whoever last set a mood (the home check-in, or
   * chat's auto-detected emotion) is the one source of truth. */
  tone: MoodTone;
  label: string;
  /** Called by anything that establishes a new mood — propagates instantly
   * to every consumer without a refetch. */
  setMood: (label: string, tone: MoodTone) => void;
}

const MoodContext = createContext<MoodContextValue>({
  tone: "calm",
  label: "calm",
  setMood: () => {},
});

export function MoodProvider({ children }: { children: React.ReactNode }) {
  const [tone, setTone] = useState<MoodTone>("calm");
  const [label, setLabel] = useState("calm");

  useEffect(() => {
    chatApi
      .moodHistory()
      .then((entries) => {
        if (entries.length === 0) return;
        const sorted = [...entries].sort(
          (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
        const latest = sorted[sorted.length - 1];
        setTone(resolveMoodTone(latest.emotion));
        setLabel(latest.emotion);
      })
      .catch(() => {});
  }, []);

  const setMood = useCallback((newLabel: string, newTone: MoodTone) => {
    setTone(newTone);
    setLabel(newLabel);
  }, []);

  return <MoodContext.Provider value={{ tone, label, setMood }}>{children}</MoodContext.Provider>;
}

export function useMood(): MoodContextValue {
  return useContext(MoodContext);
}
