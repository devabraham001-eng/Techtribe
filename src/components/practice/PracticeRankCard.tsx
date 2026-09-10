"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { XPWidget } from "./XPWidget";

export function PracticeRankCard() {
  const [xp, setXp] = React.useState<{ total_xp: number; level: number; streak_days: number } | null>(null);

  React.useEffect(() => {
    fetch("/api/practice/xp")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && typeof data.total_xp === "number") setXp(data);
      })
      .catch(() => {});
  }, []);

  if (!xp || xp.total_xp === 0) return null;

  return (
    <div className="space-y-3">
      <XPWidget totalXp={xp.total_xp} streakDays={xp.streak_days} level={xp.level} />
      <Link
        href="/learn/practice"
        className="flex items-center justify-center gap-1.5 text-xs font-medium hover:opacity-70 transition-opacity"
        style={{ color: "#D0F201" }}
      >
        Keep practicing
        <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  );
}
