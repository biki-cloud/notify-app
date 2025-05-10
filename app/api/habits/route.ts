import { NextRequest, NextResponse } from "next/server";
import { db } from "@/drizzle/db";
import { habits } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

// GET: /api/habits?userId=xxx
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  if (!userId)
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  const rows = await db
    .select()
    .from(habits)
    .where(eq(habits.user_id, Number(userId)));
  const data = rows[0];
  if (!data) return NextResponse.json({}, { status: 200 });
  return NextResponse.json({
    ideal_habits: data.ideal_habits,
    bad_habits: data.bad_habits,
    new_habits: data.new_habits,
    tracking_habits: data.tracking_habits,
  });
}

// POST: /api/habits
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { userId, ideal_habits, bad_habits, new_habits, tracking_habits } =
    body;
  if (!userId)
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  const rows = await db
    .select()
    .from(habits)
    .where(eq(habits.user_id, Number(userId)));
  if (rows.length > 0) {
    await db
      .update(habits)
      .set({ ideal_habits, bad_habits, new_habits, tracking_habits })
      .where(eq(habits.user_id, Number(userId)));
  } else {
    await db.insert(habits).values({
      user_id: Number(userId),
      ideal_habits,
      bad_habits,
      new_habits,
      tracking_habits,
    });
  }
  return NextResponse.json({ ok: true });
}
