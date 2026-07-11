"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { authApi, type UserDetails } from "@/lib/api";

/**
 * Redirects to /login if there's no token or it's no longer valid;
 * otherwise resolves the current user. Replaces the near-identical
 * "checkAuth" useEffect that used to be copy-pasted into every
 * authenticated page.
 */
export function useAuthGuard() {
  const router = useRouter();
  const [user, setUser] = useState<UserDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    if (!token) {
      router.push("/login");
      return;
    }

    authApi
      .getUserDetails()
      .then((userData) => {
        if (!cancelled) {
          setUser(userData);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) router.push("/login");
      });

    return () => {
      cancelled = true;
    };
  }, [router]);

  return { user, setUser, isLoading };
}
