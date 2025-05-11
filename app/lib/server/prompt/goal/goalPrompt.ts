import { db } from "@/drizzle/db";
import { goals } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { buildDiaryPrompt } from "@/app/lib/server/diary/getUserDiaries";

export async function buildGoalPrompt(userId: number, diaryCount: number = 3) {
  // 目標データ取得
  const goalRow = (
    await db.select().from(goals).where(eq(goals.user_id, userId))
  )[0];

  // 日記プロンプト
  const dailyPrompt = await buildDiaryPrompt(userId, diaryCount);

  const shortTerm = goalRow?.short_term_goals?.join("、") ?? "";
  const midTerm = goalRow?.mid_term_goals?.join("、") ?? "";
  const longTerm = goalRow?.long_term_goals?.join("、") ?? "";
  const lifeGoals = goalRow?.life_goals?.join("、") ?? "";
  const coreValues = goalRow?.core_values?.join("、") ?? "";

  return `
以下はユーザーが設定した目標と価値観の情報です。
短期目標: ${shortTerm}
中期目標: ${midTerm}
長期目標: ${longTerm}
人生の目標: ${lifeGoals}
大切にしている価値観: ${coreValues}

以下は最近の日記の内容です：
${dailyPrompt}

今週の目標振り返りとモチベーションを高めるメッセージを送ってください。日記内容を反映して、目標達成の進捗を共に振り返りましょう。
  `;
}
