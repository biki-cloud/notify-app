import { NextResponse } from "next/server";
import {
  getUserSubsMap,
  generateAndLogAIMessage,
  sendPushToAll,
} from "@/app/lib/server/notify/notifyUtils";
import { buildDiaryFeedbackPrompt } from "@/app/lib/server/prompt/diary/diaryPrompt";

export async function POST() {
  // Push購読情報を取得し、user_idごとにグループ化
  let userSubsMap;
  try {
    userSubsMap = await getUserSubsMap();
  } catch {
    return NextResponse.json({ notify: false, error: "購読情報取得エラー" });
  }

  // user_idごとにコーチング文生成＆全端末に送信
  const results = await Promise.allSettled(
    Object.entries(userSubsMap).map(async ([userId, userSubs]) => {
      // プロンプト生成
      const promptContent = await buildDiaryFeedbackPrompt(Number(userId));
      // AIメッセージ生成＆ログ保存
      const { payload, body } = await generateAndLogAIMessage({
        userId: Number(userId),
        promptContent,
        title: "📓日記フィードバック通知📓",
      });
      // Push通知送信
      const sendResults = await sendPushToAll(userSubs, payload);
      return { userId, sendResults, body };
    })
  );
  return NextResponse.json({
    notify: true,
    results,
  });
}
