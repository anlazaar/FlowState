import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { calculateFocusScore } from '@/lib/score';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || !payload.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userId = payload.userId as string;
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

    let user = await prisma.user.findUnique({
      where: { id: userId },
      include: { 
        stats: true,
        dailyStats: {
          where: { date: { gte: ninetyDaysAgo } },
          orderBy: { date: 'asc' }
        },
        missions: {
          where: { date: { gte: todayStart } }
        },
        links: true,
        unlocks: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.username) {
      const generatedUsername = user.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '') + Math.floor(Math.random() * 10000);
      user = await prisma.user.update({
        where: { id: user.id },
        data: { username: generatedUsername },
        include: { 
          stats: true, 
          dailyStats: { where: { date: { gte: ninetyDaysAgo } }, orderBy: { date: 'asc' } }, 
          missions: { where: { date: { gte: todayStart } } },
          links: true,
          unlocks: true
        }
      });
    }

    const hasGoalsFeature = user.unlocks.some((u: any) => u.itemId === 'feature-goals');
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Check if monthly goals exist
    const hasMonthlyGoals = user.missions.some((m: any) => m.type.startsWith('GOAL_MONTHLY') && m.date >= firstDayOfMonth);
    
    if (hasGoalsFeature && !hasMonthlyGoals) {
      const generatedGoals = [
        { userId, type: "GOAL_MONTHLY_MINUTES", target: 600, progress: 0, completed: false, date: firstDayOfMonth },
        { userId, type: "GOAL_MONTHLY_SESSIONS", target: 20, progress: 0, completed: false, date: firstDayOfMonth }
      ];
      await prisma.mission.createMany({ data: generatedGoals });
      
      // refetch missions
      const updatedMissions = await prisma.mission.findMany({ 
        where: { userId } 
      });
      user.missions = updatedMissions;
    }

    let userMissions = user.missions;
    if (userMissions.length === 0) {
      const generatedMissions = [
        { userId, type: "SESSIONS_COUNT", target: 3, progress: 0, completed: false, date: todayStart },
        { userId, type: "FOCUS_MINUTES", target: 60, progress: 0, completed: false, date: todayStart },
        { userId, type: "FOCUS_MINUTES", target: 120, progress: 0, completed: false, date: todayStart }
      ];
      await prisma.mission.createMany({ data: generatedMissions });
      
      const updatedDailyMissions = await prisma.mission.findMany({ 
        where: { userId } 
      });
      userMissions = updatedDailyMissions;
    }

    const focusScore = await calculateFocusScore(user.id);

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        profileImageUrl: user.profileImageUrl,
        themeColor: user.themeColor,
        backgroundGradient: user.backgroundGradient,
        textColor: user.textColor,
        usernameFont: user.usernameFont,
        backgroundStyle: user.backgroundStyle,
        links: user.links,
        tokens: user.tokens,
        unlocks: user.unlocks
      },
      stats: {
        ...user.stats,
        focusScore
      },
      dailyStats: user.dailyStats,
      missions: userMissions
    });
  } catch (error: any) {
    console.error("API /auth/me error:", error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
