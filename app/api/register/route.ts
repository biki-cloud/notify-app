import { NextResponse } from "next/server";
import { db } from "../../../drizzle/db";
import { user, notify_settings } from "../../../drizzle/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  const { username } = await req.json();
  if (!username) {
    return NextResponse.json(
      { ok: false, error: "username必須" },
      { status: 400 }
    );
  }
  // 既存チェック
  const exists = await db
    .select()
    .from(user)
    .where(eq(user.username, username));
  if (exists.length > 0) {
    return NextResponse.json(
      { ok: false, error: "既に登録されています" },
      { status: 409 }
    );
  }
  // 登録
  const inserted = await db.insert(user).values({ username }).returning();
  const userId = inserted[0]?.id;
  // 通知設定も初期化
  if (userId) {
    await db
      .insert(notify_settings)
      .values({ user_id: userId, type: "default", custom_message: [] });
  }
  return NextResponse.json({ ok: true, userId });
}
