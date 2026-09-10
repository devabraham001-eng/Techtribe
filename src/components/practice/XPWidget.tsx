"use client";

import * as React from "react";
import { Zap, Flame, Trophy, TrendingUp } from "lucide-react";

const LEVEL_THRESHOLDS = [0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500, 5500];

function getLevelName(level: number): string {
  if (level <= 1) return "Intern";
  if (level <= 3) return "Junior";
  if (level <= 5) return "Mid-Level";
  if (level <= 7) return "Senior";
  if (level <= 9) return "Lead";
  return "Staff";
}

function getLevelProgress(totalXp: number): number {
  const currentLevel = LEVEL_THRESHOLDS.findIndex((t, i) =>
    i < LEVEL_THRESHOLDS.length - 1 ? totalXp < LEVEL_THRESHOLDS[i + 1] : true
  );
  const threshold = LEVEL_THRESHOLDS[currentLevel] ?? 0;
  const next = LEVEL_THRESHOLDS[currentLevel + 1] ?? LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1] + 1000;
  return Math.round(((totalXp - threshold) / (next - threshold)) * 100);
}

export function XPWidget({ totalXp, streakDays, level }: { totalXp: number; streakDays: number; level: number }) {
  const progress = getLevelProgress(totalXp);
  const levelName = getLevelName(level);

  return (
    <div
      className="rounded-2xl p-5 sm:p-6"
      style={{
        background: "#1c1c1e",
        border: "1px solid rgba(245,245,247,0.08)",
      }}
    >
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="h-4 w-4" style={{ color: "#D0F201" }} />
        <h3 className="text-sm font-semibold" style={{ color: "#f5f5f7" }}>
          Practice Rank
        </h3>
      </div>

      <div className="flex items-end gap-3 mb-4">
        <div
          className="text-3xl font-heading font-bold"
          style={{ color: "#D0F201" }}
        >
          L{level}
        </div>
        <div>
          <div className="text-xs font-medium" style={{ color: "#f5f5f7" }}>
            {levelName}
          </div>
          <div className="text-[10px]" style={{ color: "#636366" }}>
            {totalXp.toLocaleString()} XP
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between text-[10px] mb-1" style={{ color: "#636366" }}>
          <span>{levelName}</span>
          <span>{progress}%</span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#38383a" }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              background: "#D0F201",
              width: `${progress}%`,
            }}
          />
        </div>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-4 text-[11px]" style={{ color: "#98989d" }}>
        <span className="flex items-center gap-1">
          <Zap className="h-3 w-3" style={{ color: "#D0F201" }} />
          {totalXp} XP
        </span>
        <span className="flex items-center gap-1">
          <Flame className="h-3 w-3" style={{ color: "#ff9f0a" }} />
          {streakDays} day{streakDays !== 1 ? "s" : ""}
        </span>
      </div>
    </div>
  );
}
