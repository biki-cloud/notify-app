import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import webpush from "web-push";
import type { PushSubscription } from "web-push";

const SUBS_FILE = path.resolve(process.cwd(), "subscriptions.json");

webpush.setVapidDetails(
  "mailto:example@example.com",
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST(req: NextRequest) {
  const { message } = await req.json();
  let subs: PushSubscription[] = [];
  try {
    const data = await fs.readFile(SUBS_FILE, "utf-8");
    subs = JSON.parse(data);
  } catch {}
  const payload = JSON.stringify({
    title: "PWAプッシュ通知",
    body: message || "APIからの通知",
  });
  const results = await Promise.allSettled(
    subs.map((sub) => webpush.sendNotification(sub, payload))
  );
  return NextResponse.json({
    notify: true,
    message: message || "APIからの通知",
    results,
  });
}
