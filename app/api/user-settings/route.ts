import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../drizzle/db";
import { notify_settings } from "../../../drizzle/schema";
import { eq } from "drizzle-orm";

// 設定保存API
export async function POST(req: NextRequest) {
  const { userId, type, customMessage } = await req.json();
  if (!userId)
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  // 既存レコードがあればUPDATE、なければINSERT
  const existing = await db
    .select()
    .from(notify_settings)
    .where(eq(notify_settings.user_id, userId))
    .limit(1);
  if (existing.length > 0) {
    await db
      .update(notify_settings)
      .set({ type, custom_message: customMessage })
      .where(eq(notify_settings.user_id, userId));
  } else {
    await db
      .insert(notify_settings)
      .values({ user_id: userId, type, custom_message: customMessage });
  }
  return NextResponse.json({ ok: true });
}

// 設定取得API
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  if (!userId)
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  const userIdNum = typeof userId === "string" ? Number(userId) : userId;
  const result = await db
    .select()
    .from(notify_settings)
    .where(eq(notify_settings.user_id, userIdNum))
    .limit(1);
  if (result.length > 0) {
    const { type, custom_message } = result[0];
    return NextResponse.json({ type, customMessage: custom_message });
  } else {
    return NextResponse.json({});
  }
}
