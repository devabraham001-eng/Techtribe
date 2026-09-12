"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { LearnShell } from "./LearnSidebar";
import {
  Bell,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Languages,
  Megaphone,
  Play,
  Plus,
  Presentation,
  Rocket,
  Search,
  Sparkles,
  Upload,
  Users,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

/* ------------------------------------------------------------------ */
/* Static replica content (mirrors video screen.txt 1:1)               */
/* ------------------------------------------------------------------ */

interface QuickAction {
  title: string;
  description: string;
  icon: LucideIcon;
}

const QUICK_ACTIONS: QuickAction[] = [
  { title: "New Video", description: "Use template or blank canvas", icon: Plus },
  { title: "AI Assistant", description: "Turn text and link into video", icon: Sparkles },
  { title: "AI Dubbing", description: "Translate any video", icon: Languages },
  { title: "Import", description: "Turn slides into video", icon: Upload },
];

interface VideoTemplate {
  title: React.ReactNode;
  plainTitle: string;
  icon: LucideIcon;
}

const VIDEO_TEMPLATES: VideoTemplate[] = [
  {
    title: (
      <>
        Modern
        <br />
        Startup Pitch
      </>
    ),
    plainTitle: "Modern Startup Pitch",
    icon: Presentation,
  },
  {
    title: (
      <>
        Meet Our
        <br />
        New Avatars
      </>
    ),
    plainTitle: "Meet Our New Avatars",
    icon: Users,
  },
  {
    title: (
      <>
        Stylish Corporate
        <br />
        Presentation
      </>
    ),
    plainTitle: "Stylish Corporate Presentation",
    icon: Briefcase,
  },
  {
    title: (
      <>
        Futuristic Product
        <br />
        Demonstration
      </>
    ),
    plainTitle: "Futuristic Product Demonstration",
    icon: Rocket,
  },
];

/* ------------------------------------------------------------------ */
/* Header                                                              */
/* ------------------------------------------------------------------ */

function VideoHeader({
  user,
  query,
  onQueryChange,
}: {
  user: { name: string; avatarUrl: string | null };
  query: string;
  onQueryChange: (value: string) => void;
}) {
  return (
    <header className="flex items-center justify-between gap-4 px-4 pt-5 sm:px-6 md:px-6">
      <div className="relative max-w-xl flex-1">
        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
          <Search className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        </span>
        <label htmlFor="video-search" className="sr-only">
          Search videos, folders &amp; templates
        </label>
        <input
          id="video-search"
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search videos, folders & templates"
          aria-controls="video-template-grid"
          className="w-full rounded-full border border-border bg-secondary py-2 pl-10 pr-4 text-xs text-foreground placeholder:text-muted-foreground transition focus:border-primary/60 focus:outline-none focus:ring-1 focus:ring-primary/60 md:text-sm"
        />
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm transition hover:bg-primary-dark"
        >
          <Plus className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
          <span className="hidden sm:inline">New Video</span>
          <span className="sm:hidden">New</span>
        </button>
        <button
          type="button"
          aria-label="Announcements"
          title="Announcements"
          className="hidden h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-card hover:text-foreground min-[480px]:flex"
        >
          <Megaphone className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label="Notifications"
          title="Notifications"
          className="hidden h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-card hover:text-foreground min-[480px]:flex"
        >
          <Bell className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
        </button>
        <div className="h-8 w-8 cursor-pointer overflow-hidden rounded-full border border-primary/30">
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
/* Quick actions                                                       */
/* ------------------------------------------------------------------ */

function QuickActions() {
  return (
    <motion.section
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      aria-label="Quick Actions"
      className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
    >
      {QUICK_ACTIONS.map((action) => {
        const Icon = action.icon;
        return (
          <div
            key={action.title}
            className="group flex cursor-pointer items-center gap-3 rounded-2xl border border-border bg-card p-3 transition hover:bg-card-hover"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition group-hover:scale-105">
              <Icon className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h4 className="truncate text-xs font-semibold text-foreground">{action.title}</h4>
              <p className="truncate text-[11px] text-muted-foreground">{action.description}</p>
            </div>
          </div>
        );
      })}
    </motion.section>
  );
}

/* ------------------------------------------------------------------ */
/* Hero                                                                */
/* ------------------------------------------------------------------ */

function HeroBanner() {
  const [dismissed, setDismissed] = React.useState(false);

  if (dismissed) return null;

  return (
    <motion.section
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      aria-labelledby="video-hero-heading"
      className="relative overflow-hidden rounded-[22px] border border-border bg-card p-6 lg:p-7"
    >
      <button
        type="button"
        aria-label="Dismiss banner"
        title="Dismiss banner"
        onClick={() => setDismissed(true)}
        className="absolute right-4 top-4 text-muted-foreground transition hover:text-foreground"
      >
        <X className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
      </button>
      <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-12">
        <div className="flex justify-center lg:col-span-5 lg:justify-start">
          <div className="relative h-[170px] w-full max-w-[280px]">
            <div className="absolute inset-x-8 -top-3 h-28 rounded-xl bg-border opacity-50" aria-hidden="true" />
            <div className="absolute inset-x-4 -top-1.5 h-32 rounded-xl bg-card-hover opacity-75" aria-hidden="true" />
            <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-2xl bg-foreground shadow-xl">
              <div className="group relative h-32 w-32 cursor-pointer overflow-hidden rounded-full bg-background shadow-inner">
                <div
                  className="absolute inset-0 bg-gradient-to-br from-primary/50 via-secondary to-background"
                  aria-hidden="true"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition group-hover:bg-black/30">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-neutral-900 shadow-md backdrop-blur-sm">
                    <Play className="ml-0.5 h-4 w-4" fill="currentColor" aria-hidden="true" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col justify-center space-y-3.5 pr-4 text-left lg:col-span-7">
          <h2
            id="video-hero-heading"
            className="font-heading text-2xl font-bold leading-tight tracking-tight text-foreground lg:text-[26px]"
          >
            Create your first
            <br className="hidden sm:inline" /> AI video today!
          </h2>
          <p className="max-w-md text-xs font-normal leading-relaxed text-muted-foreground lg:text-sm">
            Take a quick tour to familiarize yourself with the platform, enabling you to effortlessly
            create your very first video.
          </p>
          <div className="pt-1">
            <button
              type="button"
              className="rounded-full bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground shadow-md transition hover:bg-primary-dark"
            >
              Get Started
            </button>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

/* ------------------------------------------------------------------ */
/* Get inspired                                                        */
/* ------------------------------------------------------------------ */

function InspiredSection({ query }: { query: string }) {
  const trackRef = React.useRef<HTMLDivElement>(null);

  function scrollTemplates(direction: 1 | -1) {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * 300, behavior: "smooth" });
  }

  const normalizedQuery = query.trim().toLowerCase();
  const visibleTemplates = VIDEO_TEMPLATES.filter((template) => {
    if (!normalizedQuery) return true;
    return template.plainTitle.toLowerCase().includes(normalizedQuery);
  });

  return (
    <motion.section
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      aria-labelledby="inspired-heading"
      className="space-y-3.5"
    >
      <div className="flex items-center justify-between">
        <h3 id="inspired-heading" className="font-heading text-sm font-semibold text-foreground md:text-base">
          Get Inspired
        </h3>
        <div className="flex items-center gap-3">
          <Link
            href="/learn/video-guides"
            className="text-xs font-medium text-muted-foreground transition hover:text-foreground"
          >
            All Templates
          </Link>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <button
              type="button"
              aria-label="Previous template"
              title="Previous template"
              onClick={() => scrollTemplates(-1)}
              className="flex h-6 w-6 items-center justify-center rounded-full transition hover:bg-card hover:text-foreground"
            >
              <ChevronLeft className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label="Next template"
              title="Next template"
              onClick={() => scrollTemplates(1)}
              className="flex h-6 w-6 items-center justify-center rounded-full transition hover:bg-card hover:text-foreground"
            >
              <ChevronRight className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
      <p className="sr-only" aria-live="polite">
        {visibleTemplates.length} {visibleTemplates.length === 1 ? "template" : "templates"} shown
      </p>
      {visibleTemplates.length > 0 ? (
        <div
          ref={trackRef}
          id="video-template-grid"
          className="flex snap-x gap-3.5 overflow-x-auto pb-1 md:grid md:grid-cols-4 md:overflow-visible md:pb-0"
        >
          {visibleTemplates.map((template) => {
            const Icon = template.icon;
            return (
              <div
                key={template.plainTitle}
                className="group relative aspect-[4/3] w-[70%] shrink-0 cursor-pointer snap-start overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/25 via-card to-secondary min-[480px]:w-[45%] md:w-auto"
              >
                <div className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
                  <Icon className="h-16 w-16 text-primary/20 transition duration-300 group-hover:scale-105" strokeWidth={1.5} />
                </div>
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 text-center">
                  <p className="text-xs font-semibold leading-snug text-white drop-shadow-sm md:text-sm">
                    {template.title}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card px-6 py-12 text-center">
          <p className="text-sm text-muted-foreground">No templates match &ldquo;{query.trim()}&rdquo;.</p>
          <p className="mt-1 text-xs text-muted-foreground/70">Try a different search.</p>
        </div>
      )}
    </motion.section>
  );
}

/* ------------------------------------------------------------------ */
/* Dashboard assembly                                                  */
/* ------------------------------------------------------------------ */

export function VideoGuidesDashboard({
  user,
}: {
  user: { name: string; avatarUrl: string | null };
}) {
  const [query, setQuery] = React.useState("");

  return (
    <LearnShell activeId="videos">
      <VideoHeader user={user} query={query} onQueryChange={setQuery} />
      <div className="space-y-6 overflow-y-auto p-5 md:p-6">
        <QuickActions />
        <HeroBanner />
        <InspiredSection query={query} />
      </div>
    </LearnShell>
  );
}
