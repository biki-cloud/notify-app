import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../drizzle/db";
import { subscriptions } from "../../../drizzle/schema";
import { eq } from "drizzle-orm";
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

export async function POST(req: NextRequest) {
  const subscription: PushSubscription = await req.json();
  // 重複登録防止
  const existing = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.endpoint, subscription.endpoint))
    .limit(1);
  if (existing.length === 0) {
    await db.insert(subscriptions).values({
      endpoint: subscription.endpoint,
      user_id: subscription.userId || null,
      keys: subscription.keys,
    });
  }
  return NextResponse.json({ ok: true });
}
