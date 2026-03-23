import prisma from '@/lib/db';

export async function calculateFocusScore(userId: string): Promise<number> {
  const stats = await prisma.stats.findUnique({ where: { userId } });
  if (!stats) return 0;

  const sessions = await prisma.session.findMany({ where: { userId } });
  
  if (sessions.length === 0) return 0;

  const successSessions = sessions.filter((s: any) => s.status === "SUCCESS");
  const failedSessions = sessions.filter((s: any) => s.status === "FAILED");

  const successRate = successSessions.length / sessions.length;
  const scoreFromSuccess = successRate * 40;

  const streakScore = Math.min((stats.currentStreak / 10) * 30, 30);

  let avgDuration = 0;
  if (successSessions.length > 0) {
    const totalDuration = successSessions.reduce((acc: number, curr: any) => acc + curr.duration, 0);
    avgDuration = totalDuration / successSessions.length;
  }
  const durationScore = Math.min((avgDuration / 45) * 20, 20);

  const failPenalty = Math.min(failedSessions.length * 2, 20);

  let finalScore = Math.round(scoreFromSuccess + streakScore + durationScore - failPenalty);
  
  const totalDistractions = successSessions.reduce((acc: number, curr: any) => acc + (curr.distractionCount || 0), 0);
  const avgDistractions = successSessions.length > 0 ? totalDistractions / successSessions.length : 0;
  finalScore -= Math.round(avgDistractions * 2);

  return Math.max(0, Math.min(100, finalScore)); // Clamp 0-100
}
