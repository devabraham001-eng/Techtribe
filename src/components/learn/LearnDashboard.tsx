"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn, getInitials } from "@/lib/utils";
import {
  ArrowUp,
  ArrowUpRight,
  Bell,
  Book,
  Briefcase,
  Calendar,
  FileText,
  Flame,
  Globe,
  Landmark,
  LayoutGrid,
  MessageSquare,
  Mic,
  Play,
  Search,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  ShoppingBag,
  Trophy,
  Video,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
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

/* ------------------------------------------------------------------ */
/* Static replica content (mirrors CODE.txt 1:1)                       */
/* ------------------------------------------------------------------ */

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  active: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutGrid, active: true },
  { label: "Practice", href: "/learn/practice", icon: MessageSquare, active: false },
  { label: "Schedule", href: "#scheduled", icon: Calendar, active: false },
  { label: "Video guides", href: "#module", icon: Play, active: false },
  { label: "Notifications", href: "/dashboard", icon: Bell, active: false },
  { label: "Achievements", href: "/dashboard", icon: Trophy, active: false },
  { label: "Settings", href: "/settings", icon: Settings, active: false },
];

interface ReplicaLesson {
  title: string;
  description: string;
  icon: LucideIcon;
  highlighted: boolean;
}

const REPLICA_LESSONS: ReplicaLesson[] = [
  {
    title: "Office vocabulary",
    description: "Talk about daily tasks, meetings, and coworkers.",
    icon: Book,
    highlighted: true,
  },
  {
    title: "What is your job?",
    description: "Learn names of common professions and roles.",
    icon: Briefcase,
    highlighted: true,
  },
  {
    title: "Job Interviews",
    description: "Talk about daily tasks, meetings, and coworkers.",
    icon: Mic,
    highlighted: true,
  },
  {
    title: "Work Meetings",
    description: "Use phrases to contribute, agree, or ask questions.",
    icon: Video,
    highlighted: false,
  },
  {
    title: "CV Basics",
    description: "Use phrases to contribute, agree, or ask questions.",
    icon: FileText,
    highlighted: false,
  },
];

type TopicVariant = "light" | "primary" | "dark";

interface ReplicaTopic {
  number: string;
  title: React.ReactNode;
  icon: LucideIcon;
  variant: TopicVariant;
  artClassName: string;
  iconClassName: string;
}

const REPLICA_TOPICS: ReplicaTopic[] = [
  {
    number: "01",
    title: (
      <>
        Going
        <br />
        shopping
      </>
    ),
    icon: ShoppingBag,
    variant: "light",
    artClassName: "flex w-full items-end justify-end pb-1 pr-1",
    iconClassName: "h-24 w-24",
  },
  {
    number: "02",
    title: (
      <>
        Around the
        <br />
        world
      </>
    ),
    icon: Globe,
    variant: "primary",
    artClassName: "flex w-full items-end justify-center -mb-5",
    iconClassName: "h-28 w-28",
  },
  {
    number: "03",
    title: (
      <>
        Paris
        <br />
        en ville
      </>
    ),
    icon: Landmark,
    variant: "dark",
    artClassName: "flex w-full items-end justify-center -mb-1",
    iconClassName: "h-24 w-24",
  },
];

/* ------------------------------------------------------------------ */
/* Sidebar                                                             */
/* ------------------------------------------------------------------ */

function PromoAvatar() {
  // Decorative character illustration from the reference (no icon equivalent).
  return (
    <svg className="mt-2 h-14 w-14" fill="none" viewBox="0 0 100 100" aria-hidden="true">
      <path d="M20 70C20 53.4315 33.4315 40 50 40C66.5685 40 80 53.4315 80 70V100H20V70Z" fill="#F4D3BD" />
      <path
        d="M22 36C22 36 34 22 55 24C68 25 76 34 76 34L86 38L64 45L40 44L22 36Z"
        fill="#D0F201"
        stroke="#10180B"
        strokeWidth="3"
      />
      <circle cx="43" cy="56" fill="#10180B" r="3" />
      <circle cx="63" cy="56" fill="#10180B" r="3" />
      <path d="M50 63C53 67 59 67 62 63" stroke="#10180B" strokeLinecap="round" strokeWidth="2.5" />
      <path
        d="M20 40C20 40 32 30 52 32C66 33.5 73 42 73 42"
        stroke="#10180B"
        strokeLinecap="round"
        strokeWidth="3"
      />
    </svg>
  );
}

const LEARN_SIDEBAR_STORAGE_KEY = "techtribe_sidebar_collapsed";

function LearnSidebar() {
  const [collapsed, setCollapsed] = React.useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(LEARN_SIDEBAR_STORAGE_KEY) === "true";
    }
    return false;
  });

  function toggleCollapse() {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(LEARN_SIDEBAR_STORAGE_KEY, String(next));
      } catch {
        /* storage unavailable */
      }
      return next;
    });
  }

  const rowClass = (active: boolean) =>
    cn(
      "flex items-center gap-3.5 rounded-full px-4 py-2.5 text-sm font-medium transition-colors",
      collapsed && "md:mx-auto md:h-10 md:w-10 md:justify-center md:gap-0 md:px-0",
      active
        ? "bg-card text-foreground"
        : "text-muted-foreground hover:bg-card/60 hover:text-foreground"
    );

  return (
    <aside
      aria-label="Learn navigation"
      className={cn(
        "flex w-full shrink-0 flex-col justify-between border-b border-border bg-secondary p-6 transition-all duration-200 md:min-h-screen md:border-b-0 md:border-r",
        collapsed ? "md:w-[76px] md:px-3" : "md:w-64"
      )}
    >
      <div className="space-y-8">
        <div className={cn("flex items-center gap-2", collapsed && "md:justify-center")}>
          <Link
            href="/dashboard"
            title="TechTribe"
            aria-label="TechTribe home"
            className="font-heading text-2xl font-bold lowercase tracking-tight text-primary"
          >
            <span aria-hidden="true" className={cn(collapsed && "md:hidden")}>
              techtribe
            </span>
            {collapsed && (
              <span aria-hidden="true" className="hidden md:inline">
                t
              </span>
            )}
          </Link>
        </div>
        <nav aria-label="Main Navigation" className="space-y-1.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                aria-current={item.active ? "page" : undefined}
                title={collapsed ? item.label : undefined}
                aria-label={collapsed ? item.label : undefined}
                className={rowClass(item.active)}
              >
                <Icon
                  className={cn("h-4 w-4 shrink-0", item.active && "text-foreground")}
                  strokeWidth={item.active ? 2.2 : 2}
                  aria-hidden="true"
                />
                <span className={cn(collapsed && "md:hidden")}>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="mt-6">
        {collapsed ? (
          <div className="hidden justify-center md:flex">
            <Link
              href="/settings"
              title="Upgrade to Plus"
              aria-label="Upgrade to Plus"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow transition hover:bg-primary-dark"
            >
              <ArrowUp className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
            </Link>
          </div>
        ) : (
          <div className="relative mt-8 pt-8">
            <div className="relative flex flex-col items-center overflow-hidden rounded-2xl bg-primary p-4 text-center">
              <div className="absolute -top-7 left-1/2 flex h-16 w-16 -translate-x-1/2 items-center justify-center overflow-hidden rounded-full border-4 border-secondary bg-white shadow-lg">
                <PromoAvatar />
              </div>
              <div className="mb-3 mt-6">
                <h3 className="flex items-center justify-center gap-1.5 text-base font-extrabold leading-tight tracking-tight text-primary-foreground">
                  Level
                  <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-primary-foreground text-[10px] font-black text-primary">
                    <ArrowUp className="h-2.5 w-2.5" strokeWidth={3} aria-hidden="true" />
                  </span>
                  Up
                </h3>
                <p className="text-base font-extrabold leading-tight text-primary-foreground">with Plus</p>
              </div>
              <Link
                href="/settings"
                className="flex w-full items-center justify-center gap-1.5 rounded-full bg-primary-foreground px-3 py-2 text-xs font-semibold text-primary shadow transition hover:opacity-90"
              >
                <span>Upgrade Now</span>
                <ArrowUpRight className="h-3 w-3" strokeWidth={2.5} aria-hidden="true" />
              </Link>
            </div>
          </div>
        )}
        <div className="mt-4 space-y-1.5 border-t border-border pt-4">
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              title="Sign out"
              aria-label="Sign out"
              className={cn(rowClass(false), "w-full")}
            >
              <LogOut className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden="true" />
              <span className={cn(collapsed && "md:hidden")}>Sign out</span>
            </button>
          </form>
          <button
            type="button"
            onClick={toggleCollapse}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
            className={cn(rowClass(false), "hidden w-full md:flex")}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4 shrink-0" aria-hidden="true" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}

/* ------------------------------------------------------------------ */
/* Header                                                              */
/* ------------------------------------------------------------------ */

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
      className="flex items-center gap-3 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs"
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
      <div className="h-3 w-[1px] bg-border" aria-hidden="true" />
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
    <header className="flex h-16 items-center justify-between border-b border-border px-4 sm:h-20 sm:px-8">
      <div className="relative w-40 sm:w-72 lg:w-96">
        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-0 sm:pl-3.5">
          <Search className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        </span>
        <label htmlFor="learn-search" className="sr-only">
          Search for a course, lesson, etc.
        </label>
        <input
          id="learn-search"
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search for a course, lesson, etc."
          aria-controls="learn-lesson-list"
          className="w-full bg-transparent py-2 pl-7 pr-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-0 sm:pl-10 sm:pr-4"
        />
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <XpStreakPill streak={streak} />
        <div className="relative ml-1 h-8 w-8 overflow-hidden rounded-full border border-border">
          <Avatar className="h-full w-full">
            <AvatarImage src={user.avatarUrl ?? ""} alt={user.name} className="object-cover" />
            <AvatarFallback className="text-xs">{getInitials(user.name)}</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/* Hero                                                                */
/* ------------------------------------------------------------------ */

function TopicCard({
  topic,
  index,
  href,
}: {
  topic: ReplicaTopic;
  index: number;
  href: string;
}) {
  const Icon = topic.icon;
  return (
    <Link
      href={href}
      aria-label={`Open path ${topic.number}`}
      className={cn(
        "group flex h-48 w-36 shrink-0 flex-col justify-between overflow-hidden rounded-2xl p-3.5 shadow-lg transition-transform hover:-translate-y-0.5",
        topic.variant === "light" && "bg-foreground text-background",
        topic.variant === "primary" && "bg-primary text-primary-foreground",
        topic.variant === "dark" && "border border-border bg-secondary text-foreground"
      )}
    >
      <div>
        <span
          className={cn(
            "text-[10px] font-bold tracking-wider",
            topic.variant === "light" && "text-background/50",
            topic.variant === "primary" && "text-primary-foreground/60",
            topic.variant === "dark" && "text-muted-foreground"
          )}
        >
          {topic.number}
        </span>
        <h4 className="mt-1 text-xs font-bold leading-snug">{topic.title}</h4>
      </div>
      <div className={topic.artClassName} aria-hidden="true">
        <Icon className={topic.iconClassName} strokeWidth={2} />
      </div>
      <span className="sr-only">Part {index + 1} of 3</span>
    </Link>
  );
}

function HeroBanner({
  firstName,
  heroNumber,
  heroNoun,
  heroSuffix,
  topicHrefs,
}: {
  firstName: string;
  heroNumber: number | null;
  heroNoun: string;
  heroSuffix: string | null;
  topicHrefs: string[];
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      aria-labelledby="learn-hero-heading"
      className="relative flex flex-col justify-between gap-6 overflow-hidden rounded-[28px] border border-primary/20 bg-gradient-to-br from-primary/[0.12] via-card to-card p-6 shadow-inner sm:p-7 lg:flex-row lg:items-stretch"
    >
      <div className="z-10 flex max-w-sm flex-col justify-between gap-6">
        <div>
          <span className="text-sm font-medium text-muted-foreground">Salut, {firstName}!</span>
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
        <div className="pt-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-md transition duration-200 hover:bg-primary-dark"
          >
            <span>View Progress</span>
            <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden="true" />
          </Link>
        </div>
      </div>
      <div className="z-10 flex items-center gap-3.5 overflow-x-auto pb-2 lg:pb-0" aria-label="Featured topics">
        {REPLICA_TOPICS.map((topic, i) => (
          <TopicCard key={topic.number} topic={topic} index={i} href={topicHrefs[i] ?? "/dashboard"} />
        ))}
      </div>
    </motion.section>
  );
}

/* ------------------------------------------------------------------ */
/* Module lessons                                                      */
/* ------------------------------------------------------------------ */

function LessonRow({
  lesson,
  href,
}: {
  lesson: ReplicaLesson;
  href: string;
}) {
  const Icon = lesson.icon;
  return (
    <li>
      <Link
        href={href}
        className="flex flex-col gap-2 rounded-2xl border border-transparent bg-transparent p-3.5 transition hover:border-border hover:bg-card min-[480px]:flex-row min-[480px]:items-center min-[480px]:justify-between"
      >
        <span className="flex min-w-0 items-center gap-3.5">
          <span
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border",
              lesson.highlighted
                ? "border-primary/40 bg-primary/10 text-primary"
                : "border-border bg-secondary text-muted-foreground"
            )}
          >
            <Icon className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
          </span>
          <span className="truncate text-sm font-semibold text-foreground">{lesson.title}</span>
        </span>
        <span className="max-w-full pl-[50px] text-xs font-normal text-muted-foreground min-[480px]:max-w-xs min-[480px]:pl-0 min-[480px]:text-right">
          {lesson.description}
        </span>
      </Link>
    </li>
  );
}

function ModuleSection({ lessonHref, query }: { lessonHref: string; query: string }) {
  const normalizedQuery = query.trim().toLowerCase();
  const visibleLessons = REPLICA_LESSONS.filter((lesson) => {
    if (!normalizedQuery) return true;
    return (
      lesson.title.toLowerCase().includes(normalizedQuery) ||
      lesson.description.toLowerCase().includes(normalizedQuery)
    );
  });

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      id="module"
      className="scroll-mt-4"
    >
      <div className="flex items-center justify-between gap-4 pb-1">
        <div className="min-w-0">
          <span className="text-xs font-semibold text-muted-foreground">Module 6</span>
          <h2 className="truncate font-heading text-lg font-bold text-foreground">Work and office</h2>
        </div>
        <div className="flex w-36 shrink-0 items-center gap-3 sm:w-44">
          <div
            className="h-1.5 w-full overflow-hidden rounded-full bg-secondary"
            role="progressbar"
            aria-valuenow={75}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Module 6 progress"
          >
            <div className="h-full w-3/4 rounded-full bg-primary" />
          </div>
          <span className="text-xs font-bold text-muted-foreground">75%</span>
        </div>
      </div>
      <p className="sr-only" aria-live="polite">
        {visibleLessons.length} {visibleLessons.length === 1 ? "lesson" : "lessons"} shown
      </p>
      {visibleLessons.length > 0 ? (
        <ul id="learn-lesson-list" className="mt-2 space-y-3">
          {visibleLessons.map((lesson) => (
            <LessonRow key={lesson.title} lesson={lesson} href={lessonHref} />
          ))}
        </ul>
      ) : (
        <div className="mt-2 flex flex-col items-center justify-center rounded-2xl border border-border bg-card px-6 py-12 text-center">
          <p className="text-sm text-muted-foreground">No lessons match &ldquo;{query.trim()}&rdquo;.</p>
          <p className="mt-1 text-xs text-muted-foreground/70">Try a different search.</p>
        </div>
      )}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Scheduled                                                           */
/* ------------------------------------------------------------------ */

function ScheduleCard({
  title,
  meta,
  tag,
  dotClassName,
}: {
  title: string;
  meta: string;
  tag: string;
  dotClassName: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 transition hover:bg-card-hover">
      <div className="min-w-0">
        <h4 className="truncate text-sm font-bold text-foreground">{title}</h4>
        <p className="mt-0.5 text-[11px] font-medium text-muted-foreground">{meta}</p>
      </div>
      <div className="flex shrink-0 items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
        <span className={cn("h-1.5 w-1.5 rounded-full", dotClassName)} aria-hidden="true" />
        <span>{tag}</span>
      </div>
    </div>
  );
}

function ScheduledSection({ mentors }: { mentors: Mentor[] }) {
  const avatars = mentors.slice(0, 3);

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      id="scheduled"
      className="scroll-mt-4"
    >
      <div className="flex items-center justify-between pb-1">
        <h2 className="font-heading text-base font-bold text-foreground">Scheduled</h2>
        <Link href="/dashboard" className="text-xs font-medium text-muted-foreground transition hover:text-foreground">
          See all
        </Link>
      </div>

      <div className="mt-2 space-y-2.5">
        <span className="block text-xs font-semibold text-muted-foreground">Today</span>
        <div className="space-y-3.5 rounded-2xl border border-border bg-card p-4 transition hover:bg-card-hover">
          <div className="min-w-0">
            <h4 className="truncate text-sm font-bold text-foreground">Speaking Club (A2)</h4>
            <p className="mt-0.5 text-[11px] font-medium text-muted-foreground">Starts in 3 min</p>
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
              <span className="text-[11px] text-muted-foreground">Group session</span>
            )}
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
              <span>Group</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2.5 pt-5">
        <span className="block text-xs font-semibold text-muted-foreground">Tomorrow</span>
        <ScheduleCard title="1-on-1 Tutoring" meta="7:00-7:40 PM" tag="Personal" dotClassName="bg-amber-500" />
        <ScheduleCard title="Paris: Virtual Tour" meta="7:00-7:40 PM" tag="Event" dotClassName="bg-purple-500" />
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Dashboard assembly                                                  */
/* ------------------------------------------------------------------ */

export function LearnDashboard({
  user,
  stats,
  trackProgress,
  activityData,
  mentors,
}: LearnDashboardProps) {
  const [query, setQuery] = React.useState("");

  // The replica ships its own full app shell, so hide the global dashboard
  // sidebar while this page is mounted (restored on unmount).
  React.useEffect(() => {
    const el = document.getElementById("techtribe-global-sidebar");
    if (!el) return;
    const previous = el.style.display;
    el.style.display = "none";
    return () => {
      el.style.display = previous;
    };
  }, []);

  const focusTrack =
    trackProgress.find((t) => t.completedLessons > 0 && t.completedLessons < t.totalLessons) ??
    trackProgress.find((t) => t.totalLessons > 0) ??
    trackProgress[0] ??
    null;

  const lessonHref = focusTrack ? `/learn/${focusTrack.slug}` : "/dashboard";

  const topicHrefs = REPLICA_TOPICS.map((_, i) =>
    trackProgress[i] ? `/learn/${trackProgress[i].slug}` : "/dashboard"
  );

  const lessonsThisMonth = activityData.reduce((sum, d) => sum + d.count, 0);
  const heroNumber =
    lessonsThisMonth > 0 ? lessonsThisMonth : stats.completedLessons > 0 ? stats.completedLessons : null;
  const heroSuffix = lessonsThisMonth > 0 ? "this month" : stats.completedLessons > 0 ? "so far" : null;
  const heroNoun = heroNumber === 1 ? "lesson" : "lessons";

  return (
    <div className="flex min-h-screen w-full flex-col bg-background text-foreground md:flex-row">
      <LearnSidebar />
      <main className="flex min-w-0 flex-1 flex-col bg-background">
        <LearnHeader user={user} streak={stats.streak} query={query} onQueryChange={setQuery} />
        <div className="space-y-6 overflow-y-auto p-4 sm:space-y-8 sm:p-6 lg:p-8">
          <HeroBanner
            firstName={user.firstName}
            heroNumber={heroNumber}
            heroNoun={heroNoun}
            heroSuffix={heroSuffix}
            topicHrefs={topicHrefs}
          />
          <section
            aria-label="Module lessons and schedule"
            className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12 lg:gap-8"
          >
            <div className="space-y-5 lg:col-span-8">
              <ModuleSection lessonHref={lessonHref} query={query} />
            </div>
            <div className="space-y-5 lg:col-span-4">
              <ScheduledSection mentors={mentors} />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
