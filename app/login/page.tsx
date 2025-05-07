"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [userId, setUserId] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!userId) {
      setError("ユーザIDを入力してください");
      return;
    }
    // DBにユーザーが存在するか確認
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    const data = await res.json();
    if (data.ok) {
      localStorage.setItem("userId", userId);
      router.push("/");
    } else {
      setError(data.error || "ログイン失敗");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        maxWidth: 400,
        margin: "40px auto",
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <h1>ログイン</h1>
      <input
        type="text"
        placeholder="ユーザID"
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
        required
      />
      <button type="submit">ログイン</button>
      {error && <div style={{ color: "red" }}>{error}</div>}
    </form>
  );
}
