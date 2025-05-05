"use client";
import { useState } from "react";

export default function DiaryClient() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleCoaching = async () => {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/notify-trigger", {
        method: "POST",
      });
      if (res.ok) {
        setMessage("コーチング通知を送信しました！");
        window.location.reload();
      } else {
        setMessage("通知送信に失敗しました");
      }
    } catch {
      setMessage("通知送信に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginBottom: 24, textAlign: "center" }}>
      <button
        onClick={handleCoaching}
        disabled={loading}
        style={{
          padding: "10px 24px",
          borderRadius: 8,
          background: "#6c47ff",
          color: "#fff",
          fontWeight: "bold",
          fontSize: 16,
          border: "none",
          cursor: loading ? "not-allowed" : "pointer",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        }}
      >
        {loading ? "送信中..." : "コーチングお願い！"}
      </button>
      {message && (
        <div style={{ marginTop: 12, color: "#6c47ff", fontWeight: "bold" }}>
          {message}
        </div>
      )}
    </div>
  );
}
