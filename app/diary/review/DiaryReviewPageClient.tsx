"use client";
import { useEffect, useState } from "react";
import DiaryReviewPage from "./DiaryReviewPage";
import RequireLogin from "../../components/RequireLogin";

export default function DiaryReviewPageClient() {
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    const id = localStorage.getItem("userId");
    if (id) setUserId(Number(id));
  }, []);

  return (
    <>
      <RequireLogin />
      {userId && <DiaryReviewPage userId={userId} />}
    </>
  );
}
