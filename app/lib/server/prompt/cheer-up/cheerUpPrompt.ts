import { db } from "@/drizzle/db";
import { habits, goals, self_analysis } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { buildDiaryPrompt } from "../../diary/getUserDiaries";

export const MAX_TOKEN = 150;

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
  const diaryPrompt = await buildDiaryPrompt(userId);

  const idealHabits = habitRow?.ideal_habits?.join("、") ?? "";
  const shortTermGoals = goalRow?.short_term_goals?.join("、") ?? "";
  const strengths = selfRow?.strengths?.join("、") ?? "";

  return `
以下はユーザーの進捗や日記の抜粋です。
理想の習慣: ${idealHabits}
短期目標: ${shortTermGoals}
強み: ${strengths}
日記: ${diaryPrompt}

ユーザーを元気づけるポジティブで楽しいメッセージを送ってください。
日記内容に触れ、とにかく大袈裟に褒めまくってください。
最大制限文字数: ${MAX_TOKEN - 50}トークン
  `;
}
