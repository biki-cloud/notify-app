import { buildDiaryPrompt } from "@/app/lib/server/diary/getUserDiaries";

export const MAX_TOKEN = 150;

export async function buildDiaryFeedbackPrompt(
  userId: number,
  diaryCount: number = 3
) {
  const dailyPrompt = await buildDiaryPrompt(userId, diaryCount);

  return `
以下はユーザーの日記の内容とその日の気分です：
${dailyPrompt}

ユーザーの気持ちに寄り添い、励ましと気づきを促すメッセージを届けてください。日記内容に共感し、次の日に活かせるアドバイスを加えてください。
最大制限文字数: ${MAX_TOKEN - 50}トークン
  `;
}
