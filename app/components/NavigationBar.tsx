"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaBookOpen } from "react-icons/fa";
import { useEffect, useState } from "react";

export default function NavigationBar() {
  const pathname = usePathname();
  const [userId, setUserId] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const id = localStorage.getItem("userId");
      setUserId(id);
      if (id) {
        fetch(`/api/user?userId=${id}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.username) setUsername(data.username);
            else setUsername(null);
          });
      } else {
        setUsername(null);
      }
      const handleStorage = (e: StorageEvent) => {
        if (e.key === "userId") {
          setUserId(e.newValue);
          if (e.newValue) {
            fetch(`/api/user?userId=${e.newValue}`)
              .then((res) => res.json())
              .then((data) => {
                if (data.username) setUsername(data.username);
                else setUsername(null);
              });
          } else {
            setUsername(null);
          }
        }
      };
      window.addEventListener("storage", handleStorage);
      return () => {
        window.removeEventListener("storage", handleStorage);
      };
    }
  }, []);

  return (
    <nav className="w-full h-16 flex items-center justify-between px-6 bg-white/90 dark:bg-gray-900/80 shadow-md fixed top-0 left-0 z-20">
      <div className="text-xl font-bold tracking-tight text-blue-700 dark:text-blue-300 flex items-center gap-2">
        <Link
          href="/"
          className={`hover:text-blue-600 transition ${
            pathname === "/diary"
              ? "text-blue-600 border-b-2 border-blue-600 pb-1"
              : "text-gray-700 dark:text-gray-200"
          }`}
        >
          <FaBookOpen className="inline-block mb-1" /> Notify App
        </Link>
      </div>
      <div className="flex gap-6 text-base font-semibold items-center">
        <Link
          href="/diary"
          className={`hover:text-blue-600 transition ${
            pathname === "/diary"
              ? "text-blue-600 border-b-2 border-blue-600 pb-1"
              : "text-gray-700 dark:text-gray-200"
          }`}
        >
          記録
        </Link>
        <Link
          href="/diary/review"
          className={`hover:text-indigo-600 transition ${
            pathname === "/diary/review"
              ? "text-indigo-600 border-b-2 border-indigo-600 pb-1"
              : "text-gray-700 dark:text-gray-200"
          }`}
        >
          レビュー
        </Link>
        <Link
          href="/goals"
          className={`hover:text-pink-600 transition ${
            pathname === "/goals"
              ? "text-pink-600 border-b-2 border-pink-600 pb-1"
              : "text-gray-700 dark:text-gray-200"
          }`}
        >
          目標
        </Link>
        <Link
          href="/habits"
          className={`hover:text-pink-600 transition ${
            pathname === "/habits"
              ? "text-pink-600 border-b-2 border-pink-600 pb-1"
              : "text-gray-700 dark:text-gray-200"
          }`}
        >
          習慣
        </Link>
        <Link
          href="/self_analysis"
          className={`hover:text-pink-600 transition ${
            pathname === "/self_analysis"
              ? "text-pink-600 border-b-2 border-pink-600 pb-1"
              : "text-gray-700 dark:text-gray-200"
          }`}
        >
          自己分析
        </Link>
        <Link
          href="/settings"
          className={`hover:text-purple-600 transition ${
            pathname === "/settings"
              ? "text-purple-600 border-b-2 border-purple-600 pb-1"
              : "text-gray-700 dark:text-gray-200"
          }`}
        >
          設定
        </Link>
        {/* ログイン状態で表示切替 */}
        {userId ? (
          <>
            <span className="ml-4 text-sm text-gray-600 dark:text-gray-300">
              {username ? `${username} さんでログイン中` : "ログイン中"}
            </span>
            <button
              onClick={async () => {
                await fetch("/api/logout", { method: "POST" });
                localStorage.removeItem("userId");
                setUserId(null);
                setUsername(null);
                window.location.href = "/";
              }}
              className="ml-4 px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-red-200 hover:text-red-700 transition border border-gray-300 dark:border-gray-600"
              type="button"
            >
              サインアウト
            </button>
          </>
        ) : (
          <>
            <Link
              href="/login"
              className={`hover:text-green-600 transition ${
                pathname === "/login"
                  ? "text-green-600 border-b-2 border-green-600 pb-1"
                  : "text-gray-700 dark:text-gray-200"
              }`}
            >
              ログイン
            </Link>
            <Link
              href="/register"
              className={`hover:text-orange-600 transition ${
                pathname === "/register"
                  ? "text-orange-600 border-b-2 border-orange-600 pb-1"
                  : "text-gray-700 dark:text-gray-200"
              }`}
            >
              新規登録
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
