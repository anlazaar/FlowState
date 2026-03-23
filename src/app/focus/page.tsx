"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTimerStore } from "@/store/useTimerStore";
import { useStore } from "@/store/useStore";
import { useNotificationStore } from "@/store/useNotificationStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Play, X, AlertTriangle, FileText, CheckCircle2, XCircle } from "lucide-react";

export default function FocusPage() {
  const router = useRouter();
  const { user, setStats } = useStore();
  const { addNotification } = useNotificationStore();
  const { isActive, taskTitle, duration, timeRemaining, startTimer, stopTimer, tick, syncTime, distractionCount, inactiveDuration } = useTimerStore();

  const [inputTitle, setInputTitle] = useState("");
  const [inputDuration, setInputDuration] = useState(25);
  const [warning, setWarning] = useState<string | null>(null);
  
  const [showReport, setShowReport] = useState(false);
  const [finalStatus, setFinalStatus] = useState("");

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
        useTimerStore.getState().addDistraction();
        useTimerStore.getState().setHiddenAt(Date.now());
        setTimeout(() => setWarning(null), 5000);
      } else if (!document.hidden && isActive) {
        const hiddenAt = useTimerStore.getState().hiddenAt;
        if (hiddenAt) {
          const inactiveSecs = Math.floor((Date.now() - hiddenAt) / 1000);
          useTimerStore.getState().addInactiveDuration(inactiveSecs);
          useTimerStore.getState().setHiddenAt(null);
        }
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

  const playSound = useCallback((type: "start" | "end") => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      if (type === "start") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.5, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.5);
      } else {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.15);
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.3);
        osc.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.45);
        gain.gain.setValueAtTime(0.5, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.6);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.5);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 1.5);
      }
    } catch (e) {
      console.error("Audio playback failed", e);
    }
  }, []);

  const handleStart = useCallback(() => {
    if (!inputTitle.trim()) {
      setWarning("Please enter a task title");
      setTimeout(() => setWarning(null), 3000);
      return;
    }
    
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
    
    playSound("start");
    startTimer(inputTitle, inputDuration);
  }, [inputTitle, inputDuration, startTimer, playSound]);

  const saveSession = useCallback(async (status: "SUCCESS" | "FAILED") => {
    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskTitle: useTimerStore.getState().taskTitle || "Focus Session",
          duration: useTimerStore.getState().duration || 25,
          status,
          distractionCount: useTimerStore.getState().distractionCount,
          inactiveDuration: useTimerStore.getState().inactiveDuration,
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

  const handleGiveUp = useCallback(async () => {
    // Browsers block confirm() in fullscreen, so exit first.
    let wasFullscreen = false;
    if (document.fullscreenElement) {
      wasFullscreen = true;
      document.exitFullscreen().catch(() => {});
      // Wait for fullscreen exit event to finish before confirming
      await new Promise(r => setTimeout(r, 150));
    }
    
    if (confirm("Are you sure you want to give up? This will break your focus and record a FAILED session.")) {
      await saveSession("FAILED");
      setFinalStatus("FAILED");
      setShowReport(true);
    } else if (wasFullscreen && document.documentElement.requestFullscreen) {
      // Re-enter fullscreen if canceled
      document.documentElement.requestFullscreen().catch(() => {});
    }
  }, [saveSession]);

  const handleCloseReport = useCallback(() => {
    stopTimer();
    setShowReport(false);
    router.push("/dashboard");
  }, [stopTimer, router]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") {
        if (e.key === "Enter" && !isActive && !showReport) {
          handleStart();
        }
        return;
      }
      
      if (!isActive && !showReport && e.key === "Enter") {
        handleStart();
      } else if (showReport && e.key === "Enter") {
        handleCloseReport();
      } else if (isActive && e.key === "Escape") {
        handleGiveUp();
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isActive, showReport, handleStart, handleCloseReport, handleGiveUp]);

  const handleComplete = useCallback(async () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    
    playSound("end");
    const oldLevel = useStore.getState().stats?.level || 1;
    await saveSession("SUCCESS");
    
    const newLevel = useStore.getState().stats?.level || 1;
    if (newLevel > oldLevel) {
      addNotification({ 
        title: "Level Up!", 
        description: `You reached Level ${newLevel}! Awesome!`, 
        variant: "gamification" 
      });
    } else {
      addNotification({ 
        title: "Session Completed", 
        description: `You earned ${duration * 10} XP!`, 
        variant: "success" 
      });
    }

    setFinalStatus("SUCCESS");
    setShowReport(true);
  }, [saveSession, duration, addNotification]);



  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const progressPercent = isActive ? ((duration * 60 - timeRemaining) / (duration * 60)) * 100 : 0;

  if (showReport) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#030305] p-4 relative overflow-hidden">
        <div className="absolute inset-0 z-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay pointer-events-none" />
        <Card className="z-10 w-full max-w-lg glass animate-in fade-in zoom-in duration-500">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4 bg-black/40 p-4 rounded-full border border-white/10 shadow-xl">
              {finalStatus === "SUCCESS" ? (
                <CheckCircle2 className="w-12 h-12 text-green-500" />
              ) : (
                <XCircle className="w-12 h-12 text-destructive" />
              )}
            </div>
            <CardTitle className="text-5xl font-black">{finalStatus === "SUCCESS" ? "Session Complete" : "Session Failed"}</CardTitle>
            <CardDescription className="text-lg mt-2">Here is your distraction report.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="p-6 bg-black/30 rounded-2xl border border-white/5 space-y-4">
              <div className="flex justify-between items-center text-lg">
                <span className="text-white/60">Task</span>
                <span className="font-bold text-white">{taskTitle}</span>
              </div>
              <div className="flex justify-between items-center text-lg">
                <span className="text-white/60">Time Focused</span>
                <span className="font-bold text-white tracking-widest">{duration} MIN</span>
              </div>
              <div className="w-full h-px bg-white/10 my-2" />
              <div className="flex justify-between items-center text-lg">
                <span className="text-white/60 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-400" /> Distractions
                </span>
                <span className="font-bold text-orange-400">{distractionCount} times</span>
              </div>
              <div className="flex justify-between items-center text-lg">
                <span className="text-white/60 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-red-400" /> Inactivity
                </span>
                <span className="font-bold text-red-400">{Math.floor(inactiveDuration / 60)} min {inactiveDuration % 60}s</span>
              </div>
            </div>
            {distractionCount > 0 && (
              <p className="text-center text-orange-400/80 font-medium">
                Try closing other tabs and putting your phone away next time!
              </p>
            )}
            <Button onClick={handleCloseReport} className="w-full h-14 text-xl font-bold bg-white text-black hover:bg-white/90">
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isActive) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#030305] p-4 relative overflow-hidden">
        <div className="absolute inset-0 z-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay pointer-events-none" />
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-violet-600/20 blur-[120px] mix-blend-screen float-anim" />
        
        <Card className="z-10 w-full max-w-lg glass">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard")} className="h-10 w-10 border border-white/10 rounded-full hover:bg-white/10">
                <ArrowLeft className="h-5 w-5 text-white" />
              </Button>
              <CardTitle>Setup Focus Session</CardTitle>
            </div>
            <CardDescription>What do you want to accomplish?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-medium text-white/80">Task Title</label>
              <Input 
                placeholder="e.g., Build the timer UI" 
                value={inputTitle} 
                onChange={(e) => setInputTitle(e.target.value)}
                className="bg-black/20 border-white/10 focus:border-violet-500/50 focus:ring-violet-500/30 transition-all h-14 text-lg px-4"
                autoFocus
              />
            </div>
            <div className="space-y-4">
              <label className="text-sm font-medium text-white/80">Duration (Minutes)</label>
              <div className="grid grid-cols-3 gap-3">
                {[25, 50, 90].map((d) => (
                  <Button
                    key={d}
                    type="button"
                    variant={inputDuration === d ? "default" : "outline"}
                    onClick={() => setInputDuration(d)}
                    className={`h-14 text-lg font-bold border-white/10 transition-all ${
                      inputDuration === d ? 'bg-white text-black hover:bg-white/90 shadow-[0_0_20px_rgba(255,255,255,0.2)]' : 'bg-black/20 text-white hover:bg-white/10'
                    }`}
                  >
                    {d}
                  </Button>
                ))}
              </div>
              <div className="flex items-center gap-4 mt-6">
                <Input 
                  type="number" 
                  value={inputDuration} 
                  onChange={(e) => setInputDuration(Number(e.target.value))}
                  min={1}
                  max={240}
                  className="w-24 bg-black/20 border-white/10 h-14 text-xl text-center font-bold"
                />
                <span className="text-sm text-white/50 font-medium uppercase tracking-wider">Custom<br/>Minutes</span>
              </div>
            </div>
            <AnimatePresence>
              {warning && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                  <p className="text-red-400 text-sm font-medium flex items-center gap-2 bg-red-500/10 p-3 rounded-lg border border-red-500/20 mt-4">
                    <AlertTriangle className="w-5 h-5" /> {warning}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
          <CardFooter className="pt-2">
            <Button onClick={handleStart} className="w-full text-xl h-16 font-extrabold gap-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-[0_0_30px_rgba(139,92,246,0.3)] border border-white/10 transition-all hover:scale-[1.02]">
              <Play fill="currentColor" className="w-6 h-6" />
              Enter Flow State
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#000000] text-white relative overflow-hidden transition-colors duration-1000">
      <div className="absolute inset-0 z-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay pointer-events-none" />
      
      {/* Immersive Breathing Gradient */}
      <motion.div 
        className="absolute inset-0 z-0 opacity-40 mix-blend-screen pointer-events-none"
        animate={{
          background: [
            "radial-gradient(circle at 50% 50%, var(--color-primary) 0%, transparent 60%)",
            "radial-gradient(circle at 50% 50%, var(--color-primary) 0%, transparent 70%)",
            "radial-gradient(circle at 50% 50%, var(--color-primary) 0%, transparent 60%)",
          ],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      
      <AnimatePresence>
        {warning && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -50 }}
            className="absolute top-10 z-50 bg-red-500/90 text-white px-6 py-4 rounded-2xl font-bold shadow-[0_0_40px_rgba(239,68,68,0.5)] backdrop-blur-md flex items-center gap-3 border border-red-400/50"
          >
            <AlertTriangle className="w-6 h-6" />
            {warning}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="z-10 w-full max-w-4xl px-6 flex flex-col items-center text-center">
        <motion.p 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="text-2xl md:text-4xl font-semibold text-white/80 mb-16 tracking-tight bg-black/20 px-8 py-3 rounded-full border border-white/5 backdrop-blur-xl pointer-events-auto"
        >
          {taskTitle}
        </motion.p>
        
        {/* Progress Ring and Timer */}
        <div className="relative flex items-center justify-center w-[300px] h-[300px] md:w-[500px] md:h-[500px] mb-16 pointer-events-none">
          <svg className="absolute inset-0 w-full h-full -rotate-90 drop-shadow-[0_0_20px_rgba(139,92,246,0.3)]">
            <circle 
              cx="50%" cy="50%" r="48%" 
              className="stroke-white/5 fill-none" strokeWidth="2%" 
            />
            <motion.circle 
              cx="50%" cy="50%" r="48%" 
              className="stroke-violet-500 fill-none" strokeWidth="2%"
              strokeLinecap="round"
              initial={{ pathLength: 1 }}
              animate={{ pathLength: 1 - progressPercent / 100 }}
              transition={{ ease: "linear" }}
            />
          </svg>
          <motion.div 
            className="text-[6rem] md:text-[10rem] font-black tracking-tighter tabular-nums drop-shadow-[0_0_30px_rgba(255,255,255,0.2)] pointer-events-auto"
            animate={{ scale: timeRemaining <= 10 && timeRemaining > 0 ? [1, 1.05, 1] : 1 }}
            transition={{ repeat: timeRemaining <= 10 && timeRemaining > 0 ? Infinity : 0, duration: 1 }}
          >
            {formatTime(timeRemaining)}
          </motion.div>
        </div>

        <Button 
          variant="ghost" 
          onClick={handleGiveUp} 
          className="text-white/40 hover:text-white hover:bg-white/10 rounded-full px-8 py-6 text-lg tracking-[0.2em] font-medium uppercase transition-all duration-300 border border-transparent hover:border-white/10 cursor-pointer z-50 relative pointer-events-auto"
        >
          <X className="w-5 h-5 mr-3" />
          Give Up
        </Button>
      </div>
    </div>
  );
}
