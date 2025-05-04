import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const USER_SETTINGS_FILE = path.resolve(process.cwd(), "user-settings.json");

// 設定保存API
export async function POST(req: NextRequest) {
  const { userId, type, customMessage } = await req.json();
  if (!userId)
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  let settings: Record<string, { type: string; customMessage: string }> = {};
  try {
    const data = await fs.readFile(USER_SETTINGS_FILE, "utf-8");
    settings = JSON.parse(data);
  } catch {}
  settings[userId] = { type, customMessage };
  await fs.writeFile(USER_SETTINGS_FILE, JSON.stringify(settings, null, 2));
  return NextResponse.json({ ok: true });
}

// 設定取得API
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  if (!userId)
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  let settings: Record<string, { type: string; customMessage: string }> = {};
  try {
    const data = await fs.readFile(USER_SETTINGS_FILE, "utf-8");
    settings = JSON.parse(data);
  } catch {}
  return NextResponse.json(settings[userId] || {});
}
