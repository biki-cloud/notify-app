"use client";
// import { useEffect, useState } from "react";
// import dayjs from "dayjs";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 dark:from-gray-900 dark:to-gray-800 flex flex-col">
      <main className="flex flex-col items-center flex-1 w-full px-4 py-8 gap-8">
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
