"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaBookOpen } from "react-icons/fa";

export default function NavigationBar() {
  const pathname = usePathname();
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
      <div className="flex gap-6 text-base font-semibold">
        <Link
          href="/"
          className={`hover:text-blue-600 transition ${
            pathname === "/"
              ? "text-blue-600 border-b-2 border-blue-600 pb-1"
              : "text-gray-700 dark:text-gray-200"
          }`}
        >
          ホーム
        </Link>
        <Link
          href="/diary"
          className={`hover:text-blue-600 transition ${
            pathname === "/diary"
              ? "text-blue-600 border-b-2 border-blue-600 pb-1"
              : "text-gray-700 dark:text-gray-200"
          }`}
        >
          日記
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
          href="/settings"
          className={`hover:text-purple-600 transition ${
            pathname === "/settings"
              ? "text-purple-600 border-b-2 border-purple-600 pb-1"
              : "text-gray-700 dark:text-gray-200"
          }`}
        >
          設定
        </Link>
      </div>
    </nav>
  );
}
