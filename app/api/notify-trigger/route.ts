import { NextResponse } from "next/server";
import webpush from "web-push";
import { db } from "../../../drizzle/db";
import {
  ai_logs,
  user_settings,
  goals,
  records,
  subscriptions,
} from "../../../drizzle/schema";
import { eq } from "drizzle-orm";

webpush.setVapidDetails(
  "mailto:example@example.com",
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

function getJSTISOString() {
  const now = new Date();
  const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return jst.toISOString().replace(".000Z", "+09:00");
}

export async function POST() {
  // Push購読情報をDBから取得
  const subs = await db.select().from(subscriptions);

  // ユーザー設定をDBから取得
  let userSettings: Record<string, { type: string; customMessage: string }> =
    {};
  try {
    const settingsRows = await db.select().from(user_settings);
    userSettings = Object.fromEntries(
      settingsRows.map((row) => [
        row.user_id,
        { type: row.type, customMessage: row.custom_message },
      ])
    );
  } catch {}

  const results = await Promise.allSettled(
    subs.map(async (sub) => {
      let body = "APIからの通知";
      const userId = sub.user_id;
      const setting = userId ? userSettings[userId] : undefined;
      if (setting) {
        if (setting.type === "custom" && setting.customMessage) {
          body = setting.customMessage;
        } else if (setting.type === "ai") {
          let content = "";
          // ユーザーの最新3件の記録を取得
          let recentRecords: { date: string; mood: string[]; diary: string }[] =
            [];
          let userGoal = "";
          let userHabit = "";
          let totalCostStr = "-";
          try {
            const goalRows = await db
              .select()
              .from(goals)
              .where(eq(goals.user_id, userId))
              .limit(1);
            const goalRow = goalRows[0];
            if (goalRow) {
              userGoal = goalRow.goal;
              userHabit = goalRow.habit;
            }
          } catch {}
          try {
            const recordRows = await db
              .select()
              .from(records)
              .where(eq(records.user_id, userId));
            // 日付で降順ソートし、直近3件を取得
            const sorted = recordRows
              .sort((a, b) => b.date.localeCompare(a.date))
              .slice(0, 3)
              .map((rec) => ({
                date: rec.date,
                mood: Array.isArray(rec.mood)
                  ? rec.mood
                  : rec.mood
                  ? [rec.mood]
                  : [],
                diary: rec.diary,
              }));
            recentRecords = sorted;
          } catch {}
          if (recentRecords.length > 0) {
            // OpenAI APIに3日分の記録内容＋目標を投げてコーチングメッセージを生成
            content = recentRecords
              .map(
                (rec, i) =>
                  `【${i + 1}件目】\n時刻: ${rec.date}\n気分: ${
                    Array.isArray(rec.mood) ? rec.mood.join("・") : rec.mood
                  }\n日記: ${rec.diary}`
              )
              .join("\n\n");
            if (userGoal) {
              content += `\n\n【現在の目標】\n${userGoal}`;
            }
            if (userHabit) {
              content += `\n\n【現在の習慣】\n${userHabit}`;
            }
            try {
              const openaiRes = await fetch(
                "https://api.openai.com/v1/chat/completions",
                {
                  method: "POST",
                  headers: {
                    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    model: "gpt-4-turbo",
                    messages: [
                      {
                        role: "system",
                        content:
                          "あなたは『アイシールド21』の蛭間陽一のような口調で、ユーザーを悪魔的コーチングで励ます役です。\n\n以下はユーザーの直近3件の気分と日記、そして現在の目標と習慣です。日記の内容を中心に励ましつつ、目標や習慣の達成に向けたアドバイスや進捗確認も一言添えてください。特に習慣については、継続できているか、改善点や続けるコツなどもレビュー・アドバイスしてください。蛭間陽一は「クソ(名詞)」と「〜しやがれ」と「テメー」と「〜っきゃねえ」と「〜ぜ」という口調が特徴です。制限文字は300文字です。\n\n",
                      },
                      { role: "user", content },
                    ],
                    max_tokens: 300,
                    temperature: 0.9,
                  }),
                }
              );
              const openaiData = await openaiRes.json();
              body =
                openaiData.choices?.[0]?.message?.content?.trim() ||
                "コーチングメッセージの生成に失敗しました";

              // --- 料金計算処理追加 ---
              try {
                const usage = openaiData.usage;
                if (usage) {
                  // gpt-4-turbo: input $0.01/1K, output $0.03/1K
                  const inputTokens = usage.prompt_tokens || 0;
                  const outputTokens = usage.completion_tokens || 0;
                  const inputCost = (inputTokens / 1000) * 0.01;
                  const outputCost = (outputTokens / 1000) * 0.03;
                  const totalCostUSD = inputCost + outputCost;
                  const totalCostJPY =
                    Math.round(totalCostUSD * 150 * 100) / 100; // 小数第2位まで
                  totalCostStr = `${totalCostJPY}円 ($${totalCostUSD.toFixed(
                    4
                  )})`;
                }
              } catch {}
              // --- ここまで ---
            } catch {
              body = "コーチングメッセージの生成に失敗しました";
            }
            // AIログ保存
            if (userId) {
              try {
                await db.insert(ai_logs).values({
                  user_id: userId,
                  timestamp: getJSTISOString(),
                  prompt: content,
                  response: body,
                  total_cost_jp_en: totalCostStr,
                });
              } catch (e) {
                console.error("AIログDB保存エラー", e);
              }
            }
          } else {
            body = "記録が見つかりませんでした";
          }
        }
      }
      const payload = JSON.stringify({
        title: "PWAプッシュ通知",
        body,
      });
      const result = await webpush.sendNotification(sub, payload);
      return result;
    })
  );
  return NextResponse.json({
    notify: true,
    results,
  });
}
