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

  try {
    const unlocks = await prisma.userUnlock.findMany({
      where: { userId }
    });

    return NextResponse.json({ unlocks });
  } catch (error) {
    console.error("Shop GET error:", error);
    return NextResponse.json({ error: 'Failed to fetch unlocks. Please restart your dev server.' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const userId = await getUser();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { type, itemId, price } = await req.json();

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.tokens < price) {
      return NextResponse.json({ error: 'Not enough FlowTokens' }, { status: 400 });
    }

    // Check if already unlocked
    const existingUnlock = await prisma.userUnlock.findUnique({
      where: {
        userId_type_itemId: {
          userId,
          type,
          itemId
        }
      }
    });

    if (existingUnlock) {
      return NextResponse.json({ error: 'Item already unlocked' }, { status: 400 });
    }

    // Transaction to deduct tokens and create unlock
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { tokens: { decrement: price } }
      }),
      prisma.userUnlock.create({
        data: {
          userId,
          type,
          itemId
        }
      })
    ]);

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Shop purchase error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
