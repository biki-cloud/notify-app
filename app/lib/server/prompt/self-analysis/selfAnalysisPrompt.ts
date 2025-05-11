import { db } from "@/drizzle/db";
import { self_analysis } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { buildDiaryPrompt } from "@/app/lib/server/diary/getUserDiaries";

export const MAX_TOKEN = 300;

export async function buildSelfAnalysisPrompt(
  userId: number,
  diaryCount: number = 3
) {
  // 自己分析データ取得
  const selfRow = (
    await db
      .select()
      .from(self_analysis)
      .where(eq(self_analysis.user_id, userId))
  )[0];

  // 日記プロンプト
  const dailyPrompt = await buildDiaryPrompt(userId, diaryCount);

  const strengths = selfRow?.strengths?.join("、") ?? "";
  const weaknesses = selfRow?.weaknesses?.join("、") ?? "";

  return `
以下はユーザーの強みと課題です。
強み: ${strengths}
課題: ${weaknesses}

以下は最近の日記の内容です：
${dailyPrompt}

ユーザーが強みを活かし、課題に前向きに取り組むためのメッセージを送ってください。日記内容から得られる気づきや成長を感じさせるメッセージを加えてください。
最大制限文字数: ${MAX_TOKEN - 50}トークン
  `;
}
