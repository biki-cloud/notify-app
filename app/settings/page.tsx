"use client";
import { useEffect, useState } from "react";
import RequireLogin from "../components/RequireLogin";
import { sendNotification } from "../lib/client/clientNotification";

const USERID_KEY = "userId";

export default function SettingsPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [type, setType] = useState<"ai" | "custom">("ai");
  const [customMessage, setCustomMessage] = useState<string[]>([""]);
  const [saved, setSaved] = useState(false);

  // ユーザーIDの管理
  useEffect(() => {
    const id = localStorage.getItem(USERID_KEY);
    setUserId(id);
  }, []);

  // 設定の取得（API経由）
  useEffect(() => {
    if (!userId) return;
    fetch(`/api/user-settings?userId=${userId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.type) setType(data.type);
        if (data.customMessage) {
          if (Array.isArray(data.customMessage)) {
            setCustomMessage(
              data.customMessage.length > 0 ? data.customMessage : [""]
            );
          } else if (typeof data.customMessage === "string") {
            setCustomMessage([data.customMessage]);
          }
        }
      });
  }, [userId]);

  // 設定の保存
  const handleSave = async () => {
    if (!userId) return;
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
    await fetch("/api/user-settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, type, customMessage }),
    });
  };

  // --- 通知送信UI用 state & 関数 ---
  const [vapidKey, setVapidKey] = useState<string | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);

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

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.ready.then(async (reg) => {
      const sub = await reg.pushManager.getSubscription();
      setIsSubscribed(!!sub);
    });
  }, [vapidKey, userId]);

  // サブスクリプション登録
  const subscribePush = async () => {
    if (!("serviceWorker" in navigator) || !vapidKey || !userId) return;
    const reg = await navigator.serviceWorker.ready;
    // 既存購読があればそれを使う
    let sub = await reg.pushManager.getSubscription();
    console.log("[subscribePush] 既存購読取得", sub);

    if (sub) {
      console.log("[subscribePush] 既存購読を使用");
      return;
    }

    console.log("[subscribePush] 新規購読登録");
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidKey),
    });
    await fetch("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...sub.toJSON(), userId }),
    });
    setIsSubscribed(true);
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
    <RequireLogin>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 dark:from-gray-900 dark:to-gray-800 flex flex-col items-center py-10">
        {/* 通知送信UI */}
        <section className="w-full max-w-md bg-white/90 dark:bg-gray-900/80 rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4 text-blue-700 dark:text-blue-300">
            通知を送る
          </h2>
          <div className="flex flex-col gap-4">
            <button
              className="mt-4 px-4 py-2 rounded text-white bg-blue-500 hover:bg-blue-600 transition"
              onClick={() => sendNotification()}
            >
              テスト通知
            </button>
            <button
              className={`mt-2 px-4 py-2 rounded text-white transition ${
                isSubscribed
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-purple-600 hover:bg-purple-700"
              }`}
              onClick={subscribePush}
              disabled={isSubscribed}
            >
              通知受け取り設定を行う
            </button>
            {isSubscribed && (
              <div className="mt-2 text-green-700">
                すでに通知受け取り設定済みです
              </div>
            )}
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
              {customMessage.map((msg, idx) => (
                <div className="flex items-center mb-1" key={idx}>
                  <input
                    type="text"
                    value={msg}
                    onChange={(e) => {
                      const newArr = [...customMessage];
                      newArr[idx] = e.target.value;
                      setCustomMessage(newArr);
                    }}
                    className="w-full border rounded px-2 py-1"
                    placeholder="通知で表示するメッセージを入力"
                  />
                  {customMessage.length > 1 && (
                    <button
                      type="button"
                      className="ml-2 text-red-500"
                      onClick={() => {
                        setCustomMessage(
                          customMessage.filter((_, i) => i !== idx)
                        );
                      }}
                    >
                      削除
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                className="text-blue-600 text-sm mt-1"
                onClick={() => setCustomMessage([...customMessage, ""])}
              >
                ＋追加
              </button>
            </div>
          )}
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded text-white bg-blue-600 hover:bg-blue-700 transition"
          >
            保存
          </button>
          {saved && <div className="text-green-700 mt-3">保存しました</div>}
        </div>
      </div>
    </RequireLogin>
  );
}
