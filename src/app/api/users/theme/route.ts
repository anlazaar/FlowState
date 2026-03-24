import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

const VALID_THEMES =[
  "theme-violet", "theme-blue", "theme-green", "theme-orange",
  "theme-violet-pro", "theme-emerald-soft", "theme-rose-quartz", 
  "theme-amber", "theme-neon-pink", "theme-monochrome"
];

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload || !payload.userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    const userId = payload.userId as string;

    const body = await req.json();
    const { themeColor } = body;

    if (!VALID_THEMES.includes(themeColor)) {
      return NextResponse.json({ error: "Invalid premium theme color" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { themeColor },
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error("Failed to update theme", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}