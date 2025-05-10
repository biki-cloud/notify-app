import { NextRequest, NextResponse } from "next/server";
import { db } from "@/drizzle/db";
import { goals } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

// GET: /api/goals?userId=xxx
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  if (!userId)
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  const rows = await db
    .select()
    .from(goals)
    .where(eq(goals.user_id, Number(userId)));
  const data = rows[0];
  if (!data) return NextResponse.json({}, { status: 200 });
  return NextResponse.json({
    short_term_goals: data.short_term_goals,
    mid_term_goals: data.mid_term_goals,
    long_term_goals: data.long_term_goals,
    life_goals: data.life_goals,
    core_values: data.core_values,
  });
}

// POST: /api/goals
export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    userId,
    short_term_goals,
    mid_term_goals,
    long_term_goals,
    life_goals,
    core_values,
  } = body;
  if (!userId)
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  const rows = await db
    .select()
    .from(goals)
    .where(eq(goals.user_id, Number(userId)));
  if (rows.length > 0) {
    await db
      .update(goals)
      .set({
        short_term_goals,
        mid_term_goals,
        long_term_goals,
        life_goals,
        core_values,
      })
      .where(eq(goals.user_id, Number(userId)));
  } else {
    await db.insert(goals).values({
      user_id: Number(userId),
      short_term_goals,
      mid_term_goals,
      long_term_goals,
      life_goals,
      core_values,
    });
  }
  return NextResponse.json({ ok: true });
}
