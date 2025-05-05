"use client";
import { useEffect, useState } from "react";

export default function UserGoalsForm() {
  const [importantThing, setImportantThing] = useState("");
  const [goal, setGoal] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const userId =
    typeof window !== "undefined"
      ? localStorage.getItem("notify_user_id") || "demo_user"
      : "demo_user";

  // 既存データ取得
  useEffect(() => {
    if (!userId) return;
    fetch(`/api/goals?userId=${userId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.importantThing) setImportantThing(data.importantThing);
        if (data.goal) setGoal(data.goal);
      });
  }, [userId]);

  const handleSave = async () => {
    setLoading(true);
    setMsg("");
    try {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, importantThing, goal }),
      });
      if (res.ok) {
        setMsg("保存しました！");
      } else {
        setMsg("保存に失敗しました");
      }
    } catch {
      setMsg("保存に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="w-full max-w-md bg-white/90 dark:bg-gray-900/80 rounded-2xl shadow-lg p-6 mt-8">
      <h2 className="text-xl font-bold mb-4 text-blue-700 dark:text-blue-300">
        あなたの大切にしていること・目標
      </h2>
      <div className="mb-4">
        <label className="block font-bold mb-1">大切にしていること</label>
        <textarea
          className="border rounded px-2 py-1 w-full"
          value={importantThing}
          onChange={(e) => setImportantThing(e.target.value)}
          placeholder="例：健康、家族、挑戦"
          rows={6}
        />
      </div>
      <div className="mb-4">
        <label className="block font-bold mb-1">目標</label>
        <textarea
          className="border rounded px-2 py-1 w-full"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="例：毎日10分運動する"
          rows={6}
        />
      </div>
      <button
        className="px-4 py-2 rounded text-white bg-blue-600 hover:bg-blue-700 transition"
        onClick={handleSave}
        disabled={loading}
      >
        {loading ? "保存中..." : "保存"}
      </button>
      {msg && <div className="text-sm text-blue-700 mt-2">{msg}</div>}
    </section>
  );
}
