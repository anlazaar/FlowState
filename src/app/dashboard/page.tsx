"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/store/useStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { Play, Trophy, Flame, Clock, CheckCircle2, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { user, stats } = useStore();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchSessions() {
      try {
        const res = await fetch("/api/sessions");
        if (res.ok) {
          const data = await res.json();
          setSessions(data.sessions);
        }
      } catch (error) {
        console.error("Failed to fetch sessions", error);
      } finally {
        setLoading(false);
      }
    }
    fetchSessions();
  }, []);

  if (!user || !stats) return null;

  const xpForNextLevel = stats.level * 1000;
  const currentLevelXP = stats.totalXP % 1000;
  const progressPercent = (currentLevelXP / 1000) * 100;

  const totalMinutes = sessions
    .filter(s => s.status === "SUCCESS")
    .reduce((acc, curr) => acc + curr.duration, 0);

  const totalHours = (totalMinutes / 60).toFixed(1);

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1 text-lg">Welcome back, {user.email.split('@')[0]}</p>
        </div>
        <Button size="lg" onClick={() => router.push("/focus")} className="gap-2 font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
          <Play fill="currentColor" className="w-4 h-4" />
          Start Focus Session
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="bg-gradient-to-br from-card to-card/50 overflow-hidden relative border-primary/10">
            <div className="absolute right-0 top-0 opacity-5 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
              <Trophy className="w-32 h-32" />
            </div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Level {stats.level}</CardTitle>
              <Trophy className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalXP} XP</div>
              <div className="mt-4 space-y-2">
                <Progress value={progressPercent} />
                <p className="text-xs text-muted-foreground text-right">{currentLevelXP} / 1000 to Lvl {stats.level + 1}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="bg-gradient-to-br from-card to-card/50 overflow-hidden relative border-orange-500/10">
            <div className="absolute right-0 top-0 opacity-5 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
              <Flame className="w-32 h-32" />
            </div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
              <Flame className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.currentStreak} Days</div>
              <p className="text-xs text-muted-foreground mt-4">Personal Best: {stats.bestStreak} Days</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="bg-gradient-to-br from-card to-card/50 overflow-hidden relative border-blue-500/10">
            <div className="absolute right-0 top-0 opacity-5 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
              <Clock className="w-32 h-32" />
            </div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Focus Time</CardTitle>
              <Clock className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalHours} hrs</div>
              <p className="text-xs text-muted-foreground mt-4">{totalMinutes} total minutes</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="bg-gradient-to-br from-card to-card/50 overflow-hidden relative border-green-500/10">
            <div className="absolute right-0 top-0 opacity-5 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
              <CheckCircle2 className="w-32 h-32" />
            </div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {sessions.length > 0 
                  ? Math.round((sessions.filter(s => s.status === "SUCCESS").length / sessions.length) * 100) 
                  : 0}%
              </div>
              <p className="text-xs text-muted-foreground mt-4">{sessions.length} total sessions</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <h2 className="text-xl font-bold tracking-tight mb-4 mt-8">Recent Sessions</h2>
        <Card className="border-border/50">
          <div className="p-0">
            {loading ? (
              <div className="p-8 text-center text-muted-foreground">Loading sessions...</div>
            ) : sessions.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground flex flex-col items-center">
                <Clock className="w-12 h-12 mb-4 opacity-20" />
                <p>No sessions yet. Start focusing to earn XP!</p>
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {sessions.slice(0, 5).map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-full ${session.status === 'SUCCESS' ? 'bg-green-500/10 text-green-500' : 'bg-destructive/10 text-destructive'}`}>
                        {session.status === 'SUCCESS' ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="font-medium">{session.taskTitle}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(session.startedAt).toLocaleDateString()} at {new Date(session.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{session.duration} min</p>
                      <p className={`text-xs font-medium ${session.status === 'SUCCESS' ? 'text-green-500' : 'text-destructive'}`}>
                        {session.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
