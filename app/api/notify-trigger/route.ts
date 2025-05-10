import { NextResponse } from "next/server";
import { sendPushNotification } from "../../lib/server/serverNotification";
import { db } from "../../../drizzle/db";
import {
  ai_logs,
  notify_settings,
  subscriptions,
} from "../../../drizzle/schema";
import { fetchOpenAIChatWithDefaults } from "../../lib/server/openai";
import { buildAllDataPromptContent } from "../../lib/server/prompt/getAllData";
import { OPENAI_DEFAULT_PARAMS } from "../../lib/server/promptBase";
import { calcOpenAICost } from "../../lib/server/openaiCost";

function getJSTISOString() {
  const now = new Date();
  const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return jst.toISOString().replace(".000Z", "+09:00");
}

export async function POST() {
  console.log("notify-trigger POST エンドポイントが呼ばれました");
  // Push購読情報をDBから取得
  let subs;
  try {
    subs = await db.select().from(subscriptions);
    console.log("購読情報取得成功:", subs.length, "件");
  } catch (e) {
    console.error("購読情報取得エラー", e);
    return NextResponse.json({ notify: false, error: "購読情報取得エラー" });
  }

  // user_idごとに購読をグループ化
  const userSubsMap: Record<string, typeof subs> = {};
  for (const sub of subs) {
    if (!sub.user_id) continue; // user_idがnullの端末はスキップ
    const key = String(sub.user_id);
    if (!userSubsMap[key]) userSubsMap[key] = [];
    userSubsMap[key].push(sub);
  }

  // ユーザー設定をDBから取得
  let userSettings: Record<string, { type: string; customMessage: string }> =
    {};
  try {
    const settingsRows = await db.select().from(notify_settings);
    userSettings = Object.fromEntries(
      settingsRows.map((row) => [
        row.user_id,
        { type: row.type, customMessage: row.custom_message },
      ])
    );
    console.log(
      "ユーザー設定取得成功:",
      Object.keys(userSettings).length,
      "件"
    );
  } catch (e) {
    console.error("ユーザー設定取得エラー", e);
  }

  // user_idごとにコーチング文生成＆全端末に送信
  const results = await Promise.allSettled(
    Object.entries(userSubsMap).map(async ([userId, userSubs], idx) => {
      const setting = userSettings[userId];
      let body = "APIからの通知";
      if (setting) {
        if (setting.type === "custom" && setting.customMessage) {
          body = setting.customMessage;
        } else if (setting.type === "ai") {
          // AIコーチング文生成
          let body = "APIからの通知";
          try {
            const promptContent = await buildAllDataPromptContent(
              Number(userId)
            );
            try {
              const openaiData = await fetchOpenAIChatWithDefaults(
                promptContent
              );
              body =
                openaiData.choices?.[0]?.message?.content?.trim() ||
                "コーチングメッセージの生成に失敗しました";
              // --- 料金計算処理追加 ---
              if (openaiData.usage) {
                const { costString } = calcOpenAICost({
                  model: OPENAI_DEFAULT_PARAMS.model,
                  prompt_tokens: openaiData.usage.prompt_tokens,
                  completion_tokens: openaiData.usage.completion_tokens,
                });
                // totalCostStrはAIログ保存用に使う
                try {
                  await db.insert(ai_logs).values({
                    user_id: Number(userId),
                    timestamp: getJSTISOString(),
                    prompt: promptContent,
                    response: body,
                    total_cost_jp_en: costString,
                  });
                } catch (e) {
                  console.error(`[${idx}] AIログDB保存エラー`, e);
                }
              }
              // --- ここまで ---
            } catch (e) {
              console.error(
                `[${idx}] OpenAI APIリクエスト/レスポンスエラー`,
                e
              );
              body = "コーチングメッセージの生成に失敗しました";
            }
          } catch (e) {
            console.error(`[${idx}] ユーザーデータ取得エラー`, e);
          }
        }
      }
      // 生成したbodyを全端末に送信
      const payload = JSON.stringify({
        title: "PWAプッシュ通知",
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
          } catch (e) {
            return { error: "push通知送信エラー", detail: e };
          }
        })
      );
      return { userId, sendResults, body };
    })
  );
  console.log("全push通知処理完了", results);
  return NextResponse.json({
    notify: true,
    results,
  });
}
