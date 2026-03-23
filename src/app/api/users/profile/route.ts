import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function PUT(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload || !payload.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = payload.userId as string;
    const body = await req.json();
    
    const { username, profileImageUrl, themeColor, backgroundGradient, textColor, links } = body;

    // Validate username uniquely if changed
    if (username) {
      const existing = await prisma.user.findUnique({ where: { username } });
      if (existing && existing.id !== userId) {
        return NextResponse.json({ error: 'Username already taken' }, { status: 400 });
      }
      
      const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
      if (!usernameRegex.test(username)) {
        return NextResponse.json({ error: 'Username must be 3-20 characters long and contain only letters, numbers, and underscores.' }, { status: 400 });
      }
    }

    // Prepare update data
    const updateData: any = {};
    if (username !== undefined) updateData.username = username;
    if (profileImageUrl !== undefined) updateData.profileImageUrl = profileImageUrl;
    if (themeColor !== undefined) updateData.themeColor = themeColor;
    if (backgroundGradient !== undefined) updateData.backgroundGradient = backgroundGradient;
    if (textColor !== undefined) updateData.textColor = textColor;

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData
    });

    if (links && Array.isArray(links)) {
      await prisma.userLink.deleteMany({ where: { userId } });
      if (links.length > 0) {
        const linkData = links.map((l: any) => ({
          userId,
          type: l.type,
          url: l.url
        }));
        await prisma.userLink.createMany({ data: linkData });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
