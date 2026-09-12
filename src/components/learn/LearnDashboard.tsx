"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn, getInitials } from "@/lib/utils";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Briefcase,
  Cloud,
  Code2,
  Database,
  FileText,
  Flame,
  Globe,
  Play,
  Search,
  Server,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Terminal,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

interface Mentor {
  id: string;
  name: string;
  avatarUrl: string | null;
  bio: string | null;
  status: string | null;
}

interface TrackProgress {
  id: string;
  title: string;
  slug: string;
  category: string | null;
  coverImageUrl: string | null;
  totalLessons: number;
  completedLessons: number;
}

interface ContinueWatchingItem {
  id: string;
  lessonTitle: string;
  trackTitle: string;
  trackSlug: string;
  trackCategory: string | null;
  coverImageUrl: string | null;
}

interface ActivityData {
  period: string;
  count: number;
}

interface RecentLesson {
  id: string;
  completedAt: string;
  lesson: {
    id: string;
    title: string;
    isProject: boolean;
    track: {
      id: string;
      title: string;
      slug: string;
      category: string | null;
      coverImageUrl: string | null;
    };
  };
}

interface LearnDashboardProps {
  user: {
    name: string;
    avatarUrl: string | null;
    firstName: string;
  };
  stats: {
    completedLessons: number;
    totalLessons: number;
    projectsSubmitted: number;
    challengesPassed: number;
    streak: number;
  };
  trackProgress: TrackProgress[];
  continueWatching: ContinueWatchingItem[];
  activityData: ActivityData[];
  recentLessons: RecentLesson[];
  mentors: Mentor[];
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function trackIconFor(track: TrackProgress, index: number): LucideIcon {
  const haystack = `${track.title} ${track.category ?? ""}`.toLowerCase();
  if (/(ai|machine learning|\bml\b|agent|llm)/.test(haystack)) return Sparkles;
  if (/(data|sql|database|postgres)/.test(haystack)) return Database;
  if (/(web|frontend|react|next|css|javascript|typescript)/.test(haystack)) return Globe;
  if (/(mobile|flutter|android|ios|native)/.test(haystack)) return Smartphone;
  if (/(devops|docker|infra|linux|server|backend|deploy)/.test(haystack)) return Server;
  if (/(secur|cyber)/.test(haystack)) return ShieldCheck;
  if (/(cloud|aws|azure|gcp)/.test(haystack)) return Cloud;
  if (/(code|python|programming|git)/.test(haystack)) return Code2;
  const fallbacks: LucideIcon[] = [Code2, Terminal, BookOpen];
  return fallbacks[index % fallbacks.length];
}

const LESSON_ICON_FALLBACKS: LucideIcon[] = [BookOpen, FileText, Play, Code2, Terminal];

function lessonIconFor(lesson: RecentLesson["lesson"], index: number): LucideIcon {
  if (lesson.isProject) return Briefcase;
  return LESSON_ICON_FALLBACKS[index % LESSON_ICON_FALLBACKS.length];
}

function formatShortDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/* ---------------- Header: search + XP/streak + avatar ---------------- */

function XpStreakPill({ streak }: { streak: number }) {
  const [xp, setXp] = React.useState<number | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    fetch("/api/practice/xp")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { total_xp?: number } | null) => {
        if (!cancelled && data && typeof data.total_xp === "number") {
          setXp(data.total_xp);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div
      className="flex items-center gap-2.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs sm:gap-3 sm:px-3.5"
      aria-label={`Practice XP and ${streak}-day streak`}
    >
      <span className="flex items-center gap-1.5 font-medium">
        <span
          className="inline-block h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_8px_rgba(208,242,1,0.8)]"
          aria-hidden="true"
        />
        <span className="font-semibold text-foreground">{xp === null ? "···" : xp.toLocaleString("en-US")}</span>
        <span className="text-[11px] text-muted-foreground">XP</span>
      </span>
      <span className="h-3 w-px bg-border" aria-hidden="true" />
      <span className="flex items-center gap-1.5 font-medium">
        <Flame className="h-3.5 w-3.5 text-primary" fill="currentColor" aria-hidden="true" />
        <span className="font-semibold text-foreground">{streak}</span>
        <span className="text-[11px] text-muted-foreground">{streak === 1 ? "day" : "days"}</span>
      </span>
    </div>
  );
}

function LearnHeader({
  user,
  streak,
  query,
  onQueryChange,
}: {
  user: LearnDashboardProps["user"];
  streak: number;
  query: string;
  onQueryChange: (value: string) => void;
}) {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:h-20 sm:px-6">
        <form role="search" className="relative w-40 sm:w-72 lg:w-96" onSubmit={(e) => e.preventDefault()}>
          <label htmlFor="learn-search" className="sr-only">
            Search for a course, lesson, etc.
          </label>
          <Search
            className="pointer-events-none absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground sm:left-3.5"
            aria-hidden="true"
          />
          <input
            id="learn-search"
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search for a course, lesson, etc."
            aria-controls="learn-lesson-list"
            className="w-full bg-transparent py-2 pl-7 pr-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none sm:pl-10 sm:pr-4"
          />
        </form>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <XpStreakPill streak={streak} />
          <Avatar className="ml-1 h-8 w-8 border border-border">
            <AvatarImage src={user.avatarUrl ?? ""} alt={user.name} />
            <AvatarFallback className="text-xs">{getInitials(user.name)}</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}

/* ---------------- Hero: greeting + progress + topic cards ---------------- */

type TopicVariant = "light" | "primary" | "dark";

function TopicCard({
  index,
  title,
  slug,
  icon: Icon,
  variant,
}: {
  index: number;
  title: string;
  slug: string;
  icon: LucideIcon;
  variant: TopicVariant;
}) {
  return (
    <Link
      href={`/learn/${slug}`}
      aria-label={`Open path: ${title}`}
      className={cn(
        "group flex h-48 w-36 shrink-0 snap-start flex-col justify-between overflow-hidden rounded-2xl p-3.5 shadow-lg transition-transform hover:-translate-y-0.5",
        variant === "primary" && "bg-primary text-primary-foreground",
        variant === "light" && "bg-foreground text-background",
        variant === "dark" && "border border-border bg-secondary text-foreground"
      )}
    >
      <div>
        <span className="text-[10px] font-bold tracking-wider opacity-60">0{index + 1}</span>
        <h4 className="mt-1 line-clamp-3 text-xs font-bold leading-snug">{title}</h4>
      </div>
      <div className="flex justify-center pb-1">
        <Icon className="h-16 w-16 opacity-90" strokeWidth={1.5} aria-hidden="true" />
      </div>
    </Link>
  );
}

function HeroBanner({
  user,
  greeting,
  heroNumber,
  heroNoun,
  heroSuffix,
  heroTracks,
}: {
  user: LearnDashboardProps["user"];
  greeting: string;
  heroNumber: number | null;
  heroNoun: string;
  heroSuffix: string | null;
  heroTracks: TrackProgress[];
}) {
  const variants: TopicVariant[] = ["light", "primary", "dark"];

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      aria-labelledby="learn-hero-heading"
      className="relative flex flex-col gap-6 overflow-hidden rounded-[28px] border border-primary/20 bg-gradient-to-br from-primary/[0.12] via-card to-card p-6 sm:p-7 lg:flex-row lg:items-stretch lg:justify-between"
    >
      <div className="z-10 flex max-w-sm flex-col justify-between gap-6">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            {greeting}, {user.firstName}!
          </p>
          <h1
            id="learn-hero-heading"
            className="mt-3 font-heading text-3xl font-bold leading-snug tracking-tight text-foreground"
          >
            {heroNumber !== null && heroSuffix ? (
              <>
                You&apos;ve completed
                <br />
                {heroNumber} {heroNoun}
                <br />
                {heroSuffix}
              </>
            ) : (
              <>
                Kickstart your
                <br />
                learning journey
                <br />
                today
              </>
            )}
          </h1>
        </div>
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-md transition hover:opacity-90"
          >
            View Progress
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
      <div className="z-10 flex items-center gap-3.5 overflow-x-auto pb-2 lg:pb-0" aria-label="Your top paths">
        {heroTracks.length > 0 ? (
          heroTracks.map((track, i) => (
            <TopicCard
              key={track.id}
              index={i}
              title={track.title}
              slug={track.slug}
              icon={trackIconFor(track, i)}
              variant={variants[i % variants.length]}
            />
          ))
        ) : (
          <Link
            href="/dashboard"
            aria-label="Explore learning paths"
            className="flex h-48 w-36 shrink-0 snap-start flex-col justify-between overflow-hidden rounded-2xl bg-primary p-3.5 text-primary-foreground shadow-lg transition-transform hover:-translate-y-0.5"
          >
            <div>
              <span className="text-[10px] font-bold tracking-wider opacity-60">01</span>
              <h4 className="mt-1 text-xs font-bold leading-snug">
                Explore
                <br />
                paths
              </h4>
            </div>
            <div className="flex justify-center pb-1">
              <BookOpen className="h-16 w-16 opacity-90" strokeWidth={1.5} aria-hidden="true" />
            </div>
          </Link>
        )}
      </div>
    </motion.section>
  );
}

/* ---------------- Module: focus path + lesson rows ---------------- */

function LessonItem({
  icon: Icon,
  title,
  description,
  href,
  active,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
  active: boolean;
}) {
  return (
    <li>
      <Link
        href={href}
        className="flex flex-col gap-1 rounded-2xl border border-transparent p-3.5 transition hover:border-border hover:bg-card sm:flex-row sm:items-center sm:justify-between"
      >
        <span className="flex min-w-0 items-center gap-3.5">
          <span
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border",
              active ? "border-primary/40 bg-primary/10 text-primary" : "border-border bg-secondary text-muted-foreground"
            )}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="truncate text-sm font-semibold text-foreground">{title}</span>
        </span>
        <span className="max-w-full pl-[50px] text-xs font-normal text-muted-foreground sm:max-w-xs sm:pl-0 sm:text-right">
          {description}
        </span>
      </Link>
    </li>
  );
}

function ModuleSection({
  focusTrack,
  progressPct,
  lessons,
  query,
  browseHref,
}: {
  focusTrack: TrackProgress | null;
  progressPct: number;
  lessons: { key: string; icon: LucideIcon; title: string; description: string; href: string }[];
  query: string;
  browseHref: string;
}) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
    >
      <div className="flex items-center justify-between gap-4 pb-1">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-muted-foreground">
            {focusTrack ? (focusTrack.category ?? "Learning path") : "Learning paths"}
          </p>
          <h2 className="truncate font-heading text-lg font-bold text-foreground">
            {focusTrack ? focusTrack.title : "Your lessons"}
          </h2>
        </div>
        {focusTrack && focusTrack.totalLessons > 0 ? (
          <div className="flex w-36 shrink-0 items-center gap-3 sm:w-44">
            <div
              className="h-1.5 w-full overflow-hidden rounded-full bg-secondary"
              role="progressbar"
              aria-valuenow={progressPct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${focusTrack.title} progress`}
            >
              <div className="h-full rounded-full bg-primary" style={{ width: `${progressPct}%` }} />
            </div>
            <span className="text-xs font-bold text-muted-foreground">{progressPct}%</span>
          </div>
        ) : (
          <Link
            href={browseHref}
            className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            Browse paths <ArrowRight className="h-3 w-3" aria-hidden="true" />
          </Link>
        )}
      </div>
      <p className="sr-only" aria-live="polite">
        {lessons.length} {lessons.length === 1 ? "lesson" : "lessons"} shown
      </p>
      {lessons.length > 0 ? (
        <ul id="learn-lesson-list" className="mt-2 space-y-2">
          {lessons.map((lesson) => (
            <LessonItem
              key={lesson.key}
              icon={lesson.icon}
              title={lesson.title}
              description={lesson.description}
              href={lesson.href}
              active
            />
          ))}
        </ul>
      ) : (
        <div className="mt-2 flex flex-col items-center justify-center rounded-2xl border border-border bg-card px-6 py-12 text-center">
          <Zap className="mb-3 h-8 w-8 text-muted-foreground/30" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">
            {query ? `No lessons match "${query}".` : "No lessons completed yet."}
          </p>
          <p className="mt-1 text-xs text-muted-foreground/70">
            {query ? "Try a different search." : "Start learning to see your progress here."}
          </p>
        </div>
      )}
    </motion.div>
  );
}

/* ---------------- Scheduled: resume today + up next tomorrow ---------------- */

function ScheduleCard({
  title,
  meta,
  tag,
  dotClassName,
  href,
}: {
  title: string;
  meta: string;
  tag: string;
  dotClassName: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 transition hover:bg-card-hover"
    >
      <span className="min-w-0">
        <span className="block truncate text-sm font-bold text-foreground">{title}</span>
        <span className="mt-0.5 block text-[11px] font-medium text-muted-foreground">{meta}</span>
      </span>
      <span className="flex shrink-0 items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
        <span className={cn("h-1.5 w-1.5 rounded-full", dotClassName)} aria-hidden="true" />
        {tag}
      </span>
    </Link>
  );
}

function ScheduledSection({
  resume,
  upNext,
  mentors,
}: {
  resume: { title: string; subtitle: string; href: string; tag: string };
  upNext: { title: string; meta: string; href: string } | null;
  mentors: Mentor[];
}) {
  const avatars = mentors.slice(0, 3);

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
    >
      <div className="flex items-center justify-between pb-1">
        <h2 className="font-heading text-base font-bold text-foreground">Scheduled</h2>
        <Link href="/dashboard" className="text-xs font-medium text-muted-foreground transition hover:text-foreground">
          See all
        </Link>
      </div>

      <div className="mt-2 space-y-2.5">
        <span className="block text-xs font-semibold text-muted-foreground">Today</span>
        <Link
          href={resume.href}
          className="block space-y-3.5 rounded-2xl border border-border bg-card p-4 transition hover:bg-card-hover"
        >
          <div className="min-w-0">
            <h4 className="line-clamp-1 text-sm font-bold text-foreground">{resume.title}</h4>
            <p className="mt-0.5 truncate text-[11px] font-medium text-muted-foreground">{resume.subtitle}</p>
          </div>
          <div className="flex items-center justify-between pt-1">
            {avatars.length > 0 ? (
              <div className="flex items-center -space-x-2">
                {avatars.map((mentor) => (
                  <Avatar key={mentor.id} className="h-6 w-6 ring-2 ring-card">
                    <AvatarImage src={mentor.avatarUrl ?? ""} alt={mentor.name} />
                    <AvatarFallback className="text-[8px]">{getInitials(mentor.name)}</AvatarFallback>
                  </Avatar>
                ))}
              </div>
            ) : (
              <span className="text-[11px] text-muted-foreground">Pick up where you left off</span>
            )}
            <span className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
              {resume.tag}
            </span>
          </div>
        </Link>
      </div>

      <div className="space-y-2.5 pt-5">
        <span className="block text-xs font-semibold text-muted-foreground">Tomorrow</span>
        {upNext ? (
          <ScheduleCard
            title={upNext.title}
            meta={upNext.meta}
            tag="Up next"
            dotClassName="bg-amber-500"
            href={upNext.href}
          />
        ) : (
          <ScheduleCard
            title="Browse all paths"
            meta="Find your next challenge"
            tag="Paths"
            dotClassName="bg-amber-500"
            href="/dashboard"
          />
        )}
        <ScheduleCard
          title="Practice Lab"
          meta="JS · Python · Linux · SQL"
          tag="Practice"
          dotClassName="bg-purple-500"
          href="/learn/practice"
        />
      </div>
    </motion.div>
  );
}

/* ---------------- Dashboard assembly ---------------- */

export function LearnDashboard({
  user,
  stats,
  trackProgress,
  continueWatching,
  activityData,
  recentLessons,
  mentors,
}: LearnDashboardProps) {
  const [greeting] = React.useState(getGreeting);
  const [query, setQuery] = React.useState("");

  const focusTrack =
    trackProgress.find((t) => t.completedLessons > 0 && t.completedLessons < t.totalLessons) ??
    trackProgress.find((t) => t.totalLessons > 0) ??
    trackProgress[0] ??
    null;

  const progressPct =
    focusTrack && focusTrack.totalLessons > 0
      ? Math.round((focusTrack.completedLessons / focusTrack.totalLessons) * 100)
      : 0;

  const heroTracks = React.useMemo(() => {
    const inProgress = trackProgress.filter((t) => t.completedLessons > 0 && t.completedLessons < t.totalLessons);
    const rest = trackProgress.filter((t) => !inProgress.includes(t));
    return [...inProgress, ...rest].slice(0, 3);
  }, [trackProgress]);

  const lessonsThisMonth = activityData.reduce((sum, d) => sum + d.count, 0);
  const heroNumber = lessonsThisMonth > 0 ? lessonsThisMonth : stats.completedLessons > 0 ? stats.completedLessons : null;
  const heroSuffix = lessonsThisMonth > 0 ? "this month" : stats.completedLessons > 0 ? "so far" : null;
  const heroNoun = heroNumber === 1 ? "lesson" : "lessons";

  const normalizedQuery = query.trim().toLowerCase();
  const focusLessons =
    focusTrack && recentLessons.some((r) => r.lesson.track.id === focusTrack.id)
      ? recentLessons.filter((r) => r.lesson.track.id === focusTrack.id)
      : recentLessons;

  const lessons = focusLessons
    .filter((row) => {
      if (!normalizedQuery) return true;
      return (
        row.lesson.title.toLowerCase().includes(normalizedQuery) ||
        row.lesson.track.title.toLowerCase().includes(normalizedQuery)
      );
    })
    .slice(0, 5)
    .map((row, i) => {
      const completed = formatShortDate(row.completedAt);
      return {
        key: row.id,
        icon: lessonIconFor(row.lesson, i),
        title: row.lesson.title,
        description: completed ? `${row.lesson.track.title} · ${completed}` : row.lesson.track.title,
        href: `/learn/${row.lesson.track.slug}`,
      };
    });

  const resumeItem = continueWatching[0] ?? null;
  const resume = resumeItem
    ? {
        title: `Continue · ${resumeItem.lessonTitle}`,
        subtitle: resumeItem.trackTitle,
        href: `/learn/${resumeItem.trackSlug}`,
        tag: "Lesson",
      }
    : focusTrack
      ? {
          title: `Start · ${focusTrack.title}`,
          subtitle:
            focusTrack.totalLessons > 0
              ? `${Math.max(focusTrack.totalLessons - focusTrack.completedLessons, 0)} of ${focusTrack.totalLessons} lessons left`
              : (focusTrack.category ?? "Learning path"),
          href: `/learn/${focusTrack.slug}`,
          tag: "Path",
        }
      : {
          title: "Explore learning paths",
          subtitle: "Find a path to begin",
          href: "/dashboard",
          tag: "Path",
        };

  const upNextTrack =
    trackProgress.find((t) => t.completedLessons === 0 && t.totalLessons > 0) ??
    trackProgress.find((t) => focusTrack && t.id !== focusTrack.id && t.completedLessons < t.totalLessons) ??
    null;

  const upNext = upNextTrack
    ? {
        title: upNextTrack.title,
        meta:
          upNextTrack.completedLessons === 0
            ? `${upNextTrack.totalLessons} ${upNextTrack.totalLessons === 1 ? "lesson" : "lessons"} · Not started`
            : `${Math.max(upNextTrack.totalLessons - upNextTrack.completedLessons, 0)} lessons left`,
        href: `/learn/${upNextTrack.slug}`,
      }
    : null;

  return (
    <div className="min-h-screen bg-background">
      <LearnHeader user={user} streak={stats.streak} query={query} onQueryChange={setQuery} />

      <div className="mx-auto max-w-6xl space-y-6 p-4 sm:space-y-8 sm:p-6 lg:p-8">
        <HeroBanner
          user={user}
          greeting={greeting}
          heroNumber={heroNumber}
          heroNoun={heroNoun}
          heroSuffix={heroSuffix}
          heroTracks={heroTracks}
        />

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
        >
          <Link
            href="/learn/practice"
            className="group flex items-center gap-4 rounded-2xl border border-primary/30 bg-card p-4 transition hover:border-primary/60 sm:p-5"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Terminal className="h-5 w-5 text-primary" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-foreground">Practice real workloads</span>
              <span className="block truncate text-xs text-muted-foreground">
                Solve JS, Python, Linux &amp; SQL tasks in-browser and earn XP
              </span>
            </span>
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary">
              <ArrowRight
                className="h-4 w-4 text-primary-foreground transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </span>
          </Link>
        </motion.div>

        <section
          aria-label="Learning progress and schedule"
          className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12 lg:gap-8"
        >
          <div className="lg:col-span-8">
            <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }}>
              <ModuleSection
                focusTrack={focusTrack}
                progressPct={progressPct}
                lessons={lessons}
                query={query.trim()}
                browseHref="/dashboard"
              />
            </motion.div>
          </div>
          <div className="lg:col-span-4">
            <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }}>
              <ScheduledSection resume={resume} upNext={upNext} mentors={mentors} />
            </motion.div>
          </div>
        </section>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="flex items-center justify-center gap-4 pb-4 pt-2 text-xs text-muted-foreground"
        >
          <span className="flex items-center gap-1.5">
            <Play className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            {stats.completedLessons} {stats.completedLessons === 1 ? "lesson" : "lessons"} completed
          </span>
          <span className="h-3 w-px bg-border" aria-hidden="true" />
          <span className="flex items-center gap-1.5">
            <Flame className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            {stats.streak} {stats.streak === 1 ? "day" : "days"} streak
          </span>
        </motion.div>
      </div>
    </div>
  );
}
