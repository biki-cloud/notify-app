import { NextResponse } from "next/server";
import { db } from "../../../drizzle/db";
import { user } from "../../../drizzle/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  const { username } = await req.json();
  if (!username) {
    return NextResponse.json(
      { ok: false, error: "username必須" },
      { status: 400 }
    );
  }
  const exists = await db
    .select()
    .from(user)
    .where(eq(user.username, username));
  if (exists.length > 0) {
    return NextResponse.json({ ok: true, userId: exists[0].id });
  } else {
    return NextResponse.json(
      { ok: false, error: "ユーザーが存在しません" },
      { status: 404 }
    );
  }
}
