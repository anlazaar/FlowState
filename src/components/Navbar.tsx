"use client";

import Link from "next/link";
import { useStore } from "@/store/useStore";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { LogOut, Settings, BarChart2, Menu, Sparkles, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const { user, logout } = useStore();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    logout();
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#030305]/80 backdrop-blur-2xl">
      <div className="container mx-auto max-w-6xl px-4 md:px-8 h-16 md:h-20 flex items-center justify-between transition-all">
        {/* LOGO & DESKTOP NAV */}
        <div className="flex items-center gap-10">
          <Link href="/dashboard" className="flex items-center space-x-3 group">
            <div className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex flex-col items-center justify-center transition-all duration-500 group-hover:bg-white group-hover:scale-105">
              <span className="font-extrabold text-white/50 group-hover:text-black text-xs tracking-tighter transition-colors">
                FS
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium">
            <Link href="/dashboard" className="text-white/60 hover:text-white transition-colors">
              Dashboard
            </Link>
            <Link href="/focus" className="text-white/60 hover:text-white transition-colors">
              Sessions
            </Link>
            <Link href="/shop" className="text-white/60 hover:text-white transition-colors">
              Shop
            </Link>
            <Link href={`/u/${user?.username}`} className="text-white/60 hover:text-white transition-colors">
              Profile
            </Link>
          </nav>
        </div>

        {/* RIGHT ACTIONS */}
        <div className="flex items-center space-x-5">
          {user && (
            <div className="hidden md:flex items-center space-x-2 text-sm font-medium px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 transition-colors cursor-default">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{user.tokens || 0}</span>
            </div>
          )}

          <div className="relative hidden md:block"
               onMouseEnter={() => setDropdownOpen(true)}
               onMouseLeave={() => setDropdownOpen(false)}>
            <button className="relative h-10 w-10 rounded-full bg-white/5 border border-white/10 hover:border-white/20 transition-all p-0 overflow-hidden outline-none">
              {user?.profileImageUrl ? (
                <img src={user.profileImageUrl} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-tr from-violet-500 to-indigo-500" />
              )}
              {user?.activeBadge === 'badge-elite-ring' && (
                <div className="absolute inset-0 rounded-full border-[2px] border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.5)] z-10 pointer-events-none" />
              )}
            </button>

            <AnimatePresence>
              {dropdownOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute top-full right-0 pt-3 z-50 origin-top-right min-w-[220px]"
                >
                  <div className="bg-[#09090b]/90 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-2xl p-2 flex flex-col gap-1 overflow-hidden">
                    <div className="px-3 py-3 border-b border-white/5 mb-1 bg-white/5 rounded-xl">
                      <p className="text-sm font-medium text-white truncate flex items-center gap-2">
                        {user?.username || "User"}
                        {user?.activeBadge === 'badge-focus-master' && <Sparkles className="w-3.5 h-3.5 text-violet-400" />}
                      </p>
                      <p className="text-xs text-white/50 truncate mt-0.5">
                        {user?.email}
                      </p>
                    </div>
                    
                    <Link href="/dashboard/history" className="flex items-center gap-3 px-3 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all">
                      <BarChart2 className="w-4 h-4 text-white/50" /> Stats & History
                    </Link>
                    <Link href="/dashboard/settings" className="flex items-center gap-3 px-3 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all">
                      <Settings className="w-4 h-4 text-white/50" /> Settings
                    </Link>
                    <div className="h-px bg-white/5 my-1" />
                    <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 text-sm text-red-400/80 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all">
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            className="md:hidden p-2.5 rounded-full bg-white/5 text-white/70 hover:text-white hover:bg-white/10 transition-all focus:outline-none"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
             initial={{ opacity: 0, height: 0 }}
             animate={{ opacity: 1, height: 'auto' }}
             exit={{ opacity: 0, height: 0 }}
             className="absolute top-full left-0 w-full bg-[#030305]/95 border-b border-white/10 md:hidden flex flex-col backdrop-blur-3xl z-50 overflow-hidden shadow-2xl"
          >
            <div className="p-6 flex flex-col gap-6">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                 <div className="flex items-center gap-3">
                   <div className="h-10 w-10 rounded-full border border-white/10 overflow-hidden relative">
                     {user?.profileImageUrl ? (
                        <img src={user.profileImageUrl} alt="avatar" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-tr from-violet-500 to-indigo-500" />
                      )}
                      {user?.activeBadge === 'badge-elite-ring' && (
                        <div className="absolute inset-0 rounded-full border-[2px] border-amber-400 pointer-events-none" />
                      )}
                   </div>
                   <div>
                     <p className="text-sm font-medium text-white flex items-center gap-2">
                       {user?.username}
                       {user?.activeBadge === 'badge-focus-master' && <Sparkles className="w-3.5 h-3.5 text-violet-400" />}
                     </p>
                     <p className="text-xs text-white/50">{user?.tokens || 0} FlowTokens</p>
                   </div>
                 </div>
              </div>

              <div className="flex flex-col gap-4">
                <Link href="/dashboard" className="text-lg font-medium text-white/70 hover:text-white transition-colors" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
                <Link href="/focus" className="text-lg font-medium text-white/70 hover:text-white transition-colors" onClick={() => setMobileMenuOpen(false)}>Sessions</Link>
                <Link href="/shop" className="text-lg font-medium text-white/70 hover:text-white transition-colors" onClick={() => setMobileMenuOpen(false)}>Shop</Link>
                <Link href={`/u/${user?.username}`} className="text-lg font-medium text-white/70 hover:text-white transition-colors" onClick={() => setMobileMenuOpen(false)}>Profile</Link>
                <Link href="/dashboard/settings" className="text-lg font-medium text-white/70 hover:text-white transition-colors" onClick={() => setMobileMenuOpen(false)}>Settings</Link>
              </div>

              <button onClick={handleLogout} className="mt-4 text-sm font-medium text-red-400 hover:text-red-300 text-left w-full pt-4 border-t border-white/5">
                Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
