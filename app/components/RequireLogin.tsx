"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RequireLogin() {
  const router = useRouter();
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      router.replace("/login");
    }
  }, [router]);
  return null;
}
