import { db } from "@/drizzle/db";
import { subscriptions, ai_logs } from "@/drizzle/schema";
import { sendPushNotification } from "@/app/lib/server/serverNotification";
import {
  fetchOpenAIChatWithDefaults,
  OPENAI_MODEL,
} from "@/app/lib/server/openai";
import { calcOpenAICost } from "@/app/lib/server/openaiCost";

// Push購読情報を取得し、user_idごとにグループ化
export async function getUserSubsMap() {
  const subs = await db.select().from(subscriptions);
  const userSubsMap: Record<string, typeof subs> = {};
  for (const sub of subs) {
    if (!sub.user_id) continue;
    const key = String(sub.user_id);
    if (!userSubsMap[key]) userSubsMap[key] = [];
    userSubsMap[key].push(sub);
  }
  return userSubsMap;
}

// JSTのISO文字列
export function getJSTISOString() {
  const now = new Date();
  const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return jst.toISOString().replace(".000Z", "+09:00");
}

// AIメッセージ生成＆ログ保存
export async function generateAndLogAIMessage({
  userId,
  promptContent,
  title,
  coachingType,
  maxToken,
}: {
  userId: number;
  promptContent: string;
  title: string;
  coachingType: string;
  maxToken: number;
}) {
  let body = "APIからの通知";
  try {
    const openaiData = await fetchOpenAIChatWithDefaults(
      promptContent,
      maxToken
    );
    body =
      openaiData.choices?.[0]?.message?.content?.trim() ||
      "コーチングメッセージの生成に失敗しました";
    if (openaiData.usage) {
      const { costString } = calcOpenAICost({
        model: OPENAI_MODEL,
        prompt_tokens: openaiData.usage.prompt_tokens,
        completion_tokens: openaiData.usage.completion_tokens,
      });
      try {
        await db.insert(ai_logs).values({
          user_id: userId,
          timestamp: getJSTISOString(),
          prompt: promptContent,
          response: body,
          total_cost_jp_en: costString,
          coaching_type: coachingType,
        });
      } catch {}
    }
  } catch {
    body = "コーチングメッセージの生成に失敗しました";
  }
  return {
    payload: JSON.stringify({ title, body }),
    body,
  };
}

// Push通知送信
export async function sendPushToAll(
  userSubs: (typeof subscriptions.$inferSelect)[],
  payload: string
) {
  return await Promise.allSettled(
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
}
