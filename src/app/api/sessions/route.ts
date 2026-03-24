import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

async function getUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (!token) return null;
  const payload = await verifyToken(token);
  return payload?.userId as string;
}

export async function GET() {
  const userId = await getUser();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const sessions = await prisma.session.findMany({
    where: { userId },
    orderBy: { startedAt: 'desc' }
  });

  return NextResponse.json({ sessions });
}

export async function POST(req: Request) {
  const userId = await getUser();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { taskTitle, duration, status, distractionCount, inactiveDuration, startedAt, endedAt } = await req.json();

    const session = await prisma.session.create({
      data: {
        userId,
        taskTitle,
        duration,
        status,
        distractionCount: distractionCount || 0,
        inactiveDuration: inactiveDuration || 0,
        startedAt: startedAt ? new Date(startedAt) : new Date(),
        endedAt: endedAt ? new Date(endedAt) : new Date()
      }
    });

    let tokensEarned = 0;

    if (status === 'SUCCESS') {
      tokensEarned += duration * 4;

      const stats = await prisma.stats.findUnique({ where: { userId } });
      if (stats) {
        const xpEarned = duration * 10;
        const newTotalXP = stats.totalXP + xpEarned;
        const newLevel = Math.floor(newTotalXP / 1000) + 1;
        
        const now = new Date();
        const lastSessionDate = stats.lastSessionAt || new Date(0);
        const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
        const lastSessionDay = new Date(Date.UTC(lastSessionDate.getUTCFullYear(), lastSessionDate.getUTCMonth(), lastSessionDate.getUTCDate()));
        
        const diffTime = Math.abs(today.getTime() - lastSessionDay.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

        let newStreak = stats.currentStreak;
        if (diffDays === 1) {
          newStreak += 1;
          if (newStreak % 7 === 0) {
            tokensEarned += 50;
          }
        } else if (diffDays > 1) {
          newStreak = 1;
        } else {
          if (newStreak === 0) newStreak = 1;
        }
        const newBestStreak = Math.max(stats.bestStreak, newStreak);

        await prisma.stats.update({
          where: { id: stats.id },
          data: {
            totalXP: newTotalXP,
            level: newLevel,
            currentStreak: newStreak,
            bestStreak: newBestStreak,
            lastSessionAt: now
          }
        });
      }

      // V2: Update DailyStats
      const now = new Date();
      const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
      const firstDayOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

      await prisma.dailyStats.upsert({
        where: {
          userId_date: { userId, date: todayStart }
        },
        update: {
          totalFocusMinutes: { increment: duration },
          sessionsCount: { increment: 1 }
        },
        create: {
          userId,
          date: todayStart,
          totalFocusMinutes: duration,
          sessionsCount: 1
        }
      });

      // V2: Update Missions & Goals strictly for the active period
      const activeMissions = await prisma.mission.findMany({
        where: { 
          userId, 
          completed: false,
          OR:[
            { type: { startsWith: 'GOAL_MONTHLY' }, date: { gte: firstDayOfMonth } },
            { type: { not: { startsWith: 'GOAL_MONTHLY' } }, date: { gte: todayStart } }
          ]
        }
      });
      
      for (const m of activeMissions) {
        let newProgress = m.progress;
        if (m.type === "SESSIONS_COUNT" || m.type === "GOAL_MONTHLY_SESSIONS") newProgress += 1;
        if (m.type === "FOCUS_MINUTES" || m.type === "GOAL_MONTHLY_MINUTES") newProgress += duration;
        
        const completed = newProgress >= m.target;
        if (!m.completed && completed) {
          if (m.type.startsWith("GOAL_MONTHLY")) {
             tokensEarned += 100;
          } else {
             tokensEarned += 20; 
          }
        }
        
        await prisma.mission.update({
          where: { id: m.id },
          data: { progress: newProgress, completed }
        });
      }

      // Award Tokens
      if (tokensEarned > 0) {
        await prisma.user.update({
          where: { id: userId },
          data: { tokens: { increment: tokensEarned } }
        });
      }
    }

    return NextResponse.json({ session, tokensEarned }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}