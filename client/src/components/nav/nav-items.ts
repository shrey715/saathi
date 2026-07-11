import { Compass, Home, MessageCircle, Music2, NotebookPen, Users, type LucideIcon } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

/** Single source of truth for primary navigation — both Sidebar (desktop)
 * and BottomNav (mobile) render from this list, so they can never drift. */
export const NAV_ITEMS: NavItem[] = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/explore", label: "Explore", icon: Compass },
  { href: "/chat", label: "Chat", icon: MessageCircle },
  { href: "/journal", label: "Journal", icon: NotebookPen },
  { href: "/music", label: "Music", icon: Music2 },
  { href: "/community", label: "Community", icon: Users },
];

/** Routes that render without the app shell (no sidebar/bottom nav). */
export const PUBLIC_ROUTES = ["/", "/login", "/signup"];

export function isActiveRoute(pathname: string, href: string): boolean {
  const base = "/" + pathname.split("/")[1];
  return base === href;
}
