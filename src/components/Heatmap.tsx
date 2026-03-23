import { memo } from "react";
import { DailyStat } from "@/store/useStore";

export const Heatmap = memo(function Heatmap({ data }: { data: DailyStat[] }) {
  const days = 90;
  const today = new Date();
  
  const grid = Array.from({ length: days }).map((_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (days - 1 - i));
    return d.toISOString().split('T')[0];
  });

  const dataMap = new Map(data.map(d => [d.date.split('T')[0], d]));

  const getIntensity = (minutes: number) => {
    if (minutes === 0) return "bg-white/5";
    if (minutes < 30) return "bg-primary/30";
    if (minutes < 60) return "bg-primary/60";
    if (minutes < 120) return "bg-primary shadow-sm shadow-primary/50";
    return "bg-primary shadow-md shadow-primary/80 ring-1 ring-white/30";
  };

  const weeks = [];
  for (let i = 0; i < grid.length; i += 7) {
    weeks.push(grid.slice(i, i + 7));
  }

  return (
    <div className="flex gap-[4px] overflow-x-auto pb-2 scrollbar-hide py-2">
      {weeks.map((week, wi) => (
        <div key={wi} className="flex flex-col gap-[4px]">
          {week.map((dateStr) => {
            const stat = dataMap.get(dateStr);
            const mins = stat?.totalFocusMinutes || 0;
            const sessions = stat?.sessionsCount || 0;
            const title = `${new Date(dateStr).toLocaleDateString()}: ${mins} minutes • ${sessions} sessions`;
            return (
              <div 
                key={dateStr}
                title={title}
                className={`w-[14px] h-[14px] rounded-sm ${getIntensity(mins)} transition-all hover:scale-125 hover:z-10 relative cursor-pointer`}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
});
