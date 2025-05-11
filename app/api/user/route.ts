import { NextRequest, NextResponse } from "next/server";
import { db } from "@/drizzle/db";
import { user as userTable } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }
  // idはserial型なので数値に変換
  const idNum = Number(userId);
  if (isNaN(idNum)) {
    return NextResponse.json({ error: "Invalid userId" }, { status: 400 });
  }
  const users = await db
    .select()
    .from(userTable)
    .where(eq(userTable.id, idNum));
  const user = users[0];
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  return NextResponse.json(user);
}
