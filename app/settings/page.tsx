"use client";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

const SETTINGS_KEY = "notify_settings";
const USER_ID_KEY = "notify_user_id";

export default function SettingsPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [type, setType] = useState<"ai" | "custom">("ai");
  const [customMessage, setCustomMessage] = useState("");
  const [saved, setSaved] = useState(false);

  // ユーザーIDの管理
  useEffect(() => {
    let id = localStorage.getItem(USER_ID_KEY);
    if (!id) {
      id = uuidv4();
      localStorage.setItem(USER_ID_KEY, id);
    }
    setUserId(id);
  }, []);

  // 設定の読み込み
  useEffect(() => {
    const settings = localStorage.getItem(SETTINGS_KEY);
    if (settings) {
      const parsed = JSON.parse(settings);
      setType(parsed.type || "ai");
      setCustomMessage(parsed.customMessage || "");
    }
  }, []);

  // 設定の保存
  const handleSave = async () => {
    const settings = { type, customMessage };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
    // サーバーにも保存
    if (userId) {
      await fetch("/api/user-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, type, customMessage }),
      });
    }
  };

  return (
    <div
      style={{
        maxWidth: 480,
        margin: "40px auto",
        padding: 24,
        background: "#fff",
        borderRadius: 8,
        boxShadow: "0 2px 8px #0001",
      }}
    >
      <h2 style={{ fontSize: 24, fontWeight: "bold", marginBottom: 16 }}>
        通知設定
      </h2>
      <div style={{ marginBottom: 16 }}>
        <label style={{ marginRight: 16 }}>
          <input
            type="radio"
            name="type"
            value="ai"
            checked={type === "ai"}
            onChange={() => setType("ai")}
          />
          AIが持ってくるメッセージ
        </label>
        <label>
          <input
            type="radio"
            name="type"
            value="custom"
            checked={type === "custom"}
            onChange={() => setType("custom")}
          />
          自分で決めたメッセージ
        </label>
      </div>
      {type === "custom" && (
        <div style={{ marginBottom: 16 }}>
          <label>
            メッセージ内容：
            <input
              type="text"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              style={{ width: "100%", padding: 8, marginTop: 4 }}
              placeholder="通知で表示するメッセージを入力"
            />
          </label>
        </div>
      )}
      <button
        onClick={handleSave}
        style={{
          padding: "8px 24px",
          background: "#1976d2",
          color: "#fff",
          border: "none",
          borderRadius: 4,
        }}
      >
        保存
      </button>
      {saved && (
        <div style={{ color: "green", marginTop: 12 }}>保存しました</div>
      )}
      <div style={{ marginTop: 32, fontSize: 12, color: "#888" }}>
        ユーザーID: {userId}
      </div>
    </div>
  );
}
