import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const GOALS_FILE = path.resolve(process.cwd(), "goals.json");

// 保存API
export async function POST(req: NextRequest) {
  const { userId, habit, goal } = await req.json();
  if (!userId)
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  let data: Record<string, { habit: string; goal: string }> = {};
  try {
    const file = await fs.readFile(GOALS_FILE, "utf-8");
    data = JSON.parse(file);
  } catch {}
  data[userId] = { habit, goal };
  await fs.writeFile(GOALS_FILE, JSON.stringify(data, null, 2));
  return NextResponse.json({ ok: true });
}

// 取得API
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  if (!userId)
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  let data: Record<string, { habit: string; goal: string }> = {};
  try {
    const file = await fs.readFile(GOALS_FILE, "utf-8");
    data = JSON.parse(file);
  } catch {}
  return NextResponse.json(data[userId] || {});
}
