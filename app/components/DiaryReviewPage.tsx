"use client";
import { useEffect, useState } from "react";
import DiaryClient from "../diary/DiaryClient";
import { moodEmoji } from "../lib/shared/emojiList";

type DiaryItem = {
  type: "diary";
  time: string;
  mood: string[];
  text: string;
};
type AiItem = {
  type: "ai";
  time: string;
  text: string;
};
type Item = DiaryItem | AiItem;

export default function DiaryReviewPage({ userId }: { userId: number }) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // データ再取得用関数
  const fetchItems = () => {
    setLoading(true);
    fetch(`/api/diary-review?userId=${userId}`)
      .then((res) => res.json())
      .then((data) => {
        setItems(data.items || []);
        setLoading(false);
      })
      .catch(() => {
        setError("データ取得に失敗しました");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchItems();
  }, [userId]);

  if (loading) return <div>読み込み中...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  return (
    <main style={{ maxWidth: 600, margin: "40px auto", padding: 16 }}>
      <DiaryClient onCoachingComplete={fetchItems} />
      <h1 style={{ fontSize: 28, fontWeight: "bold", marginBottom: 24 }}>
        日記の振り返り
      </h1>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {items.map((item, idx) => (
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
