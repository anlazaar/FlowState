import prisma from "@/lib/db";
import { notFound } from "next/navigation";
import { calculateFocusScore } from "@/lib/score";
import { Heatmap } from "@/components/Heatmap";
import { Flame, Clock, Trophy, Github, Linkedin, Globe, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default async function PublicProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  
  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      stats: true,
      links: true,
      dailyStats: {
        where: { date: { gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) } },
        orderBy: { date: 'asc' }
      },
      unlocks: true
    }
  });

  if (!user || !user.stats) {
    return notFound();
  }

  const focusScore = await calculateFocusScore(user.id);
  
  const getFocusTier = (score: number) => {
    if (score < 40) return { label: "Initiate", color: "text-white/50", ring: "ring-white/10" };
    if (score < 70) return { label: "Consistent", color: "text-blue-400", ring: "ring-blue-400/50" };
    if (score < 90) return { label: "Flow State", color: "text-primary drop-shadow-[0_0_10px_var(--color-primary)]", ring: "ring-primary ring-offset-4 ring-offset-[#030305]" };
    return { label: "Elite", color: "text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.6)]", ring: "ring-amber-400 ring-offset-4 ring-offset-[#030305]" };
  };

  const tier = getFocusTier(focusScore);
  const mappedDailyStats = user.dailyStats.map((d: any) => ({
    date: d.date.toISOString(),
    totalFocusMinutes: d.totalFocusMinutes,
    sessionsCount: d.sessionsCount
  }));

  const totalHours = Math.floor(user.dailyStats.reduce((a: any, b: any) => a + b.totalFocusMinutes, 0) / 60);

  const bgClass = user.backgroundStyle === "bg-none" ? "" : user.backgroundStyle;
  
  // Status Unlocks
  const hasGoldBadge = user.activeBadge === "badge-gold";
  const hasEliteRing = user.activeBadge === "badge-elite-ring";
  const hasFocusMaster = user.activeBadge === "badge-focus-master";

  const avatarRing = hasEliteRing ? "ring-[6px] ring-amber-400 ring-offset-[6px] ring-offset-[#030305] shadow-[0_0_30px_rgba(251,191,36,0.8)]" : tier.ring;

  return (
    <div className={`min-h-screen bg-[#030305] text-white flex flex-col items-center py-20 px-4 relative overflow-hidden ${user.themeColor || 'theme-violet'}`}>
      
      {bgClass && (
        <div className={`absolute inset-0 z-0 pointer-events-none opacity-40 ${bgClass}`} />
      )}
      
      <div className="absolute top-[-10%] left-[50%] -translate-x-1/2 w-[50vw] h-[50vw] rounded-full bg-primary/10 blur-[140px] mix-blend-screen pointer-events-none z-0" />

      <div className="z-10 w-full max-w-4xl space-y-16">
        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-8">
          <div className="relative">
            {user.profileImageUrl ? (
              <div className={`w-40 h-40 rounded-full overflow-hidden border-4 border-[#030305] ${avatarRing} z-10 relative bg-black transition-all duration-500`}>
                <img src={user.profileImageUrl} alt={user.username!} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className={`w-40 h-40 rounded-full flex items-center justify-center bg-black/40 border-4 border-[#030305] ${avatarRing} backdrop-blur-md z-10 relative transition-all duration-500`}>
                <span className="text-5xl font-black">{focusScore}</span>
              </div>
            )}
            
            {user.profileImageUrl && (
              <div className={`absolute -bottom-2 -right-2 w-14 h-14 rounded-full flex items-center justify-center bg-[#09090b] border-4 border-[#030305] ${tier.ring} shadow-2xl z-20`}>
                <span className="text-sm font-black text-white">{focusScore}</span>
              </div>
            )}
          </div>

          <div>
            <h1 className={`text-5xl md:text-7xl font-black tracking-tighter mb-4 flex flex-wrap items-center justify-center gap-3 w-full max-w-[90vw] ${user.usernameFont || "font-inter"}`}>
              <span className="truncate max-w-full">@{user.username}</span>
              {hasFocusMaster && (
                <span title="Focus Master" className="text-violet-400 drop-shadow-[0_0_20px_rgba(139,92,246,0.8)] filter">
                  <Sparkles className="w-10 h-10 md:w-14 md:h-14" />
                </span>
              )}
              {hasGoldBadge && (
                <span title="Gold Member" className="text-4xl md:text-5xl drop-shadow-[0_0_20px_rgba(251,191,36,0.8)] filter">
                  ⭐
                </span>
              )}
            </h1>
            <p className={`text-xl font-bold uppercase tracking-[0.2em] ${tier.color}`}>
              {tier.label}
            </p>
          </div>

          {user.links && user.links.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-3 relative z-20">
              {user.links.map((link: any) => (
                <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 hover:bg-white/10 transition-colors border border-white/5 hover:border-white/20 text-sm font-semibold backdrop-blur-md shadow-lg">
                  {link.type === 'github' ? <Github className="w-4 h-4"/> : 
                   link.type === 'linkedin' ? <Linkedin className="w-4 h-4"/> : 
                   <Globe className="w-4 h-4"/>}
                   {link.url.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid gap-5 md:grid-cols-3 relative z-20">
          <Card className="bg-white/5 border-white/5 backdrop-blur-xl shadow-2xl rounded-3xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-bold text-white/50 uppercase tracking-widest">Streak</CardTitle>
              <Flame className="w-5 h-5 text-orange-500 drop-shadow-[0_0_10px_rgba(249,115,22,0.6)]" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black tracking-tight">{user.stats.currentStreak} <span className="text-lg text-white/30 font-medium tracking-normal">Days</span></div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/5 border-white/5 backdrop-blur-xl shadow-2xl rounded-3xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-bold text-white/50 uppercase tracking-widest">Level</CardTitle>
              <Trophy className="w-5 h-5 text-primary drop-shadow-[0_0_10px_var(--color-primary)]" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black tracking-tight">{user.stats.level}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/5 backdrop-blur-xl shadow-2xl rounded-3xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-bold text-white/50 uppercase tracking-widest">Deep Work</CardTitle>
              <Clock className="w-5 h-5 text-blue-500 drop-shadow-[0_0_10px_rgba(59,130,246,0.6)]" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black tracking-tight">{totalHours} <span className="text-lg text-white/30 font-medium tracking-normal">Hours</span></div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white/5 border-white/5 backdrop-blur-xl rounded-3xl p-6 md:p-10 relative z-20 shadow-2xl">
          <h2 className="text-xl font-extrabold tracking-tight mb-8">Activity Heatmap</h2>
          <div className="overflow-x-auto">
            <div className="min-w-[700px] pb-4">
               <Heatmap data={mappedDailyStats} />
            </div>
          </div>
        </Card>

        <div className="text-center pt-12 relative z-20">
          <p className="text-white/40 font-medium mb-6">Ready to forge your own discipline?</p>
          <Link href="/" className="px-8 py-4 bg-white text-black font-extrabold rounded-full hover:bg-white/90 hover:scale-105 transition-all inline-block shadow-[0_0_30px_rgba(255,255,255,0.2)]">
            Join FlowState
          </Link>
        </div>
      </div>
    </div>
  );
}