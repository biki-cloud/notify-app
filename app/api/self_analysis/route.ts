import { NextRequest, NextResponse } from "next/server";
import { db } from "@/drizzle/db";
import { self_analysis } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

// GET: /api/self_analysis?userId=xxx
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  if (!userId)
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  const rows = await db
    .select()
    .from(self_analysis)
    .where(eq(self_analysis.user_id, Number(userId)));
  const data = rows[0];
  if (!data) return NextResponse.json({}, { status: 200 });
  return NextResponse.json({
    strengths: data.strengths,
    weaknesses: data.weaknesses,
  });
}

// POST: /api/self_analysis
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { userId, strengths, weaknesses } = body;
  if (!userId)
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  const rows = await db
    .select()
    .from(self_analysis)
    .where(eq(self_analysis.user_id, Number(userId)));
  if (rows.length > 0) {
    await db
      .update(self_analysis)
      .set({ strengths, weaknesses })
      .where(eq(self_analysis.user_id, Number(userId)));
  } else {
    await db.insert(self_analysis).values({
      user_id: Number(userId),
      strengths,
      weaknesses,
    });
  }
  return NextResponse.json({ ok: true });
}
