import { db } from "@/drizzle/db";
import { buildDiaryPrompt } from "../../diary/getUserDiaries";
import { habits } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export const MAX_TOKEN = 100;

// ユーザーIDを受け取り、プロンプトを生成して返す（直近の日記件数をオプション指定可、デフォルト3件）
export async function buildHabitPrompt(userId: number, diaryCount: number = 3) {
  // DBから習慣データ取得
  const habitRow = (
    await db.select().from(habits).where(eq(habits.user_id, userId))
  )[0];

  const idealHabits = habitRow?.ideal_habits?.join("、") ?? "";
  const badHabits = habitRow?.bad_habits?.join("、") ?? "";
  const newHabits = habitRow?.new_habits?.join("、") ?? "";
  const trackingHabits = habitRow?.tracking_habits?.join("、") ?? "";

  const dailyPrompt = await buildDiaryPrompt(userId, diaryCount);

  return `
以下はユーザーが設定した習慣の情報です。
理想の習慣: ${idealHabits}
悪い習慣: ${badHabits}
新しい習慣: ${newHabits}
記録中の習慣: ${trackingHabits}

以下は最近の日記の内容です：
${dailyPrompt}

ユーザーに寄り添い、習慣の改善・継続を励ます優しいメッセージを届けてください。日記内容に基づいて共感や気づきを促すコメントを加えてください。
最大制限文字数: ${MAX_TOKEN - 50}トークン
  `;
}
