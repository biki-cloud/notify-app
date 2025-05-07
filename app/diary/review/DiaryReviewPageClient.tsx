"use client";
import { useEffect, useState } from "react";
import DiaryReviewPage from "./DiaryReviewPage";

export default function DiaryReviewPageClient() {
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    const id = localStorage.getItem("userId");
    if (id) setUserId(Number(id));
  }, []);

  if (!userId) return <div>ログインしてください</div>;

  return <DiaryReviewPage userId={userId} />;
}
