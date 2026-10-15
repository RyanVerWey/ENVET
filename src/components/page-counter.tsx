"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export function PageCounter({ enabled }: { enabled: boolean }) {
  const path = usePathname();
  const last = useRef<string | null>(null);
  useEffect(() => {
    if (
      !enabled ||
      last.current === path ||
      /^\/(forms|team|account|auth|api)(\/|$)/.test(path)
    )
      return;
    last.current = path;
    void fetch("/api/analytics/page", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path }),
      keepalive: true,
    }).catch(() => {});
  }, [enabled, path]);
  return null;
}
