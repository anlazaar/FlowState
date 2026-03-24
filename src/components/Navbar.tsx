"use client";

import Link from "next/link";
import { useStore } from "@/store/useStore";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { LogOut, Settings, BarChart2, User, Menu } from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const { user, logout } = useStore();
  const router = useRouter();
  const[mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    logout();
    router.push("/");
  };

  const updateTheme = async (themeClasses: string) => {
    try {
      if (typeof window !== "undefined") {
        const currentClasses = document.body.className.split(" ").filter(c => !c.startsWith("theme-"));
        document.body.className =[...currentClasses, themeClasses].join(" ");
      }
      await fetch("/api/users/theme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ themeColor: themeClasses })
      });
    } catch (e) {
      console.error("Failed to update theme", e);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#030305]/80 backdrop-blur-xl">
      <div className="container mx-auto max-w-5xl px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="flex items-center space-x-3 group">
            <div className="h-8 w-8 rounded-xl bg-primary/10 border border-primary/20 flex flex-col items-center justify-center transition-all duration-300 group-hover:bg-primary group-hover:shadow-[0_0_20px_var(--color-primary)]">
              <span className="font-extrabold text-primary group-hover:text-white text-sm tracking-tighter transition-colors">FS</span>
            </div>
            <span className="font-bold text-lg hidden sm:inline-block tracking-tight text-white/90 group-hover:text-white transition-colors">
              FlowState
            </span>
          </Link>
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <Link href="/dashboard" className="text-white/50 hover:text-white transition-colors">Dashboard</Link>
            {/* Fixed: /dashboard/sessions -> /focus */}
            <Link href="/focus" className="text-white/50 hover:text-white transition-colors">Sessions</Link>
            <Link href="/shop" className="text-white/50 hover:text-white transition-colors">Store</Link>
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          {user && (
            <div className="hidden md:flex items-center space-x-1.5 text-sm font-semibold px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary">
              <span className="h-4 w-4 flex items-center justify-center rounded-full bg-primary/20 text-[9px] font-bold">FT</span>
              <span>{user.tokens || 0}</span>
            </div>
          )}

          <div className="relative group hidden md:block">
            <Button variant="ghost" className="relative h-10 w-10 rounded-full bg-white/5 border border-white/10 hover:border-white/20 transition-all p-0 overflow-hidden">
              {user?.profileImageUrl ? (
                <img src={user.profileImageUrl} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="h-4 w-4 text-white/70" />
              )}
            </Button>
            
            <div className="absolute top-full pt-3 right-0 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none group-hover:pointer-events-auto origin-top-right transform scale-95 group-hover:scale-100 z-50">
              <div className="w-56 bg-[#09090b]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl p-2 flex flex-col gap-1">
                <div className="px-3 py-2 border-b border-white/5 mb-1">
                  <p className="text-sm font-medium text-white truncate">{user?.username || 'User'}</p>
                  <p className="text-xs text-white/50 truncate">{user?.email}</p>
                </div>
                {/* Fixed: /username -> /u/username & Fixed "Profile Profile" typo */}
                <Link href={`/u/${user?.username}`} className="flex items-center gap-2 px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-xl transition-colors">
                  <User className="w-4 h-4" /> Profile
                </Link>
                <Link href="/dashboard/history" className="flex items-center gap-2 px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-xl transition-colors">
                  <BarChart2 className="w-4 h-4" /> Stats & History
                </Link>
                <Link href="/dashboard/settings" className="flex items-center gap-2 px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-xl transition-colors">
                  <Settings className="w-4 h-4" /> Settings
                </Link>
                <div className="px-3 py-2 border-t border-white/5 mt-1">
                  <p className="text-xs font-medium text-white/40 mb-2">Pro Themes</p>
                  <div className="flex gap-2">
                    <button onClick={() => updateTheme('theme-violet-pro')} className="w-6 h-6 rounded-full bg-violet-700 hover:scale-110 transition-transform ring-1 ring-white/10" title="Deep Violet" />
                    <button onClick={() => updateTheme('theme-emerald-soft')} className="w-6 h-6 rounded-full bg-emerald-400 hover:scale-110 transition-transform ring-1 ring-white/10" title="Soft Emerald" />
                    <button onClick={() => updateTheme('theme-rose-quartz')} className="w-6 h-6 rounded-full bg-rose-400 hover:scale-110 transition-transform ring-1 ring-white/10" title="Rose Quartz" />
                    <button onClick={() => updateTheme('theme-monochrome')} className="w-6 h-6 rounded-full bg-neutral-300 hover:scale-110 transition-transform ring-1 ring-white/10" title="Monochrome" />
                  </div>
                </div>
                <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors mt-1 border-t border-white/5">
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            </div>
          </div>

          <button className="md:hidden p-2 text-white/70 hover:text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-[#030305]/95 border-b border-white/10 p-4 md:hidden flex flex-col gap-4 backdrop-blur-xl z-50">
          <Link href="/dashboard" className="text-sm font-medium text-white/70 hover:text-white transition-colors">Dashboard</Link>
          {/* Fixed Mobile Links */}
          <Link href="/focus" className="text-sm font-medium text-white/70 hover:text-white transition-colors">Sessions</Link>
          <Link href="/shop" className="text-sm font-medium text-white/70 hover:text-white transition-colors">Store</Link>
          <Link href={`/u/${user?.username}`} className="text-sm font-medium text-white/70 hover:text-white transition-colors">Public Profile</Link>
          <button onClick={handleLogout} className="text-sm font-medium text-red-400 hover:text-red-300 text-left">Sign Out</button>
        </div>
      )}
    </header>
  );
}