import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../drizzle/db";
import { goals } from "../../../drizzle/schema";
import { eq } from "drizzle-orm";

// 保存API
export async function POST(req: NextRequest) {
  const { userId, habit, goal } = await req.json();
  if (!userId)
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  // 既存レコードがあればUPDATE、なければINSERT
  const existing = await db
    .select()
    .from(goals)
    .where(eq(goals.user_id, userId))
    .limit(1);
  if (existing.length > 0) {
    await db
      .update(goals)
      .set({ habit, goal })
      .where(eq(goals.user_id, userId));
  } else {
    await db.insert(goals).values({ user_id: userId, habit, goal });
  }
  return NextResponse.json({ ok: true });
}

// 取得API
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  if (!userId)
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  const userIdNum = typeof userId === "string" ? Number(userId) : userId;
  const result = await db
    .select()
    .from(goals)
    .where(eq(goals.user_id, userIdNum))
    .limit(1);
  if (result.length > 0) {
    const { habit, goal } = result[0];
    return NextResponse.json({ habit, goal });
  } else {
    return NextResponse.json({});
  }
}
