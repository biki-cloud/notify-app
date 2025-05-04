"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import Link from "next/link";
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
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        <ol className="list-inside list-decimal text-sm/6 text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
          <li className="mb-2 tracking-[-.01em]">
            Get started by editing{" "}
            <code className="bg-black/[.05] dark:bg-white/[.06] px-1 py-0.5 rounded font-[family-name:var(--font-geist-mono)] font-semibold">
              app/page.tsx
            </code>
            .
          </li>
          <li className="tracking-[-.01em]">
            Save and see your changes instantly.
          </li>
        </ol>

        <div className="flex flex-col gap-4 p-4 border rounded bg-white/80 dark:bg-black/30 w-full max-w-md">
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
            className={`mt-4 px-4 py-2 rounded text-white bg-blue-500`}
            onClick={sendNotification}
            disabled={loadingQuote}
          >
            {loadingQuote ? "名言取得中..." : "即時通知"}
          </button>
          <button
            className="mt-2 px-4 py-2 rounded text-white bg-purple-600"
            onClick={subscribePush}
          >
            Push通知を購読
          </button>
        </div>
        <div style={{ margin: "16px 0" }}>
          <Link
            href="/settings"
            style={{ color: "#1976d2", textDecoration: "underline" }}
          >
            通知設定画面へ
          </Link>
        </div>
        {/* ユーザー記録UI */}
        <div className="flex flex-col gap-4 p-4 border rounded bg-white/80 dark:bg-black/30 w-full max-w-md mt-8">
          <div className="font-bold mb-2">今日の記録</div>
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
            className="border rounded px-2 py-1"
            rows={3}
            value={diary}
            onChange={(e) => setDiary(e.target.value)}
            placeholder="今日のひとことや出来事など"
          />
          <button
            className="px-4 py-2 rounded text-white bg-green-600"
            onClick={saveRecord}
            disabled={recordLoading || !mood}
          >
            {recordLoading ? "記録中..." : "記録する"}
          </button>
          {recordMsg && (
            <div className="text-sm text-green-700 mt-1">{recordMsg}</div>
          )}
          {latestRecord && (
            <div className="mt-4 text-sm text-gray-700">
              <div>直近の記録：</div>
              <div>気分：{latestRecord.mood}</div>
              <div>日記：{latestRecord.diary}</div>
            </div>
          )}
        </div>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}
