import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../drizzle/db";
import { records } from "../../../drizzle/schema";
import { eq, and, desc, sql } from "drizzle-orm";

function getJSTISOString() {
  const now = new Date();
  // JSTに変換
  const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return jst.toISOString().replace(".000Z", "+09:00");
}

// 記録保存API
export async function POST(req: NextRequest) {
  const { userId, mood, diary, date } = await req.json();
  if (!userId)
    return NextResponse.json({ error: "userIdは必須です" }, { status: 400 });
  // 日時をJSTのISO8601形式で生成（dateがなければ現在時刻）
  const now = date || getJSTISOString();
  // moodがstringなら配列化
  const moodArr = Array.isArray(mood) ? mood : mood ? [mood] : [];
  // 既存の同一userId/dateのレコードを削除（上書き保存のため）
  await db
    .delete(records)
    .where(and(eq(records.user_id, userId), eq(records.date, now)));
  // 新規挿入
  await db.insert(records).values({
    user_id: userId,
    date: now,
    mood: moodArr,
    diary: diary || "",
  });
  return NextResponse.json({ ok: true });
}

// 記録取得API
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const date = searchParams.get("date");
  if (!userId)
    return NextResponse.json({ error: "userIdは必須です" }, { status: 400 });

  if (date) {
    // 日付（YYYY-MM-DD）で始まる最新の記録を返す
    const result = await db
      .select()
      .from(records)
      .where(
        and(
          eq(records.user_id, userId),
          sql`${records.date} LIKE ${date + "%"}`
        )
      )
      .orderBy(desc(records.date))
      .limit(1);
    if (result.length > 0) {
      const { mood, diary } = result[0];
      return NextResponse.json({ mood, diary });
    } else {
      return NextResponse.json({});
    }
  } else {
    // 全件取得
    const result = await db
      .select()
      .from(records)
      .where(eq(records.user_id, userId))
      .orderBy(desc(records.date));
    // {date: {mood, diary}, ...} の形式に変換
    const converted = Object.fromEntries(
      result.map((r) => [r.date, { mood: r.mood, diary: r.diary }])
    );
    return NextResponse.json(converted);
  }
}
