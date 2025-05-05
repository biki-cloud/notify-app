"use client";
// import { useEffect, useState } from "react";
// import dayjs from "dayjs";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 dark:from-gray-900 dark:to-gray-800 flex flex-col">
      <main className="flex flex-col items-center flex-1 w-full px-4 py-8 gap-8">
        <section className="bg-white/70 dark:bg-gray-900/70 rounded-3xl shadow-xl p-8 max-w-xl w-full flex flex-col items-center gap-4 border border-purple-100 dark:border-gray-700">
          <h1 className="text-3xl font-bold text-purple-700 dark:text-purple-300 mb-2">
            Notify App へようこそ 🎉
          </h1>
          <p className="text-lg text-gray-700 dark:text-gray-200 text-center">
            毎日を、もっと豊かに。
            <br />
            目標や日々の記録を、シンプルかつ美しく管理できるアプリです。
          </p>
          <ul className="text-base text-gray-600 dark:text-gray-300 list-disc list-inside mt-4 text-left">
            <li>目標を設定し、毎日の達成状況を記録しましょう。</li>
            <li>直感的なUIで、どこからでもすぐに記録が可能です。</li>
            <li>過去の記録を振り返り、成長を実感できます。</li>
          </ul>
        </section>
        {/* 今日の記録カードを削除 */}
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
