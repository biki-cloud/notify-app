import { NextResponse } from "next/server";

export async function POST() {
  // 必要に応じてサーバー側のセッション削除等を実装
  return NextResponse.json({ ok: true });
}
