"use client";

import { useState } from "react";
import { useStore } from "@/store/useStore";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Plus, Target, X, Trash2, Lock } from "lucide-react";
import { useNotificationStore } from "@/store/useNotificationStore";
import { motion, AnimatePresence } from "framer-motion";

export function PersonalGoals() {
  const { user, setUser } = useStore();
  const { addNotification } = useNotificationStore();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [type, setType] = useState("FOCUS_MINUTES");
  const [period, setPeriod] = useState("DAILY");
  const [target, setTarget] = useState("60");

  const hasGoalsFeature = user?.unlocks?.some((u: any) => u.itemId === "feature-goals");
  const goals = user?.personalGoals || [];
  const activeCount = goals.filter(g => !g.completed).length;

  const refreshUser = async () => {
    const res = await fetch("/api/auth/me");
    if (res.ok) {
      const data = await res.json();
      setUser(data.user);
    }
  };

  const handleCreate = async () => {
    if (!title || !target) return;
    setLoading(true);

    try {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          type,
          period,
          target: parseInt(target, 10)
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create goal");
      }

      await refreshUser();
      setIsModalOpen(false);
      setTitle("");
      setTarget("60");
      addNotification({ title: "Goal Created", description: "Your personal goal is now active.", variant: "success" });
    } catch (e: any) {
      addNotification({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await fetch(`/api/goals?id=${id}`, { method: "DELETE" });
      await refreshUser();
      addNotification({ title: "Goal Removed", description: "Goal was successfully deleted.", variant: "default" });
    } catch (err) {
      console.error(err);
    }
  };

  const formatTarget = (t: string, val: number) => {
    return t === "FOCUS_MINUTES" ? `${val} mins` : `${val} sessions`;
  };

  if (!hasGoalsFeature) {
    return (
      <motion.div className="space-y-4 pt-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          Personal Goals
          <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-1 rounded-full uppercase tracking-widest font-bold">Locked</span>
        </h2>
        <Card className="border-border/20 bg-card/20 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center grayscale opacity-60 relative overflow-hidden group">
          <div className="absolute inset-0 bg-black/40 z-10 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Button onClick={() => window.location.href = '/shop'} className="bg-amber-500 text-black hover:bg-amber-600 font-bold">
              <Lock className="w-4 h-4 mr-2" /> Unlock in Store
            </Button>
          </div>
          <Target className="w-12 h-12 mb-4 text-white/40" />
          <h3 className="font-bold text-lg text-white">Advanced Goal Tracking</h3>
          <p className="text-sm text-white/50 max-w-sm mx-auto mt-2">
            Unlock the ability to set custom daily and monthly targets. Earn massive FlowTokens by completing your own defined milestones.
          </p>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div className="space-y-4 pt-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          Personal Goals
        </h2>
        <Button 
          onClick={() => setIsModalOpen(true)} 
          disabled={activeCount >= 5}
          size="sm"
          className="bg-primary/20 text-primary hover:bg-primary/30 border border-primary/20 font-bold"
        >
          <Plus className="w-4 h-4 mr-1" /> New Goal ({activeCount}/5)
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {goals.map(goal => (
          <Card key={goal.id} className={`relative p-5 border-white/10 group ${goal.completed ? 'bg-green-500/10 border-green-500/30' : 'bg-black/40 glass'}`}>
            {!goal.completed && (
              <button 
                onClick={(e) => handleDelete(goal.id, e)}
                className="absolute top-3 right-3 text-white/20 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            
            <div className="flex flex-col h-full justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[10px] font-black tracking-widest uppercase px-2 py-0.5 rounded-sm ${goal.period === "DAILY" ? "bg-blue-500/20 text-blue-400" : "bg-purple-500/20 text-purple-400"}`}>
                    {goal.period}
                  </span>
                  {goal.completed && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                </div>
                <h3 className="font-bold text-lg tracking-tight leading-tight mt-2 pr-6">{goal.title}</h3>
                <p className="text-xs text-white/40 mt-1 uppercase font-bold tracking-wider">
                  Target: {formatTarget(goal.type, goal.target)}
                </p>
              </div>

              <div className="mt-6 space-y-2">
                <div className="flex justify-between text-xs font-bold text-white/70">
                  <span>{Math.min(goal.progress, goal.target)}</span>
                  <span>{Math.floor((Math.min(goal.progress, goal.target) / goal.target) * 100)}%</span>
                </div>
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${goal.completed ? 'bg-green-500' : 'bg-primary'}`} 
                    style={{ width: `${(Math.min(goal.progress, goal.target) / goal.target) * 100}%` }}
                  />
                </div>
                {!goal.completed && (
                  <p className="text-[10px] text-amber-400/80 font-bold uppercase tracking-widest text-right mt-2">
                    +100 FT Reward
                  </p>
                )}
              </div>
            </div>
          </Card>
        ))}

        {goals.length === 0 && (
          <div className="col-span-full py-12 border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center text-white/40 glass">
            <Target className="w-10 h-10 mb-3 opacity-50" />
            <p className="font-medium">No personal goals set.</p>
            <p className="text-sm opacity-70">Create one to earn bonus FlowTokens.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#09090b] border border-white/10 p-6 rounded-3xl w-full max-w-md shadow-2xl relative"
            >
              <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-white/50 hover:text-white">
                <X className="w-5 h-5" />
              </button>
              
              <h2 className="text-2xl font-black mb-6">Create Goal</h2>
              
              <div className="space-y-4">
                <div>
                  <Label>Goal Title</Label>
                  <Input 
                    placeholder="e.g. Master React Hooks" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="bg-white/5 border-white/10 mt-1"
                    maxLength={30}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Period</Label>
                    <select 
                      className="w-full mt-1 bg-white/5 border border-white/10 rounded-md h-10 px-3 text-sm focus:border-primary outline-none appearance-none"
                      value={period}
                      onChange={(e) => setPeriod(e.target.value)}
                    >
                      <option value="DAILY" className="bg-[#09090b]">Daily</option>
                      <option value="MONTHLY" className="bg-[#09090b]">Monthly</option>
                    </select>
                  </div>
                  <div>
                    <Label>Track By</Label>
                    <select 
                      className="w-full mt-1 bg-white/5 border border-white/10 rounded-md h-10 px-3 text-sm focus:border-primary outline-none appearance-none"
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                    >
                      <option value="FOCUS_MINUTES" className="bg-[#09090b]">Minutes</option>
                      <option value="SESSIONS_COUNT" className="bg-[#09090b]">Sessions</option>
                    </select>
                  </div>
                </div>

                <div>
                  <Label>Target {type === "FOCUS_MINUTES" ? "(Minutes)" : "(Sessions)"}</Label>
                  <Input 
                    type="number" 
                    min="1"
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    className="bg-white/5 border-white/10 mt-1"
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3">
                <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button onClick={handleCreate} disabled={loading} className="bg-primary hover:bg-primary/90 text-white font-bold">
                  {loading ? "Creating..." : "Set Goal"}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}