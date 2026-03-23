import { memo } from "react";
import { Mission } from "@/store/useStore";
import { CheckCircle2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export const MissionsList = memo(function MissionsList({ missions }: { missions: Mission[] }) {
  if (!missions.length) return <div className="text-white/50 text-sm">No missions for today.</div>;

  const getTitle = (m: Mission) => {
    if (m.type === "SESSIONS_COUNT") return `Complete ${m.target} sessions`;
    if (m.type === "FOCUS_MINUTES") return `Focus for ${m.target} minutes`;
    if (m.type === "FOCUS_SCORE") return `Reach ${m.target} Focus Score`;
    return "Complete task";
  };

  return (
    <div className="space-y-4">
      {missions.map(m => {
        const percent = Math.min(100, (m.progress / m.target) * 100);
        return (
          <div key={m.id} className="p-4 bg-black/40 rounded-xl border border-white/10 hover:border-violet-500/30 hover:bg-white/5 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className={`text-sm font-bold ${m.completed ? 'text-green-400 line-through opacity-70' : 'text-white'}`}>
                {getTitle(m)}
              </span>
              {m.completed ? (
                <CheckCircle2 className="w-5 h-5 text-green-500 drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
              ) : (
                <span className="text-xs text-white/60 font-bold bg-white/10 px-2 py-1 rounded-md">{m.progress} / {m.target}</span>
              )}
            </div>
            <Progress value={percent} className="h-2 bg-black/50" />
          </div>
        );
      })}
    </div>
  );
});
