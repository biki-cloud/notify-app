import { NextResponse } from "next/server";
import { sendPushNotification } from "../../lib/server/serverNotification";
import { db } from "../../../drizzle/db";
import {
  ai_logs,
  notify_settings,
  goals,
  records,
  subscriptions,
} from "../../../drizzle/schema";
import { eq } from "drizzle-orm";

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
      let totalCostStr = "-";
      let promptContent = "";
      if (setting) {
        if (setting.type === "custom" && setting.customMessage) {
          body = setting.customMessage;
        } else if (setting.type === "ai") {
          // AIコーチング文生成
          let userGoal = "";
          let userHabit = "";
          let recentRecords: { date: string; mood: string[]; diary: string }[] =
            [];
          try {
            // goals
            const goalRows = await db
              .select()
              .from(goals)
              .where(eq(goals.user_id, Number(userId)))
              .limit(1);
            const goalRow = goalRows[0];
            if (goalRow) {
              userGoal = goalRow.goal;
              userHabit = goalRow.habit;
            }
            // records
            const recordRows = await db
              .select()
              .from(records)
              .where(eq(records.user_id, Number(userId)));
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
          } catch (e) {
            console.error(`[${idx}] 記録/目標取得エラー`, e);
          }
          if (recentRecords.length > 0) {
            promptContent = recentRecords
              .map(
                (rec, i) =>
                  `【${i + 1}件目】\n時刻: ${rec.date}\n気分: ${
                    Array.isArray(rec.mood) ? rec.mood.join("・") : rec.mood
                  }\n日記: ${rec.diary}`
              )
              .join("\n\n");
            if (userGoal) {
              promptContent += `\n\n【現在の目標】\n${userGoal}`;
            }
            if (userHabit) {
              promptContent += `\n\n【現在の習慣】\n${userHabit}`;
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
                      { role: "user", content: promptContent },
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
              } catch (e) {
                console.error(`[${idx}] コスト計算エラー`, e);
              }
              // --- ここまで ---
            } catch (e) {
              console.error(
                `[${idx}] OpenAI APIリクエスト/レスポンスエラー`,
                e
              );
              body = "コーチングメッセージの生成に失敗しました";
            }
            // AIログ保存
            try {
              await db.insert(ai_logs).values({
                user_id: Number(userId),
                timestamp: getJSTISOString(),
                prompt: promptContent,
                response: body,
                total_cost_jp_en: totalCostStr,
              });
            } catch (e) {
              console.error(`[${idx}] AIログDB保存エラー`, e);
            }
          } else {
            body = "記録が見つかりませんでした";
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
