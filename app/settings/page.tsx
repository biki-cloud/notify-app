"use client";
import { useEffect, useState } from "react";
import RequireLogin from "../components/RequireLogin";

const SETTINGS_KEY = "notify_settings";
const USERID_KEY = "userId";

export default function SettingsPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [type, setType] = useState<"ai" | "custom">("ai");
  const [customMessage, setCustomMessage] = useState("");
  const [saved, setSaved] = useState(false);

  // ユーザーIDの管理
  useEffect(() => {
    let id = localStorage.getItem(USERID_KEY);
    if (!id) {
      id = "guest";
      localStorage.setItem(USERID_KEY, id);
    }
    setUserId(id);
  }, []);

  // 設定の読み込み
  useEffect(() => {
    const settings = localStorage.getItem(SETTINGS_KEY);
    if (settings) {
      const parsed = JSON.parse(settings);
      setType(parsed.type || "ai");
      setCustomMessage(parsed.customMessage || "");
    }
  }, []);

  // 設定の保存
  const handleSave = async () => {
    const settings = { type, customMessage };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
    // サーバーにも保存
    if (userId) {
      await fetch("/api/user-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, type, customMessage }),
      });
    }
  };

  // --- 通知送信UI用 state & 関数 ---
  const [message, setMessage] = useState("");
  const [mode, setMode] = useState<"custom" | "quote">("custom");
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [vapidKey, setVapidKey] = useState<string | null>(null);

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
    const userId = localStorage.getItem(USERID_KEY);
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

  return (
    <>
      <RequireLogin />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 dark:from-gray-900 dark:to-gray-800 flex flex-col items-center py-10">
        {/* 通知送信UI */}
        <section className="w-full max-w-md bg-white/90 dark:bg-gray-900/80 rounded-2xl shadow-lg p-6 mb-8">
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

        {/* 既存の通知設定UI */}
        <div className="w-full max-w-md bg-white/90 dark:bg-gray-900/80 rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4 text-blue-700 dark:text-blue-300">
            通知設定
          </h2>
          <div className="mb-4">
            <label className="mr-6">
              <input
                type="radio"
                name="type"
                value="ai"
                checked={type === "ai"}
                onChange={() => setType("ai")}
              />
              <span className="ml-1">AIが持ってくるメッセージ</span>
            </label>
            <label>
              <input
                type="radio"
                name="type"
                value="custom"
                checked={type === "custom"}
                onChange={() => setType("custom")}
              />
              <span className="ml-1">自分で決めたメッセージ</span>
            </label>
          </div>
          {type === "custom" && (
            <div className="mb-4">
              <label className="block mb-1">メッセージ内容：</label>
              <input
                type="text"
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                className="w-full border rounded px-2 py-1"
                placeholder="通知で表示するメッセージを入力"
              />
            </div>
          )}
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded text-white bg-blue-600 hover:bg-blue-700 transition"
          >
            保存
          </button>
          {saved && <div className="text-green-700 mt-3">保存しました</div>}
          <div className="mt-8 text-xs text-gray-500">ユーザーID: {userId}</div>
        </div>
      </div>
    </>
  );
}
