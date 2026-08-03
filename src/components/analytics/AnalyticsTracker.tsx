"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function getVisitorId(): string {
  try {
    let id = localStorage.getItem("techtribe_visitor_id");
    if (!id) {
      id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `v-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
      localStorage.setItem("techtribe_visitor_id", id);
    }
    return id;
  } catch {
    return "";
  }
}

export function AnalyticsTracker() {
  const pathname = usePathname();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    if (pathname === lastPath.current) return;
    lastPath.current = pathname;

    const key = `techtribe_tracked_${pathname}`;
    try {
      if (localStorage.getItem(key) === todayStr()) return;
    } catch {
      // Storage unavailable - rely on the server-side daily guard
    }

    fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: pathname, visitorId: getVisitorId() }),
    })
      .then((res) => {
        if (res.ok) {
          try {
            localStorage.setItem(key, todayStr());
          } catch {
            // Best-effort only
          }
        }
      })
      .catch(() => {});
  }, [pathname]);

  return null;
}
