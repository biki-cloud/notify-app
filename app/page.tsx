"use client";
import { useEffect, useState } from "react";
import dayjs from "dayjs";

export default function Home() {
  const [message, setMessage] = useState("");
  const [mode, setMode] = useState<"custom" | "quote">("custom");
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [vapidKey, setVapidKey] = useState<string | null>(null);
  const [mood, setMood] = useState("");
  const [diary, setDiary] = useState("");
  const [recordLoading, setRecordLoading] = useState(false);
  const [recordMsg, setRecordMsg] = useState("");
  const [latestRecord, setLatestRecord] = useState<{
    mood: string;
    diary: string;
  } | null>(null);
  const today = dayjs().format("YYYY-MM-DD");
  const userId =
    typeof window !== "undefined"
      ? localStorage.getItem("notify_user_id") || "demo_user"
      : "demo_user";

  // 通知許可リクエスト
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      Notification.requestPermission();
    }
  }, []);

  // 公開鍵を取得
  useEffect(() => {
    fetch("/api/vapid-public-key")
      .then((res) => res.json())
      .then((data) => setVapidKey(data.key));
  }, []);

  // 記録取得
  useEffect(() => {
    if (!userId) return;
    fetch(`/api/record?userId=${userId}&date=${today}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.mood || data.diary) setLatestRecord(data);
      });
  }, [userId, today]);

  // 名言取得関数
  const fetchQuote = async () => {
    setLoadingQuote(true);
    try {
      const res = await fetch("/api/quote");
      const data = await res.json();
      return data.quote || "名言の取得に失敗しました";
    } catch {
      return "名言の取得に失敗しました";
    } finally {
      setLoadingQuote(false);
    }
  };

  // 通知送信関数（モード対応）
  const sendNotification = async () => {
    let msg = message || "テスト通知";
    if (mode === "quote") {
      msg = await fetchQuote();
    }
    if (Notification.permission === "granted") {
      if (navigator.serviceWorker) {
        navigator.serviceWorker.getRegistration().then((reg) => {
          reg?.showNotification("通知", { body: msg });
        });
      } else {
        new Notification("通知", { body: msg });
      }
    }
  };

  // サブスクリプション登録
  const subscribePush = async () => {
    if (!("serviceWorker" in navigator) || !vapidKey) return;
    const reg = await navigator.serviceWorker.ready;
    // 既存購読があれば解除
    const existing = await reg.pushManager.getSubscription();
    if (existing) {
      await existing.unsubscribe();
    }
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidKey),
    });
    const userId = localStorage.getItem("notify_user_id");
    // デバッグ出力
    console.log("sub", sub);
    console.log("userId", userId);
    await fetch("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...sub.toJSON(), userId }),
    });
    alert("Push通知の購読が完了しました");
  };

  // VAPID鍵のBase64デコード
  function urlBase64ToUint8Array(base64String: string) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");
    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

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
        setLatestRecord({ mood, diary });
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
      {/* ヒーローセクション（ナビ下に余白追加） */}

      <main className="flex flex-col items-center flex-1 w-full px-4 py-8 gap-8">
        {/* 通知カード */}
        <section className="w-full max-w-md bg-white/90 dark:bg-gray-900/80 rounded-2xl shadow-lg p-6 mb-4">
          <h2 className="text-xl font-bold mb-4 text-blue-700 dark:text-blue-300">
            通知を送る
          </h2>
          <div className="flex flex-col gap-4">
            <label className="font-bold">通知モード</label>
            <div className="flex gap-4 mb-2">
              <label>
                <input
                  type="radio"
                  name="mode"
                  value="custom"
                  checked={mode === "custom"}
                  onChange={() => setMode("custom")}
                />
                <span className="ml-1">自分のメッセージ</span>
              </label>
              <label>
                <input
                  type="radio"
                  name="mode"
                  value="quote"
                  checked={mode === "quote"}
                  onChange={() => setMode("quote")}
                />
                <span className="ml-1">哲学名言（OpenAI）</span>
              </label>
            </div>
            {mode === "custom" && (
              <>
                <label className="font-bold">通知メッセージ</label>
                <input
                  className="border rounded px-2 py-1"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="通知したいメッセージを入力"
                />
              </>
            )}
            <button
              className="mt-4 px-4 py-2 rounded text-white bg-blue-500 hover:bg-blue-600 transition"
              onClick={sendNotification}
              disabled={loadingQuote}
            >
              {loadingQuote ? "名言取得中..." : "即時通知"}
            </button>
            <button
              className="mt-2 px-4 py-2 rounded text-white bg-purple-600 hover:bg-purple-700 transition"
              onClick={subscribePush}
            >
              Push通知を購読
            </button>
          </div>
        </section>

        {/* 今日の記録カード */}
        <section className="w-full max-w-md bg-white/90 dark:bg-gray-900/80 rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-green-700 dark:text-green-300">
            今日の記録
          </h2>
          <div className="flex gap-2 mb-2">
            <label>
              <input
                type="radio"
                name="mood"
                value="良い"
                checked={mood === "良い"}
                onChange={() => setMood("良い")}
              />
              <span className="ml-1">良い</span>
            </label>
            <label>
              <input
                type="radio"
                name="mood"
                value="普通"
                checked={mood === "普通"}
                onChange={() => setMood("普通")}
              />
              <span className="ml-1">普通</span>
            </label>
            <label>
              <input
                type="radio"
                name="mood"
                value="悪い"
                checked={mood === "悪い"}
                onChange={() => setMood("悪い")}
              />
              <span className="ml-1">悪い</span>
            </label>
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
            disabled={recordLoading || !mood}
          >
            {recordLoading ? "記録中..." : "記録する"}
          </button>
          {recordMsg && (
            <div className="text-sm text-green-700 mt-1">{recordMsg}</div>
          )}
          {latestRecord && (
            <div className="mt-4 text-sm text-gray-700 dark:text-gray-200">
              <div>直近の記録：</div>
              <div>気分：{latestRecord.mood}</div>
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
