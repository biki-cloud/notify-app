"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function RequireLogin({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      router.replace("/login");
    } else {
      setChecked(true);
    }
  }, [router]);

  if (!checked) return null;
  return <>{children}</>;
}
