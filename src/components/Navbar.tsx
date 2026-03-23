"use client";

import Link from "next/link";
import { useStore } from "@/store/useStore";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { LogOut, Zap, Palette } from "lucide-react";

export function Navbar() {
  const { stats, logout } = useStore();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    logout();
    router.push("/");
  };

  const updateTheme = async (themeClasses: string) => {
    try {
      if (typeof window !== "undefined") {
        const currentClasses = document.body.className.split(" ").filter(c => !c.startsWith("theme-"));
        document.body.className = [...currentClasses, themeClasses].join(" ");
      }
      await fetch("/api/users/theme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ themeColor: themeClasses })
      });
      // Optionally update user store here if needed, but CSS update is instant
    } catch (e) {
      console.error("Failed to update theme", e);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/40 backdrop-blur-2xl">
      <div className="container mx-auto max-w-5xl px-4 h-16 flex items-center">
        <div className="mr-8 flex items-center">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex flex-col items-center justify-center">
              <span className="font-extrabold text-primary-foreground text-sm tracking-tighter">FS</span>
            </div>
            <span className="font-bold text-lg hidden sm:inline-block tracking-tight">
              FlowState
            </span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2">
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link href="/dashboard" className="transition-colors hover:text-foreground/80 text-foreground">
              Dashboard
            </Link>
            <Link href="/dashboard/history" className="transition-colors hover:text-foreground/80 text-foreground">
              History & Stats
            </Link>
            <Link href="/dashboard/settings" className="transition-colors hover:text-foreground/80 text-foreground">
              Settings
            </Link>
          </nav>
          <div className="flex items-center space-x-4">
            {stats && (
              <div className="hidden md:flex items-center space-x-3 text-sm font-medium px-4 py-1.5 rounded-full bg-secondary/50 border border-border/50">
                <span className="text-primary font-bold flex items-center gap-1">
                  <Zap className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  Lvl {stats.level}
                </span>
                <span className="text-muted-foreground/50">|</span>
                <span className="text-orange-500 font-bold flex items-center gap-1">
                  {stats.currentStreak} 🔥
                </span>
              </div>
            )}
            
            <div className="relative group">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                <Palette className="h-4 w-4" />
              </Button>
              <div className="absolute top-full pt-2 right-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto">
                <div className="bg-black/90 backdrop-blur-xl border border-white/10 p-3 rounded-2xl flex gap-2 shadow-2xl">
                  <button onClick={() => updateTheme('theme-violet')} className="w-8 h-8 rounded-full bg-violet-500 hover:scale-110 transition-transform" />
                  <button onClick={() => updateTheme('theme-blue')} className="w-8 h-8 rounded-full bg-blue-500 hover:scale-110 transition-transform" />
                  <button onClick={() => updateTheme('theme-green')} className="w-8 h-8 rounded-full bg-emerald-500 hover:scale-110 transition-transform" />
                  <button onClick={() => updateTheme('theme-orange')} className="w-8 h-8 rounded-full bg-orange-500 hover:scale-110 transition-transform" />
                </div>
              </div>
            </div>

            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground hover:text-foreground">
              <LogOut className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
