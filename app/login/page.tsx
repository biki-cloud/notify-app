"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaUserAlt, FaSignInAlt } from "react-icons/fa";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!username) {
      setError("ユーザ名を入力してください");
      return;
    }
    // DBにユーザーが存在するか確認
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });
    const data = await res.json();
    if (data.ok) {
      localStorage.setItem("userId", String(data.userId));
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: "userId",
          newValue: String(data.userId),
        })
      );
      router.push("/");
    } else {
      setError(data.error || "ログイン失敗");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <form
        onSubmit={handleSubmit}
        className="bg-white/90 dark:bg-gray-900/90 shadow-xl rounded-2xl px-8 py-10 w-full max-w-md flex flex-col gap-6 border border-gray-200 dark:border-gray-700 backdrop-blur-md animate-fade-in"
      >
        <h1 className="text-2xl font-bold text-center text-blue-700 dark:text-blue-300 mb-2 flex items-center justify-center gap-2">
          <FaSignInAlt className="inline-block" /> ログイン
        </h1>
        <div className="flex flex-col gap-2">
          <label
            htmlFor="username"
            className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2"
          >
            <FaUserAlt /> ユーザ名
          </label>
          <input
            id="username"
            type="text"
            placeholder="ユーザ名を入力"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:text-gray-100 transition"
          />
        </div>
        <button
          type="submit"
          className="mt-2 py-2 rounded-lg bg-gradient-to-r from-blue-400 to-pink-400 text-white font-bold shadow hover:from-blue-500 hover:to-pink-500 transition-all flex items-center justify-center gap-2 text-lg"
        >
          <FaSignInAlt /> ログイン
        </button>
        {error && (
          <div className="text-red-600 bg-red-50 dark:bg-red-900/40 border border-red-200 dark:border-red-700 rounded p-2 text-center animate-shake">
            {error}
          </div>
        )}
      </form>
    </div>
  );
}
