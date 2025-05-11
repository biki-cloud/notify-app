import { NextResponse } from "next/server";
import { db } from "../../../drizzle/db";
import { records, ai_logs } from "../../../drizzle/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = Number(searchParams.get("userId"));
  if (!userId)
    return NextResponse.json({ error: "userId required" }, { status: 400 });

  // DBから記録を取得
  const recordRows = await db
    .select()
    .from(records)
    .where(eq(records.user_id, userId))
    .orderBy(desc(records.date));
  const userRecords = recordRows.map((row) => ({
    time: row.date,
    mood: Array.isArray(row.mood) ? row.mood : row.mood ? [row.mood] : [],
    text: row.diary,
  }));

  // timeとtextで重複排除
  const uniqueDiaryItems = userRecords.filter(
    (item, idx, self) =>
      self.findIndex((v) => v.time === item.time && v.text === item.text) ===
      idx
  );

  // DBからAIコーチング内容を取得
  const aiLogRows = await db
    .select()
    .from(ai_logs)
    .where(eq(ai_logs.user_id, userId))
    .orderBy(desc(ai_logs.timestamp));
  const aiEntries = aiLogRows.map((entry) => ({
    timestamp: entry.timestamp,
    response: entry.response,
    coachingType: entry.coaching_type,
  }));

  // recordとai_logを統合して時系列順に並べる
  const mergedItems = [
    ...uniqueDiaryItems.map((item) => ({
      type: "diary" as const,
      time: item.time,
      mood: item.mood,
      text: item.text,
    })),
    ...aiEntries.map((entry) => ({
      type: "ai" as const,
      time: entry.timestamp,
      text: entry.response,
      coachingType: entry.coachingType,
    })),
  ].sort((a, b) => b.time.localeCompare(a.time));

  return NextResponse.json({ items: mergedItems });
}
