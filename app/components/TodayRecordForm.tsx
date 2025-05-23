"use client";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { EMOJI_LIST } from "../lib/shared/emojiList";

export default function TodayRecordForm() {
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
      ? localStorage.getItem("userId") || "demo_user"
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
    <section className="w-full max-w-md bg-white/90 dark:bg-gray-900/80 rounded-2xl shadow-lg p-6 mx-auto mb-8">
      <h2 className="text-xl font-bold mb-4 text-green-700 dark:text-green-300">
        今日の記録
      </h2>
      <div className="mb-2">
        <div className="font-bold text-green-700 dark:text-green-300 mb-1">
          ポジティブ
        </div>
        <div className="flex flex-wrap gap-2 mb-2">
          {EMOJI_LIST.positive.map(({ label, emoji }) => (
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
          {EMOJI_LIST.negative.map(({ label, emoji }) => (
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
          {EMOJI_LIST.neutral.map(({ label, emoji }) => (
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
  );
}
