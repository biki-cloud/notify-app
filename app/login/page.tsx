"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [userId, setUserId] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      setError("ユーザIDを入力してください");
      return;
    }
    localStorage.setItem("userId", userId);
    router.push("/");
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
