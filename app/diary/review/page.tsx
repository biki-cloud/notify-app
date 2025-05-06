import { db } from "../../../drizzle/db";
import { records, ai_logs } from "../../../drizzle/schema";
import { moodEmoji } from "../../emojiList";
import DiaryClient from "../DiaryClient";
import { desc, eq } from "drizzle-orm";

// ユーザーIDは現状1つのみと仮定
const USER_ID = "3ccee381-9aab-4a26-9ca6-251c395cd68e";

export default async function DiaryReviewPage() {
  // DBから記録を取得
  const recordRows = await db
    .select()
    .from(records)
    .where(eq(records.user_id, USER_ID))
    .orderBy(desc(records.date));
  const userRecords = recordRows.map((row) => ({
    time: row.date,
    mood: Array.isArray(row.mood) ? row.mood : row.mood ? [row.mood] : [],
    text: row.diary,
  }));

  // timeとtextで重複排除
  const uniqueDiaryItems = userRecords.filter(
    (item, idx, self) =>
      self.findIndex((v) => v.time === item.time && v.text === item.text) ===
      idx
  );

  // DBからAIコーチング内容を取得
  const aiLogRows = await db
    .select()
    .from(ai_logs)
    .where(eq(ai_logs.user_id, USER_ID))
    .orderBy(desc(ai_logs.timestamp));
  const aiEntries = aiLogRows.map((entry) => ({
    timestamp: entry.timestamp,
    response: entry.response,
  }));

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
                <>
                  <img
                    src="/coach.png"
                    alt="AIコーチ"
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      objectFit: "cover",
                      marginRight: 12,
                      border: "2px solid #b3aaff",
                      background: "#fff",
                    }}
                  />
                  <span
                    style={{
                      fontWeight: "bold",
                      marginRight: 12,
                      color: "#223366",
                    }}
                  >
                    ヒル魔
                  </span>
                </>
              )}
              <span style={{ color: "#888", fontSize: 13 }}>{item.time}</span>
            </div>
            <div
              style={{
                marginBottom: 12,
                whiteSpace: "pre-line",
                display: "flex",
                alignItems: "flex-start",
              }}
            >
              {item.type === "ai" ? (
                <>
                  <div style={{ width: 40, minWidth: 40, marginRight: 12 }} />
                  <div>{item.text}</div>
                </>
              ) : (
                item.text
              )}
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
