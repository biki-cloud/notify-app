import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import type { PushSubscription } from "web-push";

const SUBS_FILE = path.resolve(process.cwd(), "subscriptions.json");

export async function POST(req: NextRequest) {
  const subscription = await req.json();
  let subs: PushSubscription[] = [];
  try {
    const data = await fs.readFile(SUBS_FILE, "utf-8");
    subs = JSON.parse(data);
  } catch {}
  // 重複登録防止
  if (!subs.find((s) => s.endpoint === subscription.endpoint)) {
    subs.push(subscription);
    await fs.writeFile(SUBS_FILE, JSON.stringify(subs, null, 2));
  }
  return NextResponse.json({ ok: true });
}
