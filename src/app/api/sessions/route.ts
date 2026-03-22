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
    const { taskTitle, duration, status, startedAt, endedAt } = await req.json();

    const session = await prisma.session.create({
      data: {
        userId,
        taskTitle,
        duration,
        status,
        startedAt: startedAt ? new Date(startedAt) : new Date(),
        endedAt: endedAt ? new Date(endedAt) : new Date()
      }
    });

    // Update Stats if SUCCESS
    if (status === 'SUCCESS') {
      const stats = await prisma.stats.findUnique({ where: { userId } });
      if (stats) {
        const xpEarned = duration * 10;
        const newTotalXP = stats.totalXP + xpEarned;
        
        const newLevel = Math.floor(newTotalXP / 1000) + 1;
        
        const now = new Date();
        const lastSessionDate = stats.lastSessionAt || new Date(0);
        
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const lastSessionDay = new Date(lastSessionDate.getFullYear(), lastSessionDate.getMonth(), lastSessionDate.getDate());
        
        const diffTime = Math.abs(today.getTime() - lastSessionDay.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

        let newStreak = stats.currentStreak;
        if (diffDays === 1) {
          newStreak += 1;
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
    }

    return NextResponse.json({ session }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
