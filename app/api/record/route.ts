import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const RECORD_FILE = path.resolve(process.cwd(), "record.json");

// 記録保存API
export async function POST(req: NextRequest) {
  const { userId, mood, diary, date } = await req.json();
  if (!userId || !date)
    return NextResponse.json(
      { error: "userIdとdateは必須です" },
      { status: 400 }
    );
  let records: Record<
    string,
    Record<string, { mood: string; diary: string }>
  > = {};
  try {
    const data = await fs.readFile(RECORD_FILE, "utf-8");
    records = JSON.parse(data);
  } catch {}
  if (!records[userId]) records[userId] = {};
  records[userId][date] = { mood, diary };
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
    return NextResponse.json(records[userId]?.[date] || {});
  } else {
    return NextResponse.json(records[userId] || {});
  }
}
