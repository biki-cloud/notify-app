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

webpush.setVapidDetails(
  "mailto:example@example.com",
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

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
          // ユーザーの最新記録を取得
          let latestRecord = null;
          try {
            const recordData = await fs.readFile(RECORD_FILE, "utf-8");
            const records = JSON.parse(recordData);
            let userRecords: Record<string, { mood: string; diary: string }> =
              {};
            if (userId && records[userId]) {
              userRecords = records[userId];
            }
            // 最新日付を取得
            const dates = Object.keys(userRecords).sort().reverse();
            if (dates.length > 0) {
              latestRecord = userRecords[dates[0]];
            }
          } catch {}
          if (latestRecord) {
            // OpenAI APIに記録内容を投げてコーチングメッセージを生成
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
                    model: "gpt-3.5-turbo",
                    messages: [
                      {
                        role: "system",
                        content:
                          "あなたは優しいコーチです。ユーザーの気分や日記を受けて、前向きなコーチングメッセージを日本語で短く返してください。",
                      },
                      {
                        role: "user",
                        content: `気分: ${latestRecord.mood}\n日記: ${latestRecord.diary}`,
                      },
                    ],
                    max_tokens: 60,
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
          } else {
            body = "記録が見つかりませんでした";
          }
        }
      }
      const payload = JSON.stringify({
        title: "PWAプッシュ通知",
        body,
      });
      return webpush.sendNotification(sub, payload);
    })
  );
  return NextResponse.json({
    notify: true,
    results,
  });
}
