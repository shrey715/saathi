"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import { moodTint } from "@/lib/mood-tone";
import { MoodProvider, useMood } from "@/lib/mood-context";
import { BottomNav } from "./BottomNav";
import { MobileTopBar } from "./MobileTopBar";
import { Sidebar } from "./Sidebar";
import { PUBLIC_ROUTES } from "./nav-items";

/** The one scroll container for every page in the shell. Its background is
 * a flat, pastel tint of the user's current mood (see
 * lib/mood-context.tsx) — set once via the home check-in or automatically
 * from chat's detected emotion, and every page picks it up automatically
 * from here on, with no per-page wiring needed.
 *
 * Deliberately flat color blocking, not a gradient — and --card/--border
 * are re-tinted to the same hue family (just a lightness step apart) so
 * cards read as part of one continuous surface instead of white panels
 * dropped on top of it. --foreground/--muted-foreground are left alone:
 * both the canvas and the cards stay light enough that dark text works on
 * either without needing to know which one it's sitting on. */
function ShellScrollArea({ children }: { children: React.ReactNode }) {
  const { tone } = useMood();
  return (
    <div
      className="flex-1 overflow-y-auto pb-20 md:pb-0 transition-colors duration-700 ease-out"
      style={{
        backgroundColor: moodTint(tone, 32),
        ["--background" as string]: moodTint(tone, 32),
        ["--card" as string]: moodTint(tone, 12),
        ["--border" as string]: moodTint(tone, 40),
      } as React.CSSProperties}
    >
      {children}
    </div>
  );
}

/** Renders the responsive nav shell (sidebar on md+, bottom bar on mobile)
 * around authenticated pages, and offsets content so it never sits behind
 * either nav. Public routes (landing, login, signup) render children with
 * no shell at all. */
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setIsAuthenticated(!!localStorage.getItem("accessToken"));
  }, [pathname]);

  const basePath = "/" + pathname.split("/")[1];
  const showShell = isAuthenticated && !PUBLIC_ROUTES.includes(basePath);

  if (!showShell) {
    return <>{children}</>;
  }

  return (
    <MoodProvider>
      <Sidebar />
      <div className="md:pl-60 h-screen flex flex-col">
        <MobileTopBar />
        <ShellScrollArea>{children}</ShellScrollArea>
      </div>
      <BottomNav />
    </MoodProvider>
  );
}
