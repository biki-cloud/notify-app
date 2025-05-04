import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OpenAI APIキーが設定されていません" },
      { status: 500 }
    );
  }
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "あなたは哲学者です。" },
        {
          role: "user",
          content: "哲学的な名言を1つ日本語で短く教えてください。",
        },
      ],
      max_tokens: 60,
    }),
  });
  const data = await response.json();
  const quote =
    data.choices?.[0]?.message?.content?.trim() || "名言の取得に失敗しました";
  return NextResponse.json({ quote });
}
