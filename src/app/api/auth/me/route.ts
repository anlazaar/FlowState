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
    
    // Use UTC to prevent timezone boundary issues
    const now = new Date();
    const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const firstDayOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
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
        personalGoals: true,
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
          personalGoals: true,
          links: true,
          unlocks: true
        }
      });
    }

    // 1. Fetch current active missions (will include duplicates if the DB is glitched)
    let activeMissions = user.missions;

    // 2. AUTO-HEAL DATABASE: Deduplicate glitched missions created by the previous bug
    const missionsToKeep = new Map();
    const missionsToDelete: string[] =[];

    for (const m of activeMissions) {
      // Create a unique key based on the type of mission and its target
      const key = `${m.type}-${m.target}`;
      
      if (!missionsToKeep.has(key)) {
        missionsToKeep.set(key, m);
      } else {
        const existing = missionsToKeep.get(key);
        // Compare progress to ensure we NEVER delete the user's highest progress
        if (m.progress > existing.progress) {
          missionsToDelete.push(existing.id); // Mark old one for deletion
          missionsToKeep.set(key, m); // Keep the one with better progress
        } else {
          missionsToDelete.push(m.id); // Mark current duplicate for deletion
        }
      }
    }

    // Execute the cleanup query
    if (missionsToDelete.length > 0) {
      await prisma.mission.deleteMany({
        where: { id: { in: missionsToDelete } }
      });
      // Replace activeMissions with ONLY the deduplicated ones
      activeMissions = Array.from(missionsToKeep.values());
    }

    // 3. GENERATE MISSING MISSIONS (Only runs if you don't have them)
    let userMissions = activeMissions;
    if (userMissions.length === 0) {
      const generatedMissions = [
        { userId, type: "SESSIONS_COUNT", target: 3, progress: 0, completed: false, date: todayStart },
        { userId, type: "FOCUS_MINUTES", target: 60, progress: 0, completed: false, date: todayStart },
        { userId, type: "FOCUS_MINUTES", target: 120, progress: 0, completed: false, date: todayStart }
      ];
      await prisma.mission.createMany({ data: generatedMissions });
      
      const updatedDailyMissions = await prisma.mission.findMany({ 
        where: { userId, date: { gte: todayStart } } 
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
        unlocks: user.unlocks,
        activeBadge: user.activeBadge,
        personalGoals: user.personalGoals || []
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