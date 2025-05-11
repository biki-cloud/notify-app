import { db } from "@/drizzle/db";
import { habits, records } from "@/drizzle/schema";
import { desc, eq } from "drizzle-orm";

export function buildHabitPromptContent({
  idealHabits,
  badHabits,
  newHabits,
  trackingHabits,
  diary,
}: {
  idealHabits: string;
  badHabits: string;
  newHabits: string;
  trackingHabits: string;
  diary: string;
}) {
  return `
以下はユーザーが設定した習慣の情報です。
理想の習慣: ${idealHabits}
悪い習慣: ${badHabits}
新しい習慣: ${newHabits}
記録中の習慣: ${trackingHabits}

以下は最近の日記の内容です：
${diary}

ユーザーに寄り添い、習慣の改善・継続を励ます優しいメッセージを届けてください。日記内容に基づいて共感や気づきを促すコメントを加えてください。
50文字以内で返答してください。
  `;
}

// ユーザーIDを受け取り、プロンプトを生成して返す（直近の日記件数をオプション指定可、デフォルト3件）
export async function getHabitPrompt(userId: number, diaryCount: number = 3) {
  // DBから習慣データ取得
  const habitRow = (
    await db.select().from(habits).where(eq(habits.user_id, userId))
  )[0];

  // DBから最新の日記データを複数件取得
  const diaryRows = await db
    .select()
    .from(records)
    .where(eq(records.user_id, userId))
    .orderBy(desc(records.date))
    .limit(diaryCount);

  // 日記内容を結合（改行区切り）
  const diary = diaryRows.map((row) => row.diary).join("\n");

  const idealHabits = habitRow?.ideal_habits?.join("、") ?? "";
  const badHabits = habitRow?.bad_habits?.join("、") ?? "";
  const newHabits = habitRow?.new_habits?.join("、") ?? "";
  const trackingHabits = habitRow?.tracking_habits?.join("、") ?? "";

  return buildHabitPromptContent({
    idealHabits,
    badHabits,
    newHabits,
    trackingHabits,
    diary,
  });
}
