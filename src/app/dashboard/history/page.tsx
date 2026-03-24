"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/store/useStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, CheckCircle2, XCircle, BarChart3, Filter } from "lucide-react";

export default function HistoryPage() {
  const { user } = useStore();
  const [sessions, setSessions] = useState<any[]>([]);
  const [unlocks, setUnlocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // 'all', 'today', 'week'

  useEffect(() => {
    async function loadData() {
      try {
        const [sessionsRes, shopRes] = await Promise.all([
          fetch("/api/sessions"),
          fetch("/api/shop")
        ]);
        
        if (sessionsRes.ok) {
          const sessionsData = await sessionsRes.json();
          setSessions(sessionsData.sessions);
        }
        
        if (shopRes.ok) {
          const shopData = await shopRes.json();
          setUnlocks(shopData.unlocks || []);
        }
      } catch (error) {
        console.error("Failed to fetch history data", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (!user) return null;

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const weekStart = todayStart - (6 * 24 * 60 * 60 * 1000);

  const filteredSessions = sessions.filter(session => {
    const sessionTime = new Date(session.startedAt).getTime();
    if (filter === "today") return sessionTime >= todayStart;
    if (filter === "week") return sessionTime >= weekStart;
    return true;
  });

  // Calculate Weekly Chart Data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setHours(12, 0, 0, 0); // avoid DST jumps
    d.setDate(d.getDate() - (6 - i));
    return { 
      date: d.toISOString().split('T')[0], 
      label: d.toLocaleDateString("en-US", { weekday: "short" }), 
      minutes: 0,
      timestamp: d.getTime()
    };
  });

  sessions.forEach(session => {
    if (session.status !== "SUCCESS") return;
    const sDate = new Date(session.startedAt);
    const dayKey = sDate.toISOString().split('T')[0];
    const targetDay = last7Days.find(d => d.date === dayKey);
    if (targetDay) {
      targetDay.minutes += session.duration;
    }
  });

  const maxMinutes = Math.max(...last7Days.map(d => d.minutes), 60);

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">History & Stats</h1>
          <p className="text-muted-foreground mt-1 text-lg">Your focus journey and insights</p>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Weekly Chart */}
        <Card className="md:col-span-2 border-border/50 bg-card/50 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Weekly Focus Activity
            </CardTitle>
            <CardDescription>Minutes focused over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between h-56 mt-4 gap-2">
              {last7Days.map(day => (
                <div key={day.date} className="flex flex-col items-center flex-1 gap-2 h-full justify-end group">
                  {day.minutes > 0 ? (
                    <span className="text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                      {day.minutes}m
                    </span>
                  ) : (
                    <span className="text-xs text-transparent">0</span>
                  )}
                  <div className="w-full max-w-[48px] bg-primary/10 rounded-t-md relative flex-1 flex items-end">
                    <motion.div 
                      className="w-full bg-primary rounded-t-md shadow-sm" 
                      initial={{ height: 0 }}
                      animate={{ height: `${(day.minutes / maxMinutes) * 100}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">{day.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Filters & Summary */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-primary" />
              Filter History
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col gap-2">
              <Button 
                variant={filter === "all" ? "default" : "outline"} 
                onClick={() => setFilter("all")}
                className="justify-start"
              >
                All Time
              </Button>
              <Button 
                variant={filter === "week" ? "default" : "outline"} 
                onClick={() => setFilter("week")}
                className="justify-start"
              >
                Last 7 Days
              </Button>
              <Button 
                variant={filter === "today" ? "default" : "outline"} 
                onClick={() => setFilter("today")}
                className="justify-start"
              >
                Today
              </Button>
            </div>
            
            <div className="pt-6 border-t border-border/50">
              <p className="text-sm font-medium text-muted-foreground mb-1">Showing {filteredSessions.length} sessions</p>
              <p className="text-2xl font-bold">
                {Math.floor(filteredSessions.filter(s => s.status === "SUCCESS").reduce((acc, curr) => acc + curr.duration, 0) / 60)}h 
                {' '}
                {filteredSessions.filter(s => s.status === "SUCCESS").reduce((acc, curr) => acc + curr.duration, 0) % 60}m 
              </p>
              <p className="text-sm text-muted-foreground mt-1">Total success time</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pro Analytics Section */}
      <div className="mb-8">
        {unlocks.some(u => u.itemId === "feature-pro-stats") ? (
          <Card className="border-violet-500/30 bg-violet-500/5 backdrop-blur-md relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                <BarChart3 className="w-32 h-32 text-violet-500" />
             </div>
             <CardHeader>
               <CardTitle className="flex items-center gap-2 text-violet-400">
                 ✨ Pro Analytics Unlocked
               </CardTitle>
               <CardDescription>Deep insights into your focusing habits.</CardDescription>
             </CardHeader>
             <CardContent className="grid md:grid-cols-3 gap-6 relative z-10">
               <div className="bg-black/40 p-4 rounded-xl border border-white/5">
                 <p className="text-sm text-white/50 mb-1">Average Session</p>
                 <p className="text-2xl font-bold">
                   {sessions.length > 0 ? Math.floor(sessions.reduce((a, b) => a + b.duration, 0) / sessions.length) : 0} min
                 </p>
               </div>
               <div className="bg-black/40 p-4 rounded-xl border border-white/5">
                 <p className="text-sm text-white/50 mb-1">Most Distracting Session</p>
                 <p className="text-xl font-bold truncate">
                    {sessions.length > 0 ? [...sessions].sort((a,b) => b.distractionCount - a.distractionCount)[0].taskTitle : "N/A"}
                 </p>
                 <p className="text-xs text-orange-400 mt-1">
                    {sessions.length > 0 ? [...sessions].sort((a,b) => b.distractionCount - a.distractionCount)[0].distractionCount : 0} distractions
                 </p>
               </div>
               <div className="bg-black/40 p-4 rounded-xl border border-white/5">
                 <p className="text-sm text-white/50 mb-1">Success Rate</p>
                 <p className="text-2xl font-bold text-green-400">
                   {sessions.length > 0 ? Math.floor((sessions.filter(s => s.status === "SUCCESS").length / sessions.length) * 100) : 0}%
                 </p>
               </div>
             </CardContent>
          </Card>
        ) : (
          <Card className="border-border/20 bg-card/20 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center grayscale opacity-60 relative overflow-hidden group">
             <div className="absolute inset-0 bg-black/40 z-10 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
               <Button onClick={() => window.location.href = '/shop'} className="bg-amber-500 text-black hover:bg-amber-600 font-bold">
                 Unlock in Store
               </Button>
             </div>
             <BarChart3 className="w-12 h-12 text-white/20 mb-4" />
             <CardTitle className="mb-2 text-white/40">Pro Analytics Locked</CardTitle>
             <CardDescription className="max-w-md">Purchase the Pro Analytics feature in the Customization Store to unlock deep insights, success rates, and distraction stats.</CardDescription>
          </Card>
        )}
      </div>

      {/* Session List */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-md">
        <div className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Loading sessions...</div>
          ) : filteredSessions.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground flex flex-col items-center">
              <Clock className="w-12 h-12 mb-4 opacity-20" />
              <p>No sessions found for this period.</p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {filteredSessions.map((session) => (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  key={session.id} 
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-6 hover:bg-muted/30 transition-colors gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full ${session.status === 'SUCCESS' ? 'bg-green-500/10 text-green-500' : 'bg-destructive/10 text-destructive'}`}>
                      {session.status === 'SUCCESS' ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                    </div>
                    <div>
                      <p className="font-bold text-lg">{session.taskTitle}</p>
                      <p className="text-sm font-medium text-muted-foreground">
                        {new Date(session.startedAt).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} at {new Date(session.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <div className="text-left sm:text-right ml-16 sm:ml-0">
                    <p className="font-bold text-xl">{session.duration} min</p>
                    <p className={`text-xs font-bold tracking-wider uppercase ${session.status === 'SUCCESS' ? 'text-green-500' : 'text-destructive'}`}>
                      {session.status}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
