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
const GOALS_FILE = path.resolve(process.cwd(), "goals.json");

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
          let userGoal = "";
          let userHabit = "";
          try {
            // 目標データの取得
            const goalsData = await fs.readFile(GOALS_FILE, "utf-8");
            const goals = JSON.parse(goalsData);
            if (userId && goals[userId] && goals[userId].goal) {
              userGoal = goals[userId].goal;
            }
            if (userId && goals[userId] && goals[userId].habit) {
              userHabit = goals[userId].habit;
            }
          } catch {}
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
