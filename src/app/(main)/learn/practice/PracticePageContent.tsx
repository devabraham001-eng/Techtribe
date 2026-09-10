"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Settings } from "lucide-react";
import { PracticeBoard } from "@/components/practice/PracticeBoard";
import { XPWidget } from "@/components/practice/XPWidget";
import { Leaderboard } from "@/components/practice/Leaderboard";
import type { Workload } from "@/types/blog";

export function PracticePageContent() {
  const [workloads, setWorkloads] = React.useState<Workload[]>([]);
  const [passedIds, setPassedIds] = React.useState<Set<string>>(new Set());
  const [xp, setXp] = React.useState<{ total_xp: number; level: number; streak_days: number } | null>(null);
  const [isStaff, setIsStaff] = React.useState(false);
  const [leaders, setLeaders] = React.useState<{ userId: string; totalXp: number; level: number; streakDays: number; authorName?: string }[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    Promise.all([
      fetch("/api/practice/workloads").then((r) => r.json()).catch(() => []),
      fetch("/api/practice/progress").then((r) => r.json()).catch(() => ({ passedIds: [] })),
      fetch("/api/practice/xp").then((r) => (r.ok ? r.json() : null)).catch(() => null),
      fetch("/api/practice/leaderboard").then((r) => r.json()).catch(() => []),
      fetch("/api/author/profile").then((r) => (r.ok ? r.json() : null)).catch(() => null),
    ])
      .then(([workloadsData, progressData, xpData, leaderboardData, profileData]) => {
        setWorkloads(Array.isArray(workloadsData) ? workloadsData : []);
        setPassedIds(new Set(progressData?.passedIds ?? []));
        if (xpData && typeof xpData.total_xp === "number") setXp(xpData);
        if (profileData?.is_staff) setIsStaff(true);
        if (Array.isArray(leaderboardData)) {
          setLeaders(
            leaderboardData.map((e: { userId?: string; user_id?: string; totalXp?: number; total_xp?: number; level: number; streakDays?: number; streak_days?: number; authorName?: string }) => ({
              userId: e.userId ?? e.user_id ?? "",
              totalXp: e.totalXp ?? e.total_xp ?? 0,
              level: e.level,
              streakDays: e.streakDays ?? e.streak_days ?? 0,
              authorName: e.authorName,
            }))
          );
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-6 lg:pt-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl p-6 animate-pulse"
              style={{ background: "#1c1c1e", border: "1px solid #38383a" }}
            >
              <div className="h-8 w-8 rounded-lg mb-3" style={{ background: "#38383a" }} />
              <div className="h-4 w-3/4 rounded mb-2" style={{ background: "#38383a" }} />
              <div className="h-3 w-full rounded mb-1" style={{ background: "#38383a" }} />
              <div className="h-3 w-2/3 rounded" style={{ background: "#38383a" }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-6 lg:pt-8">
      <Link
        href="/learn"
        className="mb-6 inline-flex items-center gap-1.5 text-sm hover:opacity-70 transition-opacity"
        style={{ color: "#98989d" }}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Learn
      </Link>

      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1
            className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-2"
            style={{ color: "#f5f5f7" }}
          >
            Practice
          </h1>
          <p className="text-sm sm:text-base max-w-lg" style={{ color: "#98989d" }}>
            Real-world workloads. Solve them in-browser. Earn XP and build your proof of work.
          </p>
        </div>
        {isStaff && (
          <Link
            href="/admin/practice"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all hover:opacity-90"
            style={{ background: "#1c1c1e", color: "#D0F201", border: "1px solid #38383a" }}
          >
            <Settings className="h-3.5 w-3.5" />
            Manage workloads
          </Link>
        )}
      </header>

      <PracticeBoard workloads={workloads} passedIds={passedIds} />

      <div className="grid gap-6 md:grid-cols-2 mt-10 pb-16">
        <div>
          <h2 className="font-heading text-lg font-semibold mb-4" style={{ color: "#f5f5f7" }}>
            Your Rank
          </h2>
          {xp ? (
            <XPWidget totalXp={xp.total_xp} streakDays={xp.streak_days} level={xp.level} />
          ) : (
            <div className="rounded-2xl p-6 text-center text-sm" style={{ background: "#1c1c1e", border: "1px solid rgba(245,245,247,0.08)", color: "#636366" }}>
              Solve your first workload to earn XP and appear on the leaderboard.
            </div>
          )}
        </div>
        <div>
          <Leaderboard entries={leaders} />
        </div>
      </div>
    </div>
  );
}
