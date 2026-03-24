"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Play, Trophy, Flame, Clock, CheckCircle2, ShieldAlert } from "lucide-react";
import { Heatmap } from "@/components/Heatmap";
import { MissionsList } from "@/components/Missions";

export default function DashboardPage() {
  const router = useRouter();


 const { 
    user, 
    stats, 
    dailyStats, 
    missions, 
    isAuthenticated,
    setDailyStats,
    setMissions,
    setStats 
  } = useStore();
  
  const [recentSessions, setRecentSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

useEffect(() => {
    if (!isAuthenticated) {
      router.push("/");
      return;
    }

    async function loadDashboardData() {
      try {
        const userRes = await fetch("/api/auth/me"); 
        
        if (userRes.ok) {
          const data = await userRes.json();
          
          const fetchedStats = data.stats || data.user?.stats;
          const fetchedDailyStats = data.dailyStats || data.user?.dailyStats;
          const fetchedMissions = data.missions || data.user?.missions;

          if (fetchedDailyStats) setDailyStats(fetchedDailyStats);
          if (fetchedMissions) setMissions(fetchedMissions);
          if (fetchedStats) setStats(fetchedStats);
        }

        const sessionsRes = await fetch("/api/sessions");
        if (sessionsRes.ok) {
          const sessionData = await sessionsRes.json();
          setRecentSessions(sessionData.sessions?.slice(0, 5) ||[]);
        }
      } catch (e) {
        console.error("Failed to fetch dashboard data:", e);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  },[isAuthenticated, router, setDailyStats, setMissions, setStats]);

  if (loading || !isAuthenticated || !user || !stats) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>;
  }

  const getFocusTier = (score: number) => {
    if (score < 40) return { label: "Beginner", color: "text-gray-400", ring: "ring-gray-400" };
    if (score < 70) return { label: "Consistent", color: "text-blue-400", ring: "ring-blue-400" };
    if (score < 90) return { label: "Focused", color: "text-violet-400 drop-shadow-[0_0_10px_rgba(139,92,246,0.6)]", ring: "ring-violet-400 ring-offset-2 ring-offset-black" };
    return { label: "Elite", color: "text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.8)]", ring: "ring-yellow-400 ring-offset-4 ring-offset-black" };
  };

  const focusScore = stats.focusScore || 0;
  const tier = getFocusTier(focusScore);

  const dailyMissions = missions.filter(m => !m.type.startsWith("GOAL_"));
  const monthlyGoals = missions.filter(m => m.type.startsWith("GOAL_MONTHLY_")).sort((a,b) => a.id.localeCompare(b.id)); // Consistent ordering
  const hasGoalsFeature = user.unlocks?.some((u: any) => u.itemId === "feature-goals");

  return (
    <div className="container mx-auto max-w-5xl p-4 md:p-8 space-y-8 animate-in fade-in duration-700">
      
      {/* V2 Header & Focus Score */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">
            Welcome back, {user.username || user.email.split('@')[0]}
          </h1>
          <p className="text-white/50 mt-2 text-lg">Ready to enter the Flow State?</p>
        </div>
        
        <div className="flex flex-col md:flex-row items-stretch gap-4">
          <motion.div whileHover={{ scale: 1.05 }} className="glass px-8 py-5 rounded-3xl border border-white/10 flex items-center gap-6">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-white/50 uppercase tracking-widest">Focus Score</span>
              <span className={`text-3xl font-black ${tier.color}`}>{tier.label}</span>
            </div>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center bg-black border border-white/10 ${tier.ring} transition-all`}>
              <span className="text-2xl font-black">{focusScore}</span>
            </div>
          </motion.div>

          <Button 
            onClick={() => {
              const text = `🔥 I'm on a ${stats?.currentStreak}-day focus streak on FlowState! Check out my profile: ${window.location.origin}/u/${user?.username}`;
              navigator.clipboard.writeText(text);
              import("@/store/useNotificationStore").then((m) => {
                m.useNotificationStore.getState().addNotification({
                  title: "Link Copied!",
                  description: "Profile link copied to clipboard.",
                  variant: "success",
                });
              });
            }}
            variant="outline" 
            className="glass border-white/10 hover:bg-white/10 h-full rounded-3xl px-6 text-white"
          >
            <Trophy className="w-6 h-6 mr-3 text-yellow-400" />
            <div className="flex flex-col items-start pr-2">
              <span className="font-bold">Share Link</span>
              <span className="text-xs text-white/50">{user.username}</span>
            </div>
          </Button>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
<Button 
  onClick={() => router.push('/focus')} 
  className="
    w-full 
    h-14 sm:h-16 md:h-20 
    text-lg sm:text-xl md:text-2xl 
    font-black 
    bg-gradient-to-r from-violet-600 to-indigo-600 
    hover:from-violet-500 hover:to-indigo-500 
    text-white 
    shadow-[0_0_40px_rgba(139,92,246,0.2)] 
    rounded-xl sm:rounded-2xl 
    border border-white/10 
    transition-transform hover:scale-[1.01]
    flex items-center justify-center
  "
>
  <Play 
    fill="currentColor" 
    className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 mr-2 sm:mr-3 md:mr-4" 
  />
  START FOCUS SESSION
</Button>
      </motion.div>

      {/* Gamification Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="h-full">
          <Card className="overflow-hidden relative border-violet-500/20 hover:scale-[1.02] transition-transform duration-300 group h-full">
            <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-1/4 -translate-y-1/4 group-hover:scale-110 transition-transform duration-500">
              <Trophy className="w-32 h-32 fill-violet-500/20 text-violet-500" />
            </div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Level {stats.level}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalXP} XP</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.totalXP % 1000} / 1000 XP to Level {stats.level + 1}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="h-full">
          <Card className="overflow-hidden relative border-orange-500/20 hover:scale-[1.02] transition-transform duration-300 group h-full">
            <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-1/4 -translate-y-1/4 group-hover:scale-110 transition-transform duration-500">
              <Flame className="w-32 h-32 fill-orange-500/20 text-orange-500" />
            </div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.currentStreak} Days</div>
              <p className="text-xs text-muted-foreground mt-1">
                Best: {stats.bestStreak} Days
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="h-full">
          <Card className="overflow-hidden relative border-blue-500/20 hover:scale-[1.02] transition-transform duration-300 group h-full">
            <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-1/4 -translate-y-1/4 group-hover:scale-110 transition-transform duration-500">
              <Clock className="w-32 h-32 fill-blue-500/20 text-blue-500" />
            </div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Focus Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.floor(dailyStats.reduce((a, b) => a + b.totalFocusMinutes, 0) / 60)} Hours</div>
              <p className="text-xs text-muted-foreground mt-1">
                Over the past 90 days
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="h-full">
          <Card className="overflow-hidden relative border-green-500/20 hover:scale-[1.02] transition-transform duration-300 group h-full">
            <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-1/4 -translate-y-1/4 group-hover:scale-110 transition-transform duration-500">
              <CheckCircle2 className="w-32 h-32 fill-green-500/20 text-green-500" />
            </div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sessions Complete</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dailyStats.reduce((a, b) => a + b.sessionsCount, 0)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Completed across {dailyStats.length} active days
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Heatmap Section */}
        <motion.div className="md:col-span-2 space-y-4" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
          <h2 className="text-2xl font-bold tracking-tight">Activity Heatmap</h2>
          <Card className="p-6">
            <Heatmap data={dailyStats} />
            <div className="flex items-center justify-end gap-2 mt-4 text-xs font-medium text-white/50">
              <span>Less</span>
              <div className="w-3 h-3 rounded-sm bg-white/5" />
              <div className="w-3 h-3 rounded-sm bg-violet-900" />
              <div className="w-3 h-3 rounded-sm bg-violet-700" />
              <div className="w-3 h-3 rounded-sm bg-violet-500" />
              <div className="w-3 h-3 rounded-sm bg-violet-400" />
              <span>More</span>
            </div>
          </Card>
        </motion.div>

        {/* Daily Missions Section */}
        <motion.div className="space-y-4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            Daily Missions
          </h2>
          <Card className="p-6 border-violet-500/20">
            <MissionsList missions={dailyMissions} />
          </Card>
        </motion.div>
      </div>

      {/* Advanced Goals Section */}
      <motion.div className="space-y-4 pt-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          Monthly Master Goals
          {!hasGoalsFeature && <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-1 rounded-full uppercase tracking-widest font-bold">Locked</span>}
        </h2>
        
        {hasGoalsFeature ? (
          <div className="grid md:grid-cols-2 gap-4">
            {monthlyGoals.map(goal => (
              <Card key={goal.id} className={`p-6 border-white/10 ${goal.completed ? 'bg-green-500/5 border-green-500/30' : 'bg-black/20'}`}>
                 <div className="flex justify-between items-start mb-4">
                   <div>
                     <h3 className="font-bold text-lg">{goal.type === "GOAL_MONTHLY_MINUTES" ? "Endurance Master" : "Consistency King"}</h3>
                     <p className="text-sm text-white/50">
                        {goal.type === "GOAL_MONTHLY_MINUTES" ? `Focus for ${goal.target} minutes this month.` : `Complete ${goal.target} deep work sessions this month.`}
                     </p>
                   </div>
                   {goal.completed && <CheckCircle2 className="w-6 h-6 text-green-500" />}
                 </div>
                 
                 <div className="space-y-2">
                   <div className="flex justify-between text-xs font-bold text-white/70">
                     <span>{Math.min(goal.progress, goal.target)} / {goal.target}</span>
                     <span>{Math.floor((Math.min(goal.progress, goal.target) / goal.target) * 100)}%</span>
                   </div>
                   <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                     <div 
                       className={`h-full rounded-full transition-all duration-1000 ${goal.completed ? 'bg-green-500' : 'bg-primary'}`} 
                       style={{ width: `${(Math.min(goal.progress, goal.target) / goal.target) * 100}%` }}
                     />
                   </div>
                   <p className="text-xs text-yellow-500 text-right mt-1">+100 FlowTokens on completion</p>
                 </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-border/20 bg-card/20 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center grayscale opacity-60 relative overflow-hidden group">
             <div className="absolute inset-0 bg-black/40 z-10 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
               <Button onClick={() => window.location.href = '/shop'} className="bg-amber-500 text-black hover:bg-amber-600 font-bold">
                 Unlock in Store
               </Button>
             </div>
             <Trophy className="w-12 h-12 text-white/20 mb-4" />
             <CardTitle className="mb-2 text-white/40">Advanced Goals Locked</CardTitle>
             <CardDescription className="max-w-md">Purchase the Goal Tracking feature in the Customization Store to unlock long-term monthly goals and hit massive token payouts.</CardDescription>
          </Card>
        )}
      </motion.div>

    </div>
  );
}
