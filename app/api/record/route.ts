import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const RECORD_FILE = path.resolve(process.cwd(), "record.json");

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
  let records: Record<
    string,
    Record<string, { mood: string; diary: string }>
  > = {};
  try {
    const data = await fs.readFile(RECORD_FILE, "utf-8");
    records = JSON.parse(data);
  } catch {}
  if (!records[userId]) records[userId] = {};
  records[userId][now] = { mood, diary };
  await fs.writeFile(RECORD_FILE, JSON.stringify(records, null, 2));
  return NextResponse.json({ ok: true });
}

// 記録取得API
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const date = searchParams.get("date");
  if (!userId)
    return NextResponse.json({ error: "userIdは必須です" }, { status: 400 });
  let records: Record<
    string,
    Record<string, { mood: string; diary: string }>
  > = {};
  try {
    const data = await fs.readFile(RECORD_FILE, "utf-8");
    records = JSON.parse(data);
  } catch {}
  if (date) {
    // 日付（YYYY-MM-DD）で始まる最新の記録を返す
    const userRecords = records[userId] || {};
    const filtered = Object.entries(userRecords)
      .filter(([k]) => k.startsWith(date))
      .sort(([a], [b]) => b.localeCompare(a));
    if (filtered.length > 0) {
      return NextResponse.json(filtered[0][1]);
    } else {
      return NextResponse.json({});
    }
  } else {
    return NextResponse.json(records[userId] || {});
  }
}
