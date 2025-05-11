import { db } from "@/drizzle/db";
import { habits, goals, self_analysis, records } from "@/drizzle/schema";
import { eq, desc } from "drizzle-orm";

export async function buildCheerUpPrompt(userId: number) {
  // 各種データ取得
  const habitRow = (
    await db.select().from(habits).where(eq(habits.user_id, userId))
  )[0];
  const goalRow = (
    await db.select().from(goals).where(eq(goals.user_id, userId))
  )[0];
  const selfRow = (
    await db
      .select()
      .from(self_analysis)
      .where(eq(self_analysis.user_id, userId))
  )[0];
  // 日記抜粋（最新1件の冒頭50文字）
  const diaryRow = (
    await db
      .select()
      .from(records)
      .where(eq(records.user_id, userId))
      .orderBy(desc(records.date))
      .limit(1)
  )[0];
  const diarySnippet = diaryRow?.diary?.slice(0, 50) ?? "";

  const idealHabits = habitRow?.ideal_habits?.join("、") ?? "";
  const shortTermGoals = goalRow?.short_term_goals?.join("、") ?? "";
  const strengths = selfRow?.strengths?.join("、") ?? "";

  return `
以下はユーザーの進捗や日記の抜粋です。
理想の習慣: ${idealHabits}
短期目標: ${shortTermGoals}
強み: ${strengths}
日記抜粋: ${diarySnippet}

ユーザーを元気づけるポジティブで楽しいメッセージを送ってください。日記内容に触れ、ポジティブなフィードバックを加えてください。とにかく褒めまくってください。
  `;
}
