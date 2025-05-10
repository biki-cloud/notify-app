"use client";
import { useEffect, useState } from "react";

const habitCategories = [
  { key: "ideal_habits", label: "最高の習慣（理想）" },
  { key: "bad_habits", label: "改善したい習慣（やめたいこと）" },
  { key: "new_habits", label: "始めたい習慣（チャレンジ）" },
  { key: "tracking_habits", label: "継続中の習慣（モニタリング）" },
];

// habits型定義
interface Habits {
  ideal_habits: string[];
  bad_habits: string[];
  new_habits: string[];
  tracking_habits: string[];
  [key: string]: string[]; // インデックスシグネチャ追加
}

export default function UserHabitsForm() {
  const [habits, setHabits] = useState<Habits>({
    ideal_habits: [""],
    bad_habits: [""],
    new_habits: [""],
    tracking_habits: [""],
  });
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const userId =
    typeof window !== "undefined"
      ? localStorage.getItem("userId") || "demo_user"
      : "demo_user";

  // 既存データ取得
  useEffect(() => {
    if (!userId) return;
    fetch(`/api/habits?userId=${userId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setHabits({
            ideal_habits: data.ideal_habits || [""],
            bad_habits: data.bad_habits || [""],
            new_habits: data.new_habits || [""],
            tracking_habits: data.tracking_habits || [""],
          });
        }
      });
  }, [userId]);

  const handleChange = (category: string, idx: number, value: string) => {
    setHabits((prev) => ({
      ...prev,
      [category]: (prev[category] as string[]).map((v: string, i: number) =>
        i === idx ? value : v
      ),
    }));
  };

  const handleAdd = (category: string) => {
    setHabits((prev) => ({
      ...prev,
      [category]: [...(prev[category] as string[]), ""],
    }));
  };

  const handleRemove = (category: string, idx: number) => {
    setHabits((prev) => ({
      ...prev,
      [category]: (prev[category] as string[]).filter(
        (_: string, i: number) => i !== idx
      ),
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    setMsg("");
    try {
      const res = await fetch("/api/habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ...habits }),
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
        あなたの習慣プラン
      </h2>
      {habitCategories.map((cat) => (
        <div className="mb-4" key={cat.key}>
          <label className="block font-bold mb-1">{cat.label}</label>
          {habits[cat.key].map((v: string, idx: number) => (
            <div className="flex items-center mb-1" key={idx}>
              <input
                className="border rounded px-2 py-1 w-full"
                value={v}
                onChange={(e) => handleChange(cat.key, idx, e.target.value)}
                placeholder="入力してください"
              />
              {habits[cat.key].length > 1 && (
                <button
                  type="button"
                  className="ml-2 text-red-500"
                  onClick={() => handleRemove(cat.key, idx)}
                >
                  削除
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            className="text-blue-600 text-sm mt-1"
            onClick={() => handleAdd(cat.key)}
          >
            ＋追加
          </button>
        </div>
      ))}
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
