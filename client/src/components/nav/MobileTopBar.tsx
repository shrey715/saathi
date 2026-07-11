"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

import { authApi, type UserDetails } from "@/lib/api";

/** Mobile-only top bar (hidden at md+, where the Sidebar takes over) —
 * gives every authenticated page the same logo + profile/sign-out access
 * that used to live only in home/page.tsx's bespoke header. */
export function MobileTopBar() {
  const [user, setUser] = useState<UserDetails | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    authApi.getUserDetails().then(setUser).catch(() => {});
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initials = user?.username ? user.username.slice(0, 2).toUpperCase() : "US";

  return (
    <header className="md:hidden sticky top-0 z-30 flex items-center justify-between px-4 h-14 bg-card/95 backdrop-blur border-b border-border">
      <Link href="/home" className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs">
          S
        </div>
        <span className="font-semibold text-sm">Saathi</span>
      </Link>

      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-xs font-medium"
        >
          {initials}
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-popover border border-border rounded-lg shadow-md py-1 z-20 text-popover-foreground">
            <div className="px-4 py-2 border-b border-border">
              <p className="text-sm font-medium truncate">{user?.username || "User"}</p>
            </div>
            <Link href="/profile" className="block px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground">
              Profile settings
            </Link>
            <div className="border-t border-border" />
            <button
              onClick={() => {
                localStorage.removeItem("accessToken");
                window.location.href = "/login";
              }}
              className="block w-full text-left px-4 py-2 text-sm text-destructive hover:bg-accent"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
