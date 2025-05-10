"use client";
import { useEffect, useState } from "react";

const goalCategories = [
  { key: "short_term_goals", label: "短期目標（〜1ヶ月）" },
  { key: "mid_term_goals", label: "中期目標（〜1年）" },
  { key: "long_term_goals", label: "長期目標（〜5年）" },
  { key: "life_goals", label: "人生目標（ビジョン）" },
  { key: "core_values", label: "価値観・信条" },
];

interface Goals {
  short_term_goals?: string[];
  mid_term_goals?: string[];
  long_term_goals?: string[];
  life_goals?: string[];
  core_values?: string[];
  [key: string]: string[] | undefined;
}

export default function UserGoalsForm() {
  const [goals, setGoals] = useState<Goals>({
    short_term_goals: [""],
    mid_term_goals: [""],
    long_term_goals: [""],
    life_goals: [""],
    core_values: [""],
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
    fetch(`/api/goals?userId=${userId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setGoals({
            short_term_goals: data.short_term_goals || [""],
            mid_term_goals: data.mid_term_goals || [""],
            long_term_goals: data.long_term_goals || [""],
            life_goals: data.life_goals || [""],
            core_values: data.core_values || [""],
          });
        }
      });
  }, [userId]);

  const handleChange = (category: string, idx: number, value: string) => {
    setGoals((prev) => ({
      ...prev,
      [category]: (prev[category] as string[]).map((v: string, i: number) =>
        i === idx ? value : v
      ),
    }));
  };

  const handleAdd = (category: string) => {
    setGoals((prev) => ({
      ...prev,
      [category]: [...(prev[category] as string[]), ""],
    }));
  };

  const handleRemove = (category: string, idx: number) => {
    setGoals((prev) => ({
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
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ...goals }),
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
        あなたの目標プラン
      </h2>
      {goalCategories.map((cat) => (
        <div className="mb-4" key={cat.key}>
          <label className="block font-bold mb-1">{cat.label}</label>
          {(goals[cat.key] || [""]).map((v: string, idx: number) => (
            <div className="flex items-center mb-1" key={idx}>
              <input
                className="border rounded px-2 py-1 w-full"
                value={v}
                onChange={(e) => handleChange(cat.key, idx, e.target.value)}
                placeholder="入力してください"
              />
              {(goals[cat.key]?.length ?? 0) > 1 && (
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
