import { promises as fs } from "fs";
import path from "path";

// ai_log.jsonの型定義
interface AiLogEntry {
  timestamp: string;
  prompt: string;
  response: string;
}

// ユーザーIDは現状1つのみと仮定
const USER_ID = "3ccee381-9aab-4a26-9ca6-251c395cd68e";

// promptから個別日記を抽出する関数
function parsePrompt(prompt: string) {
  // 例: 【1件目】\n時刻: ...\n気分: ...\n日記: ...\n\n【2件目】... という形式
  const entryRegex =
    /【(\d+)件目】\n時刻: ([^\n]+)\n気分: ([^\n]+)\n日記: ([^\n]+)/g;
  const results: { time: string; mood: string; text: string }[] = [];
  let match;
  while ((match = entryRegex.exec(prompt)) !== null) {
    results.push({
      time: match[2],
      mood: match[3],
      text: match[4],
    });
  }
  return results;
}

export default async function DiaryPage() {
  // ai_log.jsonを読み込む
  const aiLogPath = path.resolve(process.cwd(), "ai_log.json");
  const aiLogRaw = await fs.readFile(aiLogPath, "utf-8");
  const aiLog: Record<string, AiLogEntry[]> = JSON.parse(aiLogRaw);
  const entries = aiLog[USER_ID] || [];

  // 日記エントリを展開
  const diaryItems = entries.flatMap((entry) => {
    const prompts = parsePrompt(entry.prompt);
    return prompts.map((p) => ({
      ...p,
      response: entry.response,
      timestamp: entry.timestamp,
    }));
  });

  // 新しい順にソート
  diaryItems.sort((a, b) => b.time.localeCompare(a.time));

  // 気分に応じた色
  const moodColor = (mood: string) => {
    switch (mood) {
      case "良い":
        return "#4caf50";
      case "普通":
        return "#ff9800";
      case "悪い":
        return "#f44336";
      default:
        return "#9e9e9e";
    }
  };

  return (
    <main style={{ maxWidth: 600, margin: "40px auto", padding: 16 }}>
      <h1 style={{ fontSize: 28, fontWeight: "bold", marginBottom: 24 }}>
        日記の振り返り
      </h1>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {diaryItems.map((item, idx) => (
          <li
            key={idx}
            style={{
              border: "1px solid #ddd",
              borderRadius: 8,
              marginBottom: 20,
              padding: 16,
              background: "#fff",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            }}
          >
            <div
              style={{ display: "flex", alignItems: "center", marginBottom: 8 }}
            >
              <span
                style={{
                  display: "inline-block",
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  background: moodColor(item.mood),
                  marginRight: 8,
                }}
              ></span>
              <span style={{ fontWeight: "bold", marginRight: 12 }}>
                {item.mood}
              </span>
              <span style={{ color: "#888", fontSize: 13 }}>{item.time}</span>
            </div>
            <div style={{ marginBottom: 12, whiteSpace: "pre-line" }}>
              {item.text}
            </div>
            {item.response && (
              <div
                style={{
                  background: "#f5f5f5",
                  borderRadius: 6,
                  padding: 10,
                  fontSize: 15,
                }}
              >
                <strong>コーチングメッセージ:</strong>
                <div style={{ marginTop: 4 }}>{item.response}</div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}
