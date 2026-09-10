"use client";

import * as React from "react";
import Link from "next/link";
import { Code2, Terminal, Database, Globe, Zap, ArrowRight, CheckCircle2, Clock } from "lucide-react";
import type { Workload } from "@/types/blog";

const categoryConfig: Record<string, { label: string; icon: typeof Code2; color: string }> = {
  javascript: { label: "JavaScript", icon: Code2, color: "#D0F201" },
  python: { label: "Python", icon: Terminal, color: "#30d158" },
  linux: { label: "Linux & Bash", icon: Terminal, color: "#ff9f0a" },
  sql: { label: "SQL", icon: Database, color: "#64d2ff" },
  web: { label: "Web Dev", icon: Globe, color: "#bf5af2" },
};

const difficultyConfig: Record<string, { label: string; color: string }> = {
  beginner: { label: "Beginner", color: "#30d158" },
  intermediate: { label: "Intermediate", color: "#ff9f0a" },
  advanced: { label: "Advanced", color: "#ff453a" },
};

export function PracticeBoard({
  workloads,
  passedIds,
}: {
  workloads: Workload[];
  passedIds: Set<string>;
}) {
  const [activeCategory, setActiveCategory] = React.useState<string | null>(null);

  const filtered = activeCategory
    ? workloads.filter((w) => w.category === activeCategory)
    : workloads;

  const categories = Object.keys(categoryConfig);

  return (
    <div>
      {/* Category filters */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <button
          type="button"
          onClick={() => setActiveCategory(null)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
            !activeCategory
              ? "bg-primary text-primary-foreground"
              : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-foreground/20"
          }`}
        >
          All
        </button>
        {categories.map((cat) => {
          const config = categoryConfig[cat];
          const Icon = config.icon;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-foreground/20"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="whitespace-nowrap">{config.label}</span>
            </button>
          );
        })}
      </div>

      {/* Workload cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((workload) => {
          const cat = categoryConfig[workload.category];
          const diff = difficultyConfig[workload.difficulty];
          const passed = passedIds.has(workload.id);
          const Icon = cat.icon;

          return (
            <Link
              key={workload.id}
              href={`/learn/practice/${workload.id}`}
              className="group relative rounded-2xl p-5 sm:p-6 transition-all hover:-translate-y-1"
              style={{
                background: "#1c1c1e",
                border: passed ? "1px solid rgba(48,209,88,0.3)" : "1px solid rgba(245,245,247,0.08)",
              }}
            >
              {passed && (
                <div className="absolute top-3 right-3">
                  <CheckCircle2 className="h-5 w-5" style={{ color: "#30d158" }} />
                </div>
              )}

              <div className="flex items-center gap-2 mb-3">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-lg"
                  style={{ background: `${cat.color}15` }}
                >
                  <Icon className="h-4 w-4" style={{ color: cat.color }} />
                </div>
                <span
                  className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
                  style={{ background: `${diff.color}15`, color: diff.color }}
                >
                  {diff.label}
                </span>
              </div>

              <h3
                className="font-heading font-semibold text-base mb-2 group-hover:text-primary transition-colors"
                style={{ color: "#f5f5f7" }}
              >
                {workload.title}
              </h3>

              <p
                className="text-xs leading-relaxed mb-4 line-clamp-2"
                style={{ color: "#98989d" }}
              >
                {workload.brief}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-[10px]" style={{ color: "#636366" }}>
                  <span className="flex items-center gap-1">
                    <Zap className="h-3 w-3" style={{ color: "#D0F201" }} />
                    {workload.xpReward} XP
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    ~{Math.ceil(workload.brief.length / 200)} min
                  </span>
                </div>
                <ArrowRight
                  className="h-4 w-4 transition-transform group-hover:translate-x-1"
                  style={{ color: "#D0F201" }}
                />
              </div>
            </Link>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <p className="text-sm" style={{ color: "#98989d" }}>No workloads available yet.</p>
        </div>
      )}
    </div>
  );
}
