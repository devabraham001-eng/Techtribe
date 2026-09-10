"use client";

import * as React from "react";
import { Trophy, Flame, Zap, Crown, Medal, Award } from "lucide-react";

interface LeaderboardEntry {
  userId: string;
  totalXp: number;
  level: number;
  streakDays: number;
  authorName?: string;
}

function getLevelName(level: number): string {
  if (level <= 1) return "Intern";
  if (level <= 3) return "Junior";
  if (level <= 5) return "Mid-Level";
  if (level <= 7) return "Senior";
  if (level <= 9) return "Lead";
  return "Staff";
}

function getRankIcon(index: number) {
  if (index === 0) return <Crown className="h-4 w-4" style={{ color: "#D0F201" }} />;
  if (index === 1) return <Medal className="h-4 w-4" style={{ color: "#98989d" }} />;
  if (index === 2) return <Award className="h-4 w-4" style={{ color: "#ff9f0a" }} />;
  return <span className="text-xs font-mono" style={{ color: "#636366" }}>{index + 1}</span>;
}

export function Leaderboard({ entries }: { entries: LeaderboardEntry[] }) {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "#1c1c1e",
        border: "1px solid rgba(245,245,247,0.08)",
      }}
    >
      <div className="px-5 py-4 border-b" style={{ borderColor: "#38383a" }}>
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4" style={{ color: "#D0F201" }} />
          <h3 className="text-sm font-semibold" style={{ color: "#f5f5f7" }}>
            Leaderboard
          </h3>
        </div>
      </div>

      <div className="divide-y" style={{ borderColor: "#38383a" }}>
        {entries.map((entry, i) => (
          <div
            key={entry.userId}
            className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-white/[0.02]"
          >
            <div className="flex-shrink-0 w-6 flex justify-center">
              {getRankIcon(i)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate" style={{ color: "#f5f5f7" }}>
                {entry.authorName ?? "Anonymous"}
              </div>
              <div className="text-[10px]" style={{ color: "#636366" }}>
                L{entry.level} {getLevelName(entry.level)}
              </div>
            </div>

            <div className="flex items-center gap-3 text-[10px]" style={{ color: "#98989d" }}>
              <span className="flex items-center gap-1">
                <Flame className="h-3 w-3" style={{ color: "#ff9f0a" }} />
                {entry.streakDays}d
              </span>
              <span className="flex items-center gap-1 font-semibold" style={{ color: "#D0F201" }}>
                <Zap className="h-3 w-3" />
                {entry.totalXp.toLocaleString()}
              </span>
            </div>
          </div>
        ))}

        {entries.length === 0 && (
          <div className="px-5 py-8 text-center text-xs" style={{ color: "#636366" }}>
            No rankings yet. Be the first to earn XP.
          </div>
        )}
      </div>
    </div>
  );
}
