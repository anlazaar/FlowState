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

export async function POST(req: Request) {
  const userId = await getUser();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { title, type, period, target } = await req.json();
    
    // Check goal limit
    const existingCount = await prisma.personalGoal.count({
      where: { userId, completed: false }
    });
    
    if (existingCount >= 5) {
      return NextResponse.json({ error: 'Maximum 5 active goals allowed' }, { status: 400 });
    }

    const goal = await prisma.personalGoal.create({
      data: {
        userId,
        title,
        type,
        period,
        target,
        progress: 0,
        completed: false
      }
    });

    return NextResponse.json({ goal }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const userId = await getUser();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) return NextResponse.json({ error: 'Goal ID required' }, { status: 400 });

    await prisma.personalGoal.deleteMany({
      where: { id, userId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
