import { NextResponse } from "next/server";
import { db } from "../../../../drizzle/db";
import { notify_settings } from "@/drizzle/schema";
import {
  getUserSubsMap,
  sendPushToAll,
} from "@/app/lib/server/notify/notifyUtils";

export async function POST() {
  // 全ユーザーの通知設定を取得
  const allSettings = await db.select().from(notify_settings);
  if (!allSettings || allSettings.length === 0) {
    return NextResponse.json(
      { error: "notify_settings not found" },
      { status: 404 }
    );
  }

  // Push購読情報を取得
  const userSubsMap = await getUserSubsMap();

  // 各ユーザーごとに通知
  const results = await Promise.all(
    allSettings.map(async (setting) => {
      const userId = setting.user_id;
      const customMessages: string[] = setting.custom_message || [];
      if (!Array.isArray(customMessages) || customMessages.length === 0) {
        return { userId, result: "no custom_message" };
      }
      const randomIdx = Math.floor(Math.random() * customMessages.length);
      const message = customMessages[randomIdx];
      const userSubs = userSubsMap[String(userId)] || [];
      if (userSubs.length === 0) {
        return { userId, result: "no push subscription" };
      }
      const payload = JSON.stringify({
        title: "🤩カスタムメッセージ通知🤩",
        body: message,
      });
      await sendPushToAll(userSubs, payload);
      return { userId, result: "notified", message };
    })
  );

  return NextResponse.json({ ok: true, results });
}
