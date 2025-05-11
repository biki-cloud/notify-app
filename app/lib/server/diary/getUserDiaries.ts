import { db } from "@/drizzle/db";
import { records } from "@/drizzle/schema";
import { desc, eq } from "drizzle-orm";

export async function getDiaryData(userId: number, diaryCount: number = 3) {
  const diaryRows = await db
    .select()
    .from(records)
    .where(eq(records.user_id, userId))
    .orderBy(desc(records.date))
    .limit(diaryCount);

  return diaryRows.map((row) => ({
    date: row.date,
    mood: Array.isArray(row.mood) ? row.mood.join("・") : String(row.mood),
    diary: row.diary,
  }));
}

export async function buildDiaryPrompt(userId: number, diaryCount: number = 3) {
  const diaries = await getDiaryData(userId, diaryCount);
  return diaries
    .map((d) => `【${d.date}】(気分: ${d.mood})\n${d.diary}`)
    .join("\n\n");
}
