import { NextResponse } from "next/server";
import { sendPushNotification } from "@/app/lib/server/serverNotification";
import { db } from "@/drizzle/db";
import { ai_logs, notify_settings, subscriptions } from "@/drizzle/schema";
import { fetchOpenAIChatWithDefaults } from "@/app/lib/server/openai";
import { getHabitPrompt } from "@/app/lib/server/prompt/habit/habitPrompt";
import { OPENAI_DEFAULT_PARAMS } from "@/app/lib/server/promptBase";
import { calcOpenAICost } from "@/app/lib/server/openaiCost";

function getJSTISOString() {
  const now = new Date();
  const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return jst.toISOString().replace(".000Z", "+09:00");
}

export async function POST() {
  // Push購読情報をDBから取得
  let subs;
  try {
    subs = await db.select().from(subscriptions);
  } catch {
    return NextResponse.json({ notify: false, error: "購読情報取得エラー" });
  }

  // user_idごとに購読をグループ化
  const userSubsMap: Record<string, typeof subs> = {};
  for (const sub of subs) {
    if (!sub.user_id) continue;
    const key = String(sub.user_id);
    if (!userSubsMap[key]) userSubsMap[key] = [];
    userSubsMap[key].push(sub);
  }

  // ユーザー設定をDBから取得（現状未使用なので削除）
  // let userSettings: Record<string, { type: string; customMessage: string }> = {};
  try {
    await db.select().from(notify_settings);
  } catch {}

  // user_idごとにコーチング文生成＆全端末に送信
  const results = await Promise.allSettled(
    Object.entries(userSubsMap).map(async ([userId, userSubs]) => {
      let body = "APIからの通知";
      try {
        // プロンプト生成
        const promptContent = await getHabitPrompt(Number(userId));
        // AIメッセージ生成
        const openaiData = await fetchOpenAIChatWithDefaults(promptContent);
        body =
          openaiData.choices?.[0]?.message?.content?.trim() ||
          "コーチングメッセージの生成に失敗しました";
        // 料金計算＆AIログ保存
        if (openaiData.usage) {
          const { costString } = calcOpenAICost({
            model: OPENAI_DEFAULT_PARAMS.model,
            prompt_tokens: openaiData.usage.prompt_tokens,
            completion_tokens: openaiData.usage.completion_tokens,
          });
          try {
            await db.insert(ai_logs).values({
              user_id: Number(userId),
              timestamp: getJSTISOString(),
              prompt: promptContent,
              response: body,
              total_cost_jp_en: costString,
            });
          } catch {}
        }
      } catch {
        body = "コーチングメッセージの生成に失敗しました";
      }
      // 生成したbodyを全端末に送信
      const payload = JSON.stringify({
        title: "🙌習慣コーチからのコメント🙌",
        body,
      });
      const sendResults = await Promise.allSettled(
        userSubs.map(async (sub) => {
          const keys = sub.keys as { p256dh: string; auth: string };
          const pushSub = {
            endpoint: sub.endpoint,
            keys,
          };
          try {
            const result = await sendPushNotification(pushSub, payload);
            return result;
          } catch {
            return { error: "push通知送信エラー" };
          }
        })
      );
      return { userId, sendResults, body };
    })
  );
  return NextResponse.json({
    notify: true,
    results,
  });
}
