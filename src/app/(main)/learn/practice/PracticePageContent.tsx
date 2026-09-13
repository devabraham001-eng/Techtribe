"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  Clock,
  Code2,
  Database,
  Globe,
  Search,
  Settings,
  SlidersHorizontal,
  SquareTerminal,
  Terminal,
  Zap,
} from "lucide-react";
import { XPWidget } from "@/components/practice/XPWidget";
import { Leaderboard } from "@/components/practice/Leaderboard";
import { Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import type { Workload } from "@/types/blog";

const CATEGORY_META: Record<Workload["category"], { label: string; Icon: LucideIcon }> = {
  javascript: { label: "JavaScript", Icon: Code2 },
  python: { label: "Python", Icon: Terminal },
  linux: { label: "Linux", Icon: SquareTerminal },
  sql: { label: "SQL", Icon: Database },
  web: { label: "Web", Icon: Globe },
};

const DIFFICULTIES: Workload["difficulty"][] = ["beginner", "intermediate", "advanced"];
const CATEGORIES = Object.keys(CATEGORY_META) as Workload["category"][];

const DIFFICULTY_STYLE: Record<Workload["difficulty"], string> = {
  beginner: "bg-emerald-500/10 text-emerald-500",
  intermediate: "bg-amber-500/10 text-amber-500",
  advanced: "bg-red-500/10 text-red-500",
};

function estimatedMinutes(brief: string): number {
  return Math.max(1, Math.ceil(brief.length / 200));
}

function FilterGroup({
  title,
  open,
  onToggle,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="pt-3 first:pt-2">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full cursor-pointer items-center justify-between py-1 text-xs font-bold text-foreground"
      >
        <span>{title}</span>
        <ChevronDown
          className={cn("h-3.5 w-3.5 text-muted-foreground transition-transform", !open && "-rotate-90")}
          aria-hidden="true"
        />
      </button>
      {open && <div className="mt-2 space-y-2 pl-0.5">{children}</div>}
    </div>
  );
}

function FilterCheck({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center space-x-2 transition-colors",
        checked ? "font-medium text-foreground" : "text-muted-foreground hover:text-foreground"
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-3.5 w-3.5 rounded border-border bg-transparent accent-primary"
      />
      <span>{label}</span>
    </label>
  );
}

function CategoryArt({ category }: { category: Workload["category"] }) {
  const { Icon } = CATEGORY_META[category];
  return (
    <div className="relative flex items-center justify-center" aria-hidden="true">
      <div className="absolute h-24 w-24 rounded-full border border-primary/20" />
      <div className="absolute h-16 w-16 rounded-2xl bg-primary/10" />
      <Icon className="relative h-10 w-10 text-primary" strokeWidth={1.75} />
    </div>
  );
}

function WorkloadCard({ workload, completed }: { workload: Workload; completed: boolean }) {
  const { label } = CATEGORY_META[workload.category];
  return (
    <Link
      href={`/learn/practice/${workload.id}`}
      aria-label={`${workload.title}${completed ? " (completed)" : ""}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-shadow hover:shadow-lg"
    >
      <div className="flex h-44 items-center justify-center border-b border-border bg-gradient-to-br from-primary/[0.07] via-secondary to-card p-4">
        <CategoryArt category={workload.category} />
      </div>
      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          <div className="mb-2.5 flex flex-wrap items-center gap-1.5">
            <span
              className={cn(
                "rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                DIFFICULTY_STYLE[workload.difficulty]
              )}
            >
              {workload.difficulty}
            </span>
            <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
              {label}
            </span>
            {completed && (
              <span className="inline-flex items-center gap-1 rounded bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
                <Check className="h-3 w-3" strokeWidth={3} aria-hidden="true" /> Done
              </span>
            )}
          </div>
          <h3 className="mb-2 text-[15px] font-bold leading-snug text-foreground transition-colors group-hover:text-primary">
            {workload.title}
          </h3>
          <p className="mb-4 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {workload.brief}
          </p>
        </div>
        <div className="flex items-center space-x-2 border-t border-border pt-3 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" aria-hidden="true" />
            {estimatedMinutes(workload.brief)} min
          </span>
          <span aria-hidden="true">•</span>
          <span className="flex items-center gap-1">
            <Zap className="h-3 w-3 text-primary" aria-hidden="true" />
            {workload.xpReward} XP
          </span>
          <span aria-hidden="true">•</span>
          <span className="capitalize">{workload.difficulty}</span>
        </div>
      </div>
    </Link>
  );
}

export function PracticePageContent() {
  const [workloads, setWorkloads] = React.useState<Workload[]>([]);
  const [passedIds, setPassedIds] = React.useState<Set<string>>(new Set());
  const [xp, setXp] = React.useState<{ total_xp: number; level: number; streak_days: number } | null>(null);
  const [isStaff, setIsStaff] = React.useState(false);
  const [leaders, setLeaders] = React.useState<{ userId: string; totalXp: number; level: number; streakDays: number; authorName?: string }[]>([]);
  const [loading, setLoading] = React.useState(true);

  const [search, setSearch] = React.useState("");
  const [selectedDifficulties, setSelectedDifficulties] = React.useState<Set<Workload["difficulty"]>>(new Set());
  const [selectedCategories, setSelectedCategories] = React.useState<Set<Workload["category"]>>(new Set());
  const [selectedStatus, setSelectedStatus] = React.useState<Set<"completed" | "todo">>(new Set());
  const [filtersOpen, setFiltersOpen] = React.useState(false);
  const [openGroups, setOpenGroups] = React.useState<Record<string, boolean>>({
    skill: true,
    category: true,
    status: true,
  });

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

  function toggleInSet<T>(set: Set<T>, value: T): Set<T> {
    const next = new Set(set);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    return next;
  }

  function resetFilters() {
    setSearch("");
    setSelectedDifficulties(new Set());
    setSelectedCategories(new Set());
    setSelectedStatus(new Set());
  }

  const normalizedSearch = search.trim().toLowerCase();
  const filtered = workloads.filter((workload) => {
    if (
      normalizedSearch &&
      !`${workload.title} ${workload.brief}`.toLowerCase().includes(normalizedSearch)
    ) {
      return false;
    }
    if (selectedDifficulties.size > 0 && !selectedDifficulties.has(workload.difficulty)) return false;
    if (selectedCategories.size > 0 && !selectedCategories.has(workload.category)) return false;
    if (selectedStatus.size > 0) {
      const done = passedIds.has(workload.id);
      if (selectedStatus.has("completed") && !selectedStatus.has("todo") && !done) return false;
      if (selectedStatus.has("todo") && !selectedStatus.has("completed") && done) return false;
    }
    return true;
  });

  const activeFilterCount =
    selectedDifficulties.size + selectedCategories.size + selectedStatus.size + (normalizedSearch ? 1 : 0);

  if (loading) {
    return (
      <div className="px-4 pt-6 sm:px-6 lg:px-8 lg:pt-8">
        <div className="flex gap-8">
          <div className="hidden w-64 shrink-0 space-y-3 lg:block">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-4 w-3/4 animate-pulse rounded bg-secondary" />
            ))}
          </div>
          <div className="grid flex-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse overflow-hidden rounded-lg border border-border bg-card">
                <div className="h-44 bg-secondary" />
                <div className="space-y-2 p-5">
                  <div className="h-4 w-16 rounded bg-secondary" />
                  <div className="h-4 w-3/4 rounded bg-secondary" />
                  <div className="h-3 w-full rounded bg-secondary" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-6 lg:pt-8">
      <div className="px-4 sm:px-6 lg:px-8">
        <Link
          href="/learn"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-opacity hover:opacity-70"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to Learn
        </Link>

        <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="mb-2 font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
              Practice
            </h1>
            <p className="max-w-lg text-sm text-muted-foreground sm:text-base">
              Real-world workloads. Solve them in-browser. Earn XP and build your proof of work.
            </p>
          </div>
          {isStaff && (
            <Link
              href="/admin/practice"
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold text-primary transition-all hover:opacity-90"
            >
              <Settings className="h-3.5 w-3.5" aria-hidden="true" />
              Manage workloads
            </Link>
          )}
        </header>
      </div>

      <div className="flex flex-col gap-8 px-4 sm:px-6 lg:flex-row lg:gap-0 lg:px-0">
        <aside aria-label="Workload filters" className={cn(filtersOpen ? "block" : "hidden", "w-full shrink-0 lg:block lg:w-64 lg:shrink-0 lg:self-start lg:overflow-y-auto lg:border-r lg:border-border lg:px-6 lg:py-2 lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)]")}>
          <div className="relative mb-3">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5">
              <Search className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
            </span>
            <label htmlFor="workload-search" className="sr-only">
              Search workloads
            </label>
            <input
              id="workload-search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search"
              className="w-full rounded border border-border bg-card py-1.5 pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary/60 focus:outline-none focus:ring-1 focus:ring-primary/60"
            />
          </div>

          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <button
                type="button"
                onClick={resetFilters}
                className="flex items-center gap-1 rounded border border-border px-2 py-0.5 text-[11px] text-foreground transition-colors hover:bg-card"
              >
                <span className={cn("h-1.5 w-1.5 rounded-full", activeFilterCount > 0 ? "bg-primary" : "bg-muted-foreground")} />
                {activeFilterCount > 0 ? `${activeFilterCount} selected` : "All"}
              </button>
              <button
                type="button"
                onClick={resetFilters}
                className="px-2 py-0.5 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
              >
                Reset
              </button>
            </div>
            <button
              type="button"
              onClick={() => setFiltersOpen((prev) => !prev)}
              aria-expanded={filtersOpen}
              className="flex items-center gap-1 rounded border border-border px-2 py-0.5 text-[11px] text-muted-foreground transition-colors hover:text-foreground lg:hidden"
            >
              <SlidersHorizontal className="h-3 w-3" aria-hidden="true" />
              Filters
            </button>
          </div>

          <div className="space-y-4 text-xs text-muted-foreground divide-y divide-border">
            <FilterGroup
              title="Skill level"
              open={openGroups.skill}
              onToggle={() => setOpenGroups((prev) => ({ ...prev, skill: !prev.skill }))}
            >
              {DIFFICULTIES.map((difficulty) => (
                <FilterCheck
                  key={difficulty}
                  label={difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                  checked={selectedDifficulties.has(difficulty)}
                  onChange={() => setSelectedDifficulties((prev) => toggleInSet(prev, difficulty))}
                />
              ))}
            </FilterGroup>
            <FilterGroup
              title="Category"
              open={openGroups.category}
              onToggle={() => setOpenGroups((prev) => ({ ...prev, category: !prev.category }))}
            >
              {CATEGORIES.map((category) => (
                <FilterCheck
                  key={category}
                  label={CATEGORY_META[category].label}
                  checked={selectedCategories.has(category)}
                  onChange={() => setSelectedCategories((prev) => toggleInSet(prev, category))}
                />
              ))}
            </FilterGroup>
            <FilterGroup
              title="Status"
              open={openGroups.status}
              onToggle={() => setOpenGroups((prev) => ({ ...prev, status: !prev.status }))}
            >
              <FilterCheck
                label="Completed"
                checked={selectedStatus.has("completed")}
                onChange={() => setSelectedStatus((prev) => toggleInSet(prev, "completed"))}
              />
              <FilterCheck
                label="To do"
                checked={selectedStatus.has("todo")}
                onChange={() => setSelectedStatus((prev) => toggleInSet(prev, "todo"))}
              />
            </FilterGroup>
          </div>
        </aside>

        <section aria-label="Workloads" className="min-w-0 flex-1 pb-4 lg:px-8 lg:py-2">
          <p className="sr-only" aria-live="polite">
            {filtered.length} {filtered.length === 1 ? "workload" : "workloads"} shown
          </p>
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-card px-6 py-16 text-center">
              <p className="text-sm font-semibold text-foreground">No workloads match your filters</p>
              <p className="mt-1 text-xs text-muted-foreground">Try a different search or clear the filters.</p>
              <button
                type="button"
                onClick={resetFilters}
                className="mt-4 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition hover:bg-primary-dark"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <Reveal direction="up" duration={0.4} delay={0}>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filtered.map((workload) => (
                  <WorkloadCard
                    key={workload.id}
                    workload={workload}
                    completed={passedIds.has(workload.id)}
                  />
                ))}
              </div>
            </Reveal>
          )}
        </section>
      </div>

      <div className="px-4 sm:px-6 lg:px-8">
        <div className="mt-10 grid gap-6 pb-16 md:grid-cols-2">
        <div>
          <h2 className="mb-4 font-heading text-lg font-semibold text-foreground">
            Your Rank
          </h2>
          {xp ? (
            <XPWidget totalXp={xp.total_xp} streakDays={xp.streak_days} level={xp.level} />
          ) : (
            <div className="rounded-2xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
              Solve your first workload to earn XP and appear on the leaderboard.
            </div>
          )}
        </div>
        <div>
          <Leaderboard entries={leaders} />
        </div>
        </div>
      </div>

    </div>
  );
}
