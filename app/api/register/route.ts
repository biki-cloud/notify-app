import { NextResponse } from "next/server";
import { db } from "../../../drizzle/db";
import { user_settings } from "../../../drizzle/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  const { userId } = await req.json();
  if (!userId) {
    return NextResponse.json(
      { ok: false, error: "userId必須" },
      { status: 400 }
    );
  }
  // 既存チェック
  const exists = await db
    .select()
    .from(user_settings)
    .where(eq(user_settings.user_id, userId));
  if (exists.length > 0) {
    return NextResponse.json(
      { ok: false, error: "既に登録されています" },
      { status: 409 }
    );
  }
  // 登録
  await db
    .insert(user_settings)
    .values({ user_id: userId, type: "default", custom_message: "" });
  return NextResponse.json({ ok: true });
}
