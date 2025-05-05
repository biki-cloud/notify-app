import { promises as fs } from "fs";
import path from "path";
import { moodEmoji } from "../../emojiList";
import DiaryClient from "../DiaryClient";

// ユーザーIDは現状1つのみと仮定
const USER_ID = "3ccee381-9aab-4a26-9ca6-251c395cd68e";

export default async function DiaryReviewPage() {
  // record.jsonを読み込む
  const recordPath = path.resolve(process.cwd(), "record.json");
  const recordRaw = await fs.readFile(recordPath, "utf-8");
  const record: Record<
    string,
    Record<string, { mood: string[]; diary: string }>
  > = JSON.parse(recordRaw);
  const userRecords = record[USER_ID] || {};

  // 日記エントリを展開
  const diaryItems = Object.entries(userRecords).map(([time, value]) => ({
    time,
    mood: Array.isArray(value.mood)
      ? value.mood
      : value.mood
      ? [value.mood]
      : [],
    text: value.diary,
  }));

  // 新しい順にソート
  diaryItems.sort((a, b) => b.time.localeCompare(a.time));

  // timeとtextで重複排除
  const uniqueDiaryItems = diaryItems.filter(
    (item, idx, self) =>
      self.findIndex((v) => v.time === item.time && v.text === item.text) ===
      idx
  );

  // ai_log.jsonからAIコーチング内容を取得
  const aiLogPath = path.resolve(process.cwd(), "ai_log.json");
  let aiEntries: { timestamp: string; response: string }[] = [];
  try {
    const aiLogRaw = await fs.readFile(aiLogPath, "utf-8");
    const aiLog = JSON.parse(aiLogRaw);
    aiEntries = (aiLog[USER_ID] || []).map(
      (entry: { timestamp: string; response: string }) => ({
        timestamp: entry.timestamp,
        response: entry.response,
      })
    );
  } catch {}

  // recordとai_logを統合して時系列順に並べる
  const mergedItems = [
    ...uniqueDiaryItems.map((item) => ({
      type: "diary" as const,
      time: item.time,
      mood: item.mood,
      text: item.text,
    })),
    ...aiEntries.map((entry) => ({
      type: "ai" as const,
      time: entry.timestamp,
      text: entry.response,
    })),
  ].sort((a, b) => b.time.localeCompare(a.time));

  return (
    <main style={{ maxWidth: 600, margin: "40px auto", padding: 16 }}>
      <DiaryClient />
      <h1 style={{ fontSize: 28, fontWeight: "bold", marginBottom: 24 }}>
        日記の振り返り
      </h1>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {mergedItems.map((item, idx) => (
          <li
            key={idx}
            style={{
              border: "1px solid #ddd",
              borderRadius: 8,
              marginBottom: 20,
              padding: 16,
              background: item.type === "ai" ? "#f5f7ff" : "#fff",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            }}
          >
            <div
              style={{ display: "flex", alignItems: "center", marginBottom: 8 }}
            >
              {item.type === "diary" ? (
                <span style={{ fontWeight: "bold", marginRight: 12 }}>
                  {item.mood.map((m: string, i: number) => (
                    <span key={i} style={{ marginRight: 4 }}>
                      {moodEmoji(m)} {m}
                    </span>
                  ))}
                </span>
              ) : (
                <span
                  style={{
                    fontWeight: "bold",
                    marginRight: 12,
                    color: "#223366",
                  }}
                >
                  AIコーチング
                </span>
              )}
              <span style={{ color: "#888", fontSize: 13 }}>{item.time}</span>
            </div>
            <div style={{ marginBottom: 12, whiteSpace: "pre-line" }}>
              {item.text}
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
