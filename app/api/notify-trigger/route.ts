import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import webpush from "web-push";
// import type { PushSubscription } from "web-push";
type PushSubscription = {
  endpoint: string;
  expirationTime: number | null;
  keys: {
    p256dh: string;
    auth: string;
  };
  userId?: string;
};

const SUBS_FILE = path.resolve(process.cwd(), "subscriptions.json");
const USER_SETTINGS_FILE = path.resolve(process.cwd(), "user-settings.json");
const RECORD_FILE = path.resolve(process.cwd(), "record.json");
const AI_LOG_FILE = path.resolve(process.cwd(), "ai_log.json");

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
  let subs: PushSubscription[] = [];
  try {
    const data = await fs.readFile(SUBS_FILE, "utf-8");
    subs = JSON.parse(data);
  } catch {}

  let userSettings: Record<string, { type: string; customMessage: string }> =
    {};
  try {
    const data = await fs.readFile(USER_SETTINGS_FILE, "utf-8");
    userSettings = JSON.parse(data);
  } catch {}

  const results = await Promise.allSettled(
    subs.map(async (sub) => {
      let body = "APIからの通知";
      const userId = sub.userId;
      const setting = userId ? userSettings[userId] : undefined;
      if (setting) {
        if (setting.type === "custom" && setting.customMessage) {
          body = setting.customMessage;
        } else if (setting.type === "ai") {
          let content = "";
          // ユーザーの最新3件の記録を取得
          let recentRecords: { date: string; mood: string[]; diary: string }[] =
            [];
          try {
            const recordData = await fs.readFile(RECORD_FILE, "utf-8");
            const records = JSON.parse(recordData);
            let userRecords: Record<string, { mood: string; diary: string }> =
              {};
            if (userId && records[userId]) {
              userRecords = records[userId];
            }
            // 日付で降順ソートし、直近3件を取得
            const sorted = Object.entries(userRecords)
              .sort(([a], [b]) => b.localeCompare(a))
              .slice(0, 3)
              .map(([date, rec]) => ({
                date,
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
            // OpenAI APIに3日分の記録内容を投げてコーチングメッセージを生成
            content = recentRecords
              .map(
                (rec, i) =>
                  `【${i + 1}件目】\n時刻: ${rec.date}\n気分: ${
                    Array.isArray(rec.mood) ? rec.mood.join("・") : rec.mood
                  }\n日記: ${rec.diary}`
              )
              .join("\n\n");
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
                        // content:
                        //   "あなたは優秀なコーチング指導者です。私は今気分が落ち込んでいます。アイシールド21の蛭間陽一の口調でコーチングしてください。制限文字は200文字です。",
                        content:
                          "あなたは『アイシールド21』の蛭間陽一のような口調で、ユーザーを悪魔的コーチングで励ます役です\n\n以下はユーザーの直近3件の気分と日記です。全体を通して、蛭間陽一が考えそうな内容を返してコーチングをしてください。蛭間陽一は「クソ〜」と「〜しやがれ」という口調が特徴です。制限文字は150文字です。\n\n",
                      },
                      { role: "user", content },
                    ],
                    max_tokens: 200,
                    temperature: 0.9,
                  }),
                }
              );
              const openaiData = await openaiRes.json();
              body =
                openaiData.choices?.[0]?.message?.content?.trim() ||
                "コーチングメッセージの生成に失敗しました";
            } catch {
              body = "コーチングメッセージの生成に失敗しました";
            }
            // AIログ保存
            if (userId) {
              try {
                const aiLogData = await fs.readFile(AI_LOG_FILE, "utf-8");
                const aiLog: Record<string, unknown[]> = JSON.parse(aiLogData);
                if (!aiLog[userId]) aiLog[userId] = [];
                aiLog[userId].push({
                  timestamp: getJSTISOString(),
                  prompt: content,
                  response: body,
                });
                await fs.writeFile(AI_LOG_FILE, JSON.stringify(aiLog, null, 2));
              } catch {
                // ファイルがない場合など
                const aiLog: Record<string, unknown[]> = {};
                aiLog[userId] = [
                  {
                    timestamp: getJSTISOString(),
                    prompt: content,
                    response: body,
                  },
                ];
                await fs.writeFile(AI_LOG_FILE, JSON.stringify(aiLog, null, 2));
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
