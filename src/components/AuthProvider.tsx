"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/store/useStore";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setUser = useStore(state => state.setUser);
  const setStats = useStore(state => state.setStats);
  const setDailyStats = useStore(state => state.setDailyStats);
  const setMissions = useStore(state => state.setMissions);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          setStats(data.stats);
          if (data.dailyStats) setDailyStats(data.dailyStats);
          if (data.missions) setMissions(data.missions);
          
          if (typeof window !== "undefined") {
            const currentClasses = document.body.className.split(" ").filter(c => !c.startsWith("theme-"));
            document.body.className = [...currentClasses, data.user?.themeColor || "theme-violet"].join(" ");
          }
        } else {
          setUser(null);
          setStats(null);
        }
      } catch (err) {
        console.error("Auth fetch failed", err);
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, [setUser, setStats]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return <>{children}</>;
}
