"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/register", {
      method: "POST",
      body: JSON.stringify({ username }),
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();
    if (data.ok) {
      localStorage.setItem("userId", String(data.userId));
      router.push("/login");
    } else {
      setError(data.error || "登録失敗");
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
      <h1>新規登録</h1>
      <input
        type="text"
        placeholder="ユーザ名"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />
      <button type="submit">登録</button>
      {error && <div style={{ color: "red" }}>{error}</div>}
    </form>
  );
}
