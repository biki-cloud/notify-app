"use client";
import { useEffect, useState } from "react";
import dayjs from "dayjs";

export default function Home() {
  const [mood, setMood] = useState<string[]>([]);
  const [diary, setDiary] = useState("");
  const [recordLoading, setRecordLoading] = useState(false);
  const [recordMsg, setRecordMsg] = useState("");
  const [latestRecord, setLatestRecord] = useState<{
    mood: string[];
    diary: string;
  } | null>(null);
  const today = dayjs().format("YYYY-MM-DD");
  const userId =
    typeof window !== "undefined"
      ? localStorage.getItem("notify_user_id") || "demo_user"
      : "demo_user";

  // 記録取得
  useEffect(() => {
    if (!userId) return;
    fetch(`/api/record?userId=${userId}&date=${today}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.mood || data.diary) {
          // moodがstring型なら配列に変換
          const moodArr = Array.isArray(data.mood)
            ? data.mood
            : data.mood
            ? [data.mood]
            : [];
          setLatestRecord({ ...data, mood: moodArr });
        }
      });
  }, [userId, today]);

  // 記録保存
  const saveRecord = async () => {
    setRecordLoading(true);
    setRecordMsg("");
    try {
      const res = await fetch("/api/record", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, mood, diary }),
      });
      if (res.ok) {
        setRecordMsg("記録しました！");
        setLatestRecord({ mood: [...mood], diary });
      } else {
        setRecordMsg("記録に失敗しました");
      }
    } catch {
      setRecordMsg("記録に失敗しました");
    } finally {
      setRecordLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 dark:from-gray-900 dark:to-gray-800 flex flex-col">
      <main className="flex flex-col items-center flex-1 w-full px-4 py-8 gap-8">
        {/* 今日の記録カードのみ残す */}
        <section className="w-full max-w-md bg-white/90 dark:bg-gray-900/80 rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-green-700 dark:text-green-300">
            今日の記録
          </h2>
          <div className="mb-2">
            <div className="font-bold text-green-700 dark:text-green-300 mb-1">
              ポジティブ
            </div>
            <div className="flex flex-wrap gap-2 mb-2">
              {[
                { label: "嬉しい", emoji: "😊" },
                { label: "楽しい", emoji: "😆" },
                { label: "ワクワク", emoji: "🤩" },
                { label: "満足", emoji: "😋" },
                { label: "感謝", emoji: "🙏" },
                { label: "感動", emoji: "😭" },
                { label: "やる気", emoji: "🔥" },
                { label: "充実", emoji: "💪" },
                { label: "希望", emoji: "🌈" },
                { label: "誇り", emoji: "😤" },
                { label: "幸福", emoji: "🥰" },
                { label: "絶好調", emoji: "💯" },
                { label: "安心", emoji: "😌" },
                { label: "リラックス", emoji: "🛀" },
                { label: "納得", emoji: "👌" },
                { label: "感心", emoji: "👏" },
                { label: "感激", emoji: "🥹" },
                { label: "感無量", emoji: "🥲" },
                { label: "愛情", emoji: "❤️" },
              ].map(({ label, emoji }) => (
                <label key={label}>
                  <input
                    type="checkbox"
                    name="mood"
                    value={label}
                    checked={mood.includes(label)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setMood([...mood, label]);
                      } else {
                        setMood(mood.filter((m) => m !== label));
                      }
                    }}
                  />
                  <span className="ml-1">
                    {emoji} {label}
                  </span>
                </label>
              ))}
            </div>
            <div className="font-bold text-red-700 dark:text-red-300 mb-1 mt-2">
              ネガティブ
            </div>
            <div className="flex flex-wrap gap-2 mb-2">
              {[
                { label: "悲しい", emoji: "😢" },
                { label: "怒り", emoji: "😡" },
                { label: "不安", emoji: "😰" },
                { label: "疲れた", emoji: "😩" },
                { label: "イライラ", emoji: "😠" },
                { label: "寂しい", emoji: "😔" },
                { label: "退屈", emoji: "😑" },
                { label: "焦り", emoji: "😣" },
                { label: "後悔", emoji: "😞" },
                { label: "無気力", emoji: "😶" },
                { label: "混乱", emoji: "😵‍💫" },
                { label: "孤独", emoji: "🥲" },
                { label: "絶望", emoji: "😱" },
                { label: "恥ずかしい", emoji: "😳" },
                { label: "恐怖", emoji: "👻" },
                { label: "驚き", emoji: "😲" },
                { label: "嫉妬", emoji: "😒" },
                { label: "羨ましい", emoji: "🤤" },
                { label: "罪悪感", emoji: "😓" },
                { label: "緊張", emoji: "😬" },
                { label: "困惑", emoji: "🤔" },
                { label: "疑問", emoji: "❓" },
                { label: "最悪", emoji: "💀" },
                { label: "悪い", emoji: "🙁" },
              ].map(({ label, emoji }) => (
                <label key={label}>
                  <input
                    type="checkbox"
                    name="mood"
                    value={label}
                    checked={mood.includes(label)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setMood([...mood, label]);
                      } else {
                        setMood(mood.filter((m) => m !== label));
                      }
                    }}
                  />
                  <span className="ml-1">
                    {emoji} {label}
                  </span>
                </label>
              ))}
            </div>
            <div className="font-bold text-gray-700 dark:text-gray-300 mb-1 mt-2">
              ニュートラル・その他
            </div>
            <div className="flex flex-wrap gap-2 mb-2">
              {[
                { label: "普通", emoji: "😐" },
                { label: "平和", emoji: "🕊️" },
                { label: "良い", emoji: "🙂" },
                { label: "お腹減った", emoji: "🍙" },
              ].map(({ label, emoji }) => (
                <label key={label}>
                  <input
                    type="checkbox"
                    name="mood"
                    value={label}
                    checked={mood.includes(label)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setMood([...mood, label]);
                      } else {
                        setMood(mood.filter((m) => m !== label));
                      }
                    }}
                  />
                  <span className="ml-1">
                    {emoji} {label}
                  </span>
                </label>
              ))}
            </div>
          </div>
          <textarea
            className="border rounded px-2 py-1 w-full"
            rows={3}
            value={diary}
            onChange={(e) => setDiary(e.target.value)}
            placeholder="今日のひとことや出来事など"
          />
          <button
            className="mt-4 px-4 py-2 rounded text-white bg-green-600 hover:bg-green-700 transition"
            onClick={saveRecord}
            disabled={recordLoading || mood.length === 0}
          >
            {recordLoading ? "記録中..." : "記録する"}
          </button>
          {recordMsg && (
            <div className="text-sm text-green-700 mt-1">{recordMsg}</div>
          )}
          {latestRecord && (
            <div className="mt-4 text-sm text-gray-700 dark:text-gray-200">
              <div>直近の記録：</div>
              <div>
                気分：
                {Array.isArray(latestRecord.mood)
                  ? latestRecord.mood.join("・")
                  : latestRecord.mood}
              </div>
              <div>日記：{latestRecord.diary}</div>
            </div>
          )}
        </section>
      </main>

      <footer className="w-full py-6 flex flex-col items-center gap-2 text-xs text-gray-500 dark:text-gray-400 bg-transparent mt-8">
        <div>© {new Date().getFullYear()} Notify App</div>
        <div className="flex gap-4">
          <a
            href="https://nextjs.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            Next.js
          </a>
          <a
            href="https://vercel.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            Vercel
          </a>
        </div>
      </footer>
    </div>
  );
}
