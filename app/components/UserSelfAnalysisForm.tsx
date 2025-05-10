"use client";
import { useEffect, useState } from "react";

const selfAnalysisCategories = [
  { key: "strengths", label: "自分の良いところ（強み）" },
  { key: "weaknesses", label: "自分の課題（弱み・直したい点）" },
];

interface SelfAnalysis {
  strengths?: string[];
  weaknesses?: string[];
  [key: string]: string[] | undefined;
}

export default function UserSelfAnalysisForm() {
  const [selfAnalysis, setSelfAnalysis] = useState<SelfAnalysis>({
    strengths: [""],
    weaknesses: [""],
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
    fetch(`/api/self_analysis?userId=${userId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setSelfAnalysis({
            strengths: data.strengths || [""],
            weaknesses: data.weaknesses || [""],
          });
        }
      });
  }, [userId]);

  const handleChange = (category: string, idx: number, value: string) => {
    setSelfAnalysis((prev) => ({
      ...prev,
      [category]: (prev[category] as string[]).map((v: string, i: number) =>
        i === idx ? value : v
      ),
    }));
  };

  const handleAdd = (category: string) => {
    setSelfAnalysis((prev) => ({
      ...prev,
      [category]: [...(prev[category] as string[]), ""],
    }));
  };

  const handleRemove = (category: string, idx: number) => {
    setSelfAnalysis((prev) => ({
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
      const res = await fetch("/api/self_analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ...selfAnalysis }),
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
        あなたの自己分析
      </h2>
      {selfAnalysisCategories.map((cat) => (
        <div className="mb-4" key={cat.key}>
          <label className="block font-bold mb-1">{cat.label}</label>
          {(selfAnalysis[cat.key] || [""]).map((v: string, idx: number) => (
            <div className="flex items-center mb-1" key={idx}>
              <input
                className="border rounded px-2 py-1 w-full"
                value={v}
                onChange={(e) => handleChange(cat.key, idx, e.target.value)}
                placeholder="入力してください"
              />
              {(selfAnalysis[cat.key]?.length ?? 0) > 1 && (
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
