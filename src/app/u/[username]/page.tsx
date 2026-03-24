import prisma from "@/lib/db";
import { notFound } from "next/navigation";
import { calculateFocusScore } from "@/lib/score";
import { Heatmap } from "@/components/Heatmap";
import { Flame, Clock, Trophy, Link as LinkIcon, Github, Linkedin, Globe } from "lucide-react";
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
    if (score < 40) return { label: "Beginner", color: "text-gray-400", ring: "ring-gray-400" };
    if (score < 70) return { label: "Consistent", color: "text-blue-400", ring: "ring-blue-400" };
    if (score < 90) return { label: "Focused", color: "text-violet-400 drop-shadow-[0_0_10px_rgba(139,92,246,0.6)]", ring: "ring-violet-400 ring-offset-2 ring-offset-black" };
    return { label: "Elite", color: "text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.8)]", ring: "ring-yellow-400 ring-offset-4 ring-offset-black" };
  };

  const tier = getFocusTier(focusScore);
  const mappedDailyStats = user.dailyStats.map((d: any) => ({
    date: d.date.toISOString(),
    totalFocusMinutes: d.totalFocusMinutes,
    sessionsCount: d.sessionsCount
  }));

  const totalHours = Math.floor(user.dailyStats.reduce((a: any, b: any) => a + b.totalFocusMinutes, 0) / 60);

  // Take the exact class name from the DB (e.g., "bg-pattern-grid") to trigger globals.css
  const bgClass = user.backgroundStyle === "bg-none" ? "" : user.backgroundStyle;
  
  const hasGoldBadge = user.unlocks?.some((u: any) => u.itemId === "badge-gold");

  return (
    <div className={`min-h-screen bg-[#030305] text-white flex flex-col items-center py-16 px-4 relative overflow-hidden ${user.themeColor || 'theme-violet'}`}>
      
      {/* Background Pattern injected here from globals.css */}
      {bgClass && (
        <div className={`absolute inset-0 z-0 pointer-events-none ${bgClass}`} />
      )}
      
      {/* Dynamic Theme Glow */}
      <div className="absolute top-[-10%] left-[50%] -translate-x-1/2 w-[50vw] h-[50vw] rounded-full bg-primary/10 blur-[120px] mix-blend-screen pointer-events-none z-0" />

      <div className="z-10 w-full max-w-4xl space-y-12">
        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="relative">
            {user.profileImageUrl ? (
              <div className={`w-36 h-36 rounded-full overflow-hidden border-4 border-[#030305] ${tier.ring} shadow-2xl z-10 relative bg-black`}>
                <img src={user.profileImageUrl} alt={user.username!} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className={`w-36 h-36 rounded-full flex items-center justify-center bg-black/40 border-4 border-[#030305] ${tier.ring} shadow-2xl backdrop-blur-md z-10 relative`}>
                <span className="text-5xl font-black">{focusScore}</span>
              </div>
            )}
            
            {user.profileImageUrl && (
              <div className={`absolute -bottom-2 -right-2 w-12 h-12 rounded-full flex items-center justify-center bg-black border-[3px] border-[#030305] ${tier.ring} shadow-xl z-20`}>
                <span className="text-sm font-black">{focusScore}</span>
              </div>
            )}
          </div>

          <div>
            <h1 className={`text-4xl md:text-6xl font-black tracking-tight mb-2 flex items-center justify-center gap-3 ${user.usernameFont || "font-sans"}`}>
              @{user.username}
              {hasGoldBadge && (
                <span title="Premium Member" className="text-3xl drop-shadow-[0_0_15px_rgba(251,191,36,0.8)] filter">
                  🌟
                </span>
              )}
            </h1>
            <p className={`text-2xl font-bold uppercase tracking-widest ${tier.color}`}>
              {tier.label} focuser
            </p>
          </div>

          {user.links && user.links.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-3 relative z-20">
              {user.links.map((link: any) => (
                <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors border border-white/10 text-sm font-medium backdrop-blur-sm">
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
        <div className="grid gap-4 md:grid-cols-3 relative z-20">
          <Card className="bg-black/40 border-orange-500/20 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
              <Flame className="w-5 h-5 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{user.stats.currentStreak} Days</div>
            </CardContent>
          </Card>
          
          <Card className="bg-black/40 border-violet-500/20 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Flow Level</CardTitle>
              <Trophy className="w-5 h-5 text-violet-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">Lvl {user.stats.level}</div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-blue-500/20 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Focus</CardTitle>
              <Clock className="w-5 h-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalHours} Hours</div>
            </CardContent>
          </Card>
        </div>

        {/* Heatmap */}
        <Card className="bg-black/40 border-white/10 backdrop-blur-md p-4 md:p-8 relative z-20">
          <h2 className="text-xl font-bold tracking-tight mb-6">Activity Heatmap</h2>
          <div className="overflow-x-auto">
            <div className="min-w-[700px] pb-4">
               <Heatmap data={mappedDailyStats} />
            </div>
          </div>
        </Card>

        <div className="text-center pt-8 relative z-20">
          <p className="text-white/50 mb-4">Want to build your own discipline?</p>
          <Link href="/" className="px-6 py-3 bg-white text-black font-bold rounded-full hover:bg-white/90 transition-colors inline-block">
            Join FlowState
          </Link>
        </div>
      </div>
    </div>
  );
}