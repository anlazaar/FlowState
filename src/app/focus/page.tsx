"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTimerStore } from "@/store/useTimerStore";
import { useStore } from "@/store/useStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Play, X, AlertTriangle } from "lucide-react";

export default function FocusPage() {
  const router = useRouter();
  const { user, setStats } = useStore();
  const { isActive, taskTitle, duration, timeRemaining, startTimer, stopTimer, tick, syncTime } = useTimerStore();

  const [inputTitle, setInputTitle] = useState("");
  const [inputDuration, setInputDuration] = useState(25);
  const [warning, setWarning] = useState<string | null>(null);

  useEffect(() => {
    syncTime();
    let interval: NodeJS.Timeout;
    if (isActive && timeRemaining > 0) {
      interval = setInterval(() => {
        tick();
      }, 1000);
    } else if (isActive && timeRemaining <= 0) {
      handleComplete();
    }
    return () => clearInterval(interval);
  }, [isActive, timeRemaining, tick, syncTime]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isActive) {
        setWarning("You left the tab! Stay focused!");
        setTimeout(() => setWarning(null), 5000);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isActive]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isActive) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isActive]);

  const handleStart = () => {
    if (!inputTitle.trim()) {
      setWarning("Please enter a task title");
      setTimeout(() => setWarning(null), 3000);
      return;
    }
    startTimer(inputTitle, inputDuration);
  };

  const saveSession = useCallback(async (status: "SUCCESS" | "FAILED") => {
    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskTitle: useTimerStore.getState().taskTitle || "Focus Session",
          duration: useTimerStore.getState().duration || 25,
          status,
          startedAt: useTimerStore.getState().startedAt || new Date().toISOString(),
          endedAt: new Date().toISOString()
        }),
      });
      if (res.ok && status === "SUCCESS") {
        const meRes = await fetch("/api/auth/me");
        if (meRes.ok) {
          const meData = await meRes.json();
          setStats(meData.stats);
        }
      }
    } catch (error) {
      console.error("Failed to save session", error);
    }
  }, [setStats]);

  const handleComplete = useCallback(async () => {
    await saveSession("SUCCESS");
    stopTimer();
    setWarning("Session Completed! Great job.");
    setTimeout(() => {
      setWarning(null);
      router.push("/dashboard");
    }, 2000);
  }, [saveSession, stopTimer, router]);

  const handleGiveUp = async () => {
    if (confirm("Are you sure you want to give up? This will break your focus and record a FAILED session.")) {
      await saveSession("FAILED");
      stopTimer();
      router.push("/dashboard");
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const progress = isActive ? ((duration * 60 - timeRemaining) / (duration * 60)) * 100 : 0;

  if (!isActive) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 relative overflow-hidden">
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-background via-background to-primary/10" />
        <Card className="z-10 w-full max-w-md bg-card/80 backdrop-blur-xl border-border/50 shadow-2xl">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard")} className="h-8 w-8 rounded-full">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <CardTitle>Setup Focus Session</CardTitle>
            </div>
            <CardDescription>What do you want to accomplish?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Task Title</label>
              <Input 
                placeholder="e.g., Build the timer UI" 
                value={inputTitle} 
                onChange={(e) => setInputTitle(e.target.value)}
                autoFocus
              />
            </div>
            <div className="space-y-3">
              <label className="text-sm font-medium">Duration</label>
              <div className="grid grid-cols-3 gap-2">
                {[25, 50, 90].map((d) => (
                  <Button
                    key={d}
                    type="button"
                    variant={inputDuration === d ? "default" : "outline"}
                    onClick={() => setInputDuration(d)}
                    className="w-full"
                  >
                    {d} min
                  </Button>
                ))}
              </div>
              <div className="flex items-center gap-2 mt-4">
                <Input 
                  type="number" 
                  value={inputDuration} 
                  onChange={(e) => setInputDuration(Number(e.target.value))}
                  min={1}
                  max={240}
                  className="w-20"
                />
                <span className="text-sm text-muted-foreground">custom minutes</span>
              </div>
            </div>
            <AnimatePresence>
              {warning && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                  <p className="text-destructive text-sm font-medium flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> {warning}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
          <CardFooter>
            <Button onClick={handleStart} className="w-full text-lg h-12 gap-2 shadow-xl shadow-primary/20">
              <Play fill="currentColor" className="w-5 h-5" />
              Start Timer
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#050505] text-white relative overflow-hidden transition-colors duration-1000">
      <motion.div 
        className="absolute inset-0 z-0 opacity-20"
        animate={{
          background: [
            "radial-gradient(circle at 20% 20%, var(--color-primary) 0%, transparent 50%)",
            "radial-gradient(circle at 80% 80%, var(--color-primary) 0%, transparent 50%)",
            "radial-gradient(circle at 20% 80%, var(--color-primary) 0%, transparent 50%)",
            "radial-gradient(circle at 20% 20%, var(--color-primary) 0%, transparent 50%)",
          ],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />
      
      <AnimatePresence>
        {warning && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -50 }}
            className="absolute top-10 z-50 bg-destructive/90 text-destructive-foreground px-6 py-3 rounded-full font-bold shadow-2xl backdrop-blur-md flex items-center gap-3"
          >
            <AlertTriangle className="w-5 h-5" />
            {warning}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="z-10 w-full max-w-3xl px-6 flex flex-col items-center text-center">
        <motion.p 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="text-2xl md:text-3xl font-medium text-white/70 mb-8"
        >
          {taskTitle}
        </motion.p>
        
        <div className="relative flex items-center justify-center w-64 h-64 md:w-96 md:h-96 mb-12">
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle 
              cx="50%" cy="50%" r="48%" 
              className="stroke-white/10 fill-none" strokeWidth="4%" 
            />
            <motion.circle 
              cx="50%" cy="50%" r="48%" 
              className="stroke-white fill-none" strokeWidth="4%"
              strokeLinecap="round"
              initial={{ pathLength: 1 }}
              animate={{ pathLength: 1 - progress / 100 }}
              transition={{ ease: "linear" }}
            />
          </svg>
          <motion.div 
            className="text-6xl md:text-8xl font-black tracking-tighter tabular-nums"
            animate={{ scale: timeRemaining <= 10 && timeRemaining > 0 ? [1, 1.05, 1] : 1 }}
            transition={{ repeat: timeRemaining <= 10 && timeRemaining > 0 ? Infinity : 0, duration: 1 }}
          >
            {formatTime(timeRemaining)}
          </motion.div>
        </div>

        <Button 
          variant="ghost" 
          onClick={handleGiveUp} 
          className="text-white/50 hover:text-white hover:bg-white/10 rounded-full px-8 py-6 text-lg tracking-widest uppercase cursor-pointer"
        >
          <X className="w-5 h-5 mr-2" />
          Give Up
        </Button>
      </div>
    </div>
  );
}
