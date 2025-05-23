"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaBookOpen,
  FaBullseye,
  FaSignInAlt,
  FaUserPlus,
  FaSignOutAlt,
  FaUserCircle,
} from "react-icons/fa";
import { IoSettingsOutline } from "react-icons/io5";
import { MdEditNote, MdRateReview, MdApps } from "react-icons/md";
import { GiProgression, GiMagnifyingGlass } from "react-icons/gi";
import { useEffect, useState, useRef } from "react";

export default function NavigationBar() {
  const pathname = usePathname();
  const [userId, setUserId] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const [showMenuDropdown, setShowMenuDropdown] = useState(false);
  const menuDropdownRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (!showUserDropdown) return;
    function handleClickOutside(event: MouseEvent) {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target as Node)
      ) {
        setShowUserDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showUserDropdown]);

  useEffect(() => {
    if (!showMenuDropdown) return;
    function handleClickOutsideMenu(event: MouseEvent) {
      if (
        menuDropdownRef.current &&
        !menuDropdownRef.current.contains(event.target as Node)
      ) {
        setShowMenuDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutsideMenu);
    return () => {
      document.removeEventListener("mousedown", handleClickOutsideMenu);
    };
  }, [showMenuDropdown]);

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
          title="記録"
          className={`hover:text-blue-600 transition ${
            pathname === "/diary"
              ? "text-blue-600 border-b-2 border-blue-600 pb-1"
              : "text-gray-700 dark:text-gray-200"
          } flex flex-col items-center group`}
        >
          <MdEditNote size={22} />
        </Link>
        <Link
          href="/diary/review"
          title="レビュー"
          className={`hover:text-indigo-600 transition ${
            pathname === "/diary/review"
              ? "text-indigo-600 border-b-2 border-indigo-600 pb-1"
              : "text-gray-700 dark:text-gray-200"
          } flex flex-col items-center group`}
        >
          <MdRateReview size={22} />
        </Link>
        <div className="relative" ref={menuDropdownRef}>
          <button
            onClick={() => setShowMenuDropdown((prev) => !prev)}
            className="flex items-center px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
            type="button"
            aria-label="メニュー"
          >
            <MdApps size={26} />
          </button>
          {showMenuDropdown && (
            <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-36 bg-white dark:bg-gray-800 rounded shadow-lg border border-gray-200 dark:border-gray-700 z-30 text-center py-2">
              <Link
                href="/goals"
                className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
                onClick={() => setShowMenuDropdown(false)}
              >
                <FaBullseye className="inline-block mr-2" />
                目標
              </Link>
              <Link
                href="/habits"
                className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
                onClick={() => setShowMenuDropdown(false)}
              >
                <GiProgression className="inline-block mr-2" />
                習慣
              </Link>
              <Link
                href="/self_analysis"
                className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
                onClick={() => setShowMenuDropdown(false)}
              >
                <GiMagnifyingGlass className="inline-block mr-2" />
                自己分析
              </Link>
            </div>
          )}
        </div>
        <Link
          href="/settings"
          title="設定"
          className={`hover:text-purple-600 transition ${
            pathname === "/settings"
              ? "text-purple-600 border-b-2 border-purple-600 pb-1"
              : "text-gray-700 dark:text-gray-200"
          } flex flex-col items-center group`}
        >
          <IoSettingsOutline size={22} />
        </Link>
        {/* ログイン状態で表示切替 */}
        {userId ? (
          <>
            <div className="relative ml-4" ref={userDropdownRef}>
              <button
                onClick={() => setShowUserDropdown((prev) => !prev)}
                className="flex items-center focus:outline-none"
                title="ユーザー情報"
                type="button"
              >
                <FaUserCircle
                  size={26}
                  className="text-gray-600 dark:text-gray-300"
                />
              </button>
              {showUserDropdown && (
                <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-40 bg-white dark:bg-gray-800 rounded shadow-lg border border-gray-200 dark:border-gray-700 z-30 text-center py-2">
                  <span className="text-sm text-gray-700 dark:text-gray-200">
                    {username ? `${username} さんでログイン中` : "ログイン中"}
                  </span>
                </div>
              )}
            </div>
            <button
              onClick={async () => {
                await fetch("/api/logout", { method: "POST" });
                localStorage.removeItem("userId");
                setUserId(null);
                setUsername(null);
                window.location.href = "/";
              }}
              title="サインアウト"
              className="ml-4 px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-red-200 hover:text-red-700 transition border border-gray-300 dark:border-gray-600 flex items-center"
              type="button"
            >
              <FaSignOutAlt size={20} />
            </button>
          </>
        ) : (
          <>
            <Link
              href="/login"
              title="ログイン"
              className={`hover:text-green-600 transition ${
                pathname === "/login"
                  ? "text-green-600 border-b-2 border-green-600 pb-1"
                  : "text-gray-700 dark:text-gray-200"
              } flex flex-col items-center group`}
            >
              <FaSignInAlt size={22} />
            </Link>
            <Link
              href="/register"
              title="新規登録"
              className={`hover:text-orange-600 transition ${
                pathname === "/register"
                  ? "text-orange-600 border-b-2 border-orange-600 pb-1"
                  : "text-gray-700 dark:text-gray-200"
              } flex flex-col items-center group`}
            >
              <FaUserPlus size={22} />
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
