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
  const exists = await db
    .select()
    .from(user_settings)
    .where(eq(user_settings.user_id, userId));
  if (exists.length > 0) {
    return NextResponse.json({ ok: true });
  } else {
    return NextResponse.json(
      { ok: false, error: "ユーザーが存在しません" },
      { status: 404 }
    );
  }
}
