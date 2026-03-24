"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Target, CheckCircle2, Circle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/store/useStore";

type Goal = {
  id: string;
  title: string;
  type: "daily" | "monthly";
  target: number;
  current: number;
  completed: boolean;
};

export function PersonalGoals() {
  const { user, setUser } = useStore();
  const [goals, setGoals] = useState<Goal[]>([
    { id: "1", title: "Deep Work block", type: "daily", target: 4, current: 1, completed: false },
    { id: "2", title: "Complete side-project", type: "monthly", target: 50, current: 32, completed: false },
  ]);
  const [isAdding, setIsAdding] = useState(false);
  const [newGoal, setNewGoal] = useState({ title: "", target: 1, type: "daily" as const });

  const addGoal = () => {
    if (!newGoal.title) return;
    if (goals.length >= 5) return alert("Maximum 5 active goals allowed to maintain focus.");
    
    setGoals([...goals, { ...newGoal, id: Date.now().toString(), current: 0, completed: false }]);
    setIsAdding(false);
    setNewGoal({ title: "", target: 1, type: "daily" });
  };

  const toggleGoal = (id: string) => {
    setGoals(goals.map(g => {
      if (g.id === id) {
        const completed = !g.completed;
        if (completed && user) {
            setUser({ ...user, tokens: (user.tokens || 0) + (g.type === "daily" ? 10 : 50) });
        }
        return { ...g, completed, current: completed ? g.target : 0 };
      }
      return g;
    }));
  };

  return (
    <Card className="bg-white/5 border-white/5 backdrop-blur-xl shadow-2xl">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-lg font-bold flex items-center gap-2 tracking-tight">
          <Target className="w-5 h-5 text-primary" />
          Personal Goals
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={() => setIsAdding(!isAdding)} className="h-8 w-8 p-0 rounded-full hover:bg-white/10 transition-colors">
          <Plus className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <AnimatePresence>
          {isAdding && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-4">
              <div className="flex flex-col gap-3 p-4 rounded-2xl bg-black/40 border border-white/10">
                <input 
                  type="text" 
                  placeholder="What is your objective?" 
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary transition-colors text-white"
                  value={newGoal.title}
                  onChange={e => setNewGoal({ ...newGoal, title: e.target.value })}
                />
                <div className="flex gap-2">
                  <select 
                    className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary flex-1 text-white/80"
                    value={newGoal.type}
                    onChange={e => setNewGoal({ ...newGoal, type: e.target.value as any })}
                  >
                    <option value="daily" className="bg-[#09090b]">Daily</option>
                    <option value="monthly" className="bg-[#09090b]">Monthly</option>
                  </select>
                  <input 
                    type="number" 
                    placeholder="Target" 
                    min="1"
                    className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary w-24 text-white"
                    value={newGoal.target}
                    onChange={e => setNewGoal({ ...newGoal, target: parseInt(e.target.value) || 1 })}
                  />
                </div>
                <Button onClick={addGoal} className="w-full bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl h-10 transition-all active:scale-[0.98]">
                  Add Goal
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-2">
          {goals.map((goal) => (
            <div key={goal.id} className="group flex items-center gap-3 p-3 rounded-2xl bg-black/20 hover:bg-white/5 transition-colors border border-transparent hover:border-white/5 cursor-pointer" onClick={() => toggleGoal(goal.id)}>
              <button className="text-white/30 hover:text-primary transition-colors">
                {goal.completed ? <CheckCircle2 className="w-5 h-5 text-primary drop-shadow-[0_0_10px_var(--color-primary)]" /> : <Circle className="w-5 h-5" />}
              </button>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate transition-colors ${goal.completed ? 'text-white/30 line-through' : 'text-white/90'}`}>{goal.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[9px] font-extrabold uppercase tracking-widest text-primary/80 bg-primary/10 px-1.5 py-0.5 rounded-md border border-primary/20">
                    {goal.type}
                  </span>
                  <span className="text-xs text-white/40 font-mono">
                    {goal.current} / {goal.target}
                  </span>
                </div>
              </div>
              <div className="w-16 h-1.5 bg-black/50 rounded-full overflow-hidden shrink-0 border border-white/5">
                <div 
                  className="h-full bg-primary transition-all duration-1000 ease-out" 
                  style={{ width: `${Math.min(100, (goal.current / goal.target) * 100)}%` }} 
                />
              </div>
            </div>
          ))}
          {goals.length === 0 && (
            <p className="text-center text-sm text-white/30 py-6 font-medium">No active goals. Define an objective.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}