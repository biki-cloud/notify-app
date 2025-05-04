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
          try {
            const res = await fetch(
              `${
                process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
              }/api/quote`
            );
            const data = await res.json();
            body = data.quote || "名言の取得に失敗しました";
          } catch {
            body = "名言の取得に失敗しました";
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
