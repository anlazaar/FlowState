import { User } from "@/store/useStore";
import { Github, Linkedin, Globe, MapPin, Calendar, Clock, Trophy } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Heatmap } from "./Heatmap";

interface ProfilePreviewProps {
  user: Partial<User>;
  stats: any;
  mode: "full" | "card";
}

export function ProfilePreview({ user, stats, mode }: ProfilePreviewProps) {
  const isCard = mode === "card";

  return (
    <div className={`w-full overflow-hidden relative flex flex-col ${user.backgroundGradient || "bg-background"} border border-white/10 rounded-3xl transition-all duration-500 shadow-2xl ${user.themeColor || "theme-violet"}`}>
      {/* Background Style Overlay */}
      {user.backgroundStyle && user.backgroundStyle !== "bg-none" && (
        <div className={`absolute inset-0 z-0 opacity-40 mix-blend-overlay ${user.backgroundStyle}`} />
      )}

      {/* Content */}
      <div className="relative z-10 w-full flex-1 p-6 flex flex-col gap-6">
        
        {/* Header Section */}
        <div className={`flex ${isCard ? 'flex-col items-center text-center' : 'items-center gap-6'}`}>
          <div className={`shrink-0 rounded-full border-4 border-primary/20 bg-black overflow-hidden relative ${isCard ? 'w-24 h-24 mb-4' : 'w-32 h-32'}`}>
            {user.profileImageUrl ? (
              <img src={user.profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary/10">
                <span className="text-4xl font-black text-primary uppercase tracking-tighter">FS</span>
              </div>
            )}
          </div>
          <div className="flex-1">
            <h2 className={`font-black uppercase tracking-tight ${user.textColor || "text-foreground"} ${user.usernameFont || "font-sans"} ${isCard ? 'text-2xl' : 'text-3xl lg:text-5xl'}`}>
              {user.username || "username"}
            </h2>
            <div className="flex items-center gap-3 mt-2 text-white/50 text-sm justify-center md:justify-start">
              <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> Earth</span>
              <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> Joined Today</span>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className={`grid gap-3 ${isCard ? 'grid-cols-2' : 'grid-cols-2 lg:grid-cols-4'}`}>
          <Card className="glass border-white/10 text-center py-4">
            <p className="text-xs text-white/50 font-bold uppercase tracking-wider mb-1">Level</p>
            <p className="text-2xl font-black text-primary">{stats?.level || 1}</p>
          </Card>
          <Card className="glass border-white/10 text-center py-4">
            <p className="text-xs text-white/50 font-bold uppercase tracking-wider mb-1">XP</p>
            <p className="text-2xl font-black">{stats?.totalXP || 0}</p>
          </Card>
          {!isCard && (
            <>
              <Card className="glass border-white/10 text-center py-4">
                <p className="text-xs text-white/50 font-bold uppercase tracking-wider mb-1">Streak</p>
                <p className="text-2xl font-black text-orange-500">{stats?.currentStreak || 0} 🔥</p>
              </Card>
              <Card className="glass border-white/10 text-center py-4">
                <p className="text-xs text-white/50 font-bold uppercase tracking-wider mb-1">Focus</p>
                <p className="text-2xl font-black text-blue-500">{stats?.focusScore || 0}</p>
              </Card>
            </>
          )}
        </div>

        {/* Extended Profile Only */}
        {!isCard && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap gap-2">
              {(user.links || []).map((link, i) => {
                const isGithub = link.type === 'github';
                const isLinkedin = link.type === 'linkedin';
                return (
                  <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-full glass border border-white/10 text-sm text-white/70">
                    {isGithub ? <Github className="w-4 h-4" /> : isLinkedin ? <Linkedin className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                    {link.url.replace(/^https?:\/\//, '')}
                  </div>
                );
              })}
            </div>

            <Card className="glass border-white/10 p-6">
              <h3 className="text-lg font-bold mb-4">Activity Heatmap</h3>
              {/* Note: We pass a mock dummy matrix for preview purposes */}
              <div className="opacity-50 pointer-events-none">
                <Heatmap 
                  data={[
                    { date: '2026-03-01', totalFocusMinutes: 0, sessionsCount: 0 },
                    { date: '2026-03-02', totalFocusMinutes: 60, sessionsCount: 2 },
                    { date: '2026-03-03', totalFocusMinutes: 120, sessionsCount: 4 },
                    { date: '2026-03-04', totalFocusMinutes: 30, sessionsCount: 1 },
                    { date: '2026-03-05', totalFocusMinutes: 200, sessionsCount: 5 }
                  ]} 
                />
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
