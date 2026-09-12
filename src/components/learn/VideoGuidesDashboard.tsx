"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import * as Dialog from "@radix-ui/react-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials, slugify } from "@/lib/utils";
import { resolveVideoEmbed } from "@/lib/video-embed";
import type { CategoryVideoGroup } from "@/lib/learning-data";
import {
  Bell,
  Check,
  ChevronLeft,
  ChevronRight,
  Clapperboard,
  Copy,
  ExternalLink,
  Megaphone,
  Play,
  Plus,
  Search,
  X,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

interface LibraryUser {
  name: string;
  avatarUrl: string | null;
}

interface WatchTarget {
  lessonId: string;
  title: string;
  videoUrl: string;
  trackTitle: string;
  trackSlug: string;
  category: string;
}

function watchUrl(lessonId: string): string {
  return `/learn/video-guides/watch/${lessonId}`;
}

/* ------------------------------------------------------------------ */
/* Header                                                              */
/* ------------------------------------------------------------------ */

function VideoHeader({
  user,
  query,
  onQueryChange,
}: {
  user: LibraryUser;
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
          aria-controls="video-library"
          className="w-full rounded-full border border-border bg-secondary py-2 pl-10 pr-4 text-xs text-foreground placeholder:text-muted-foreground transition focus:border-primary/60 focus:outline-none focus:ring-1 focus:ring-primary/60 md:text-sm"
        />
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <Link
          href="#video-library"
          className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm transition hover:bg-primary-dark"
        >
          <Plus className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
          <span className="hidden sm:inline">New Video</span>
          <span className="sm:hidden">New</span>
        </Link>
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
/* Category shortcuts                                                  */
/* ------------------------------------------------------------------ */

function CategoryShortcuts({ groups }: { groups: CategoryVideoGroup[] }) {
  const top = groups.slice(0, 4);
  if (top.length === 0) return null;

  return (
    <motion.section
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      aria-label="Video categories"
      className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
    >
      {top.map((group) => (
        <Link
          key={group.category}
          href={`#category-${slugify(group.category)}`}
          className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-3 transition hover:bg-card-hover"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition group-hover:scale-105">
            <Clapperboard className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h4 className="truncate text-xs font-semibold text-foreground">{group.category}</h4>
            <p className="truncate text-[11px] text-muted-foreground">
              {group.videoCount} {group.videoCount === 1 ? "video" : "videos"}
            </p>
          </div>
        </Link>
      ))}
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
            <Link
              href="#video-library"
              className="inline-block rounded-full bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground shadow-md transition hover:bg-primary-dark"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

/* ------------------------------------------------------------------ */
/* Player (shared by modal + watch page)                               */
/* ------------------------------------------------------------------ */

export function VideoPlayer({ title, videoUrl }: { title: string; videoUrl: string }) {
  const resolved = resolveVideoEmbed(videoUrl);

  if (resolved.kind === "file" && resolved.embedUrl) {
    return (
      <video controls playsInline preload="metadata" className="h-full w-full bg-black" aria-label={title}>
        <source src={resolved.embedUrl} />
        Your browser does not support the video tag.
      </video>
    );
  }

  if ((resolved.kind === "youtube" || resolved.kind === "vimeo" || resolved.kind === "loom") && resolved.embedUrl) {
    return (
      <iframe
        src={resolved.embedUrl}
        title={title}
        className="h-full w-full border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-black p-6 text-center">
      <p className="text-sm text-muted-foreground">This video can&apos;t be embedded here.</p>
      <a
        href={videoUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition hover:bg-primary-dark"
      >
        Open original <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
      </a>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Watch modal                                                         */
/* ------------------------------------------------------------------ */

function WatchModal({
  target,
  onClose,
}: {
  target: WatchTarget | null;
  onClose: () => void;
}) {
  const [copied, setCopied] = React.useState(false);

  async function copyLink() {
    if (!target) return;
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${watchUrl(target.lessonId)}`);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <Dialog.Root open={target !== null} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[calc(100%-2rem)] max-w-3xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-border bg-card p-4 shadow-xl sm:p-6"
        >
          {target && (
            <>
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Dialog.Title className="truncate font-heading text-base font-bold text-foreground sm:text-lg">
                    {target.title}
                  </Dialog.Title>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {target.category} ·{" "}
                    <Link
                      href={`/learn/${target.trackSlug}`}
                      className="text-primary hover:underline"
                      onClick={onClose}
                    >
                      {target.trackTitle}
                    </Link>
                  </p>
                </div>
                <Dialog.Close
                  aria-label="Close player"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </Dialog.Close>
              </div>
              <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
                <VideoPlayer title={target.title} videoUrl={target.videoUrl} />
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Link
                  href={watchUrl(target.lessonId)}
                  onClick={onClose}
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition hover:bg-primary-dark"
                >
                  <Play className="h-3.5 w-3.5" aria-hidden="true" /> Open full page
                </Link>
                <button
                  type="button"
                  onClick={() => void copyLink()}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs font-medium text-muted-foreground transition hover:bg-card-hover hover:text-foreground"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                  )}
                  {copied ? "Copied" : "Copy link"}
                </button>
                <a
                  href={target.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs font-medium text-muted-foreground transition hover:bg-card-hover hover:text-foreground"
                >
                  Open original <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              </div>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/* ------------------------------------------------------------------ */
/* Library                                                             */
/* ------------------------------------------------------------------ */

function VideoCard({
  video,
  trackTitle,
  trackSlug,
  category,
  onWatch,
}: {
  video: { lessonId: string; title: string; videoUrl: string };
  trackTitle: string;
  trackSlug: string;
  category: string;
  onWatch: (target: WatchTarget) => void;
}) {
  const sourceLabel = resolveVideoEmbed(video.videoUrl).label;

  return (
    <button
      type="button"
      onClick={() =>
        onWatch({
          lessonId: video.lessonId,
          title: video.title,
          videoUrl: video.videoUrl,
          trackTitle,
          trackSlug,
          category,
        })
      }
      className="group flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-3 text-left transition hover:bg-card-hover"
    >
      <span className="flex h-14 w-24 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition group-hover:scale-[1.03]">
        <Play className="h-5 w-5" fill="currentColor" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-foreground">{video.title}</span>
        <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">{trackTitle}</span>
      </span>
      <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
        {sourceLabel}
      </span>
    </button>
  );
}

function LibrarySection({
  groups,
  query,
  onWatch,
}: {
  groups: CategoryVideoGroup[];
  query: string;
  onWatch: (target: WatchTarget) => void;
}) {
  const trackRef = React.useRef<HTMLDivElement>(null);

  function scrollCategories(direction: 1 | -1) {
    trackRef.current?.scrollBy({ left: direction * 300, behavior: "smooth" });
  }

  const normalizedQuery = query.trim().toLowerCase();
  const searching = normalizedQuery.length > 0;

  const searchResults = searching
    ? groups.flatMap((group) =>
        group.tracks.flatMap((track) =>
          track.videos
            .filter(
              (video) =>
                video.title.toLowerCase().includes(normalizedQuery) ||
                track.trackTitle.toLowerCase().includes(normalizedQuery) ||
                group.category.toLowerCase().includes(normalizedQuery)
            )
            .map((video) => ({ group, track, video }))
        )
      )
    : [];

  const totalVideos = groups.reduce((sum, g) => sum + g.videoCount, 0);

  return (
    <motion.section
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      aria-labelledby="video-library-heading"
      id="video-library"
      className="scroll-mt-4 space-y-3.5"
    >
      <div className="flex items-center justify-between">
        <h3 id="video-library-heading" className="font-heading text-sm font-semibold text-foreground md:text-base">
          {searching ? `${searchResults.length} ${searchResults.length === 1 ? "result" : "results"}` : "Get Inspired"}
        </h3>
        {!searching && (
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-muted-foreground">
              {totalVideos} {totalVideos === 1 ? "video" : "videos"}
            </span>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <button
                type="button"
                aria-label="Previous category"
                title="Previous category"
                onClick={() => scrollCategories(-1)}
                className="flex h-6 w-6 items-center justify-center rounded-full transition hover:bg-card hover:text-foreground"
              >
                <ChevronLeft className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden="true" />
              </button>
              <button
                type="button"
                aria-label="Next category"
                title="Next category"
                onClick={() => scrollCategories(1)}
                className="flex h-6 w-6 items-center justify-center rounded-full transition hover:bg-card hover:text-foreground"
              >
                <ChevronRight className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </div>

      {groups.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card px-6 py-12 text-center">
          <Clapperboard className="mb-3 h-8 w-8 text-muted-foreground/30" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">No videos yet.</p>
          <p className="mt-1 text-xs text-muted-foreground/70">
            Video guides added to courses will appear here.
          </p>
        </div>
      ) : searching ? (
        <div>
          <p className="sr-only" aria-live="polite">
            {searchResults.length} {searchResults.length === 1 ? "result" : "results"} shown
          </p>
          {searchResults.length > 0 ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {searchResults.map(({ group, track, video }) => (
                <VideoCard
                  key={video.lessonId}
                  video={video}
                  trackTitle={track.trackTitle}
                  trackSlug={track.trackSlug}
                  category={group.category}
                  onWatch={onWatch}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card px-6 py-12 text-center">
              <p className="text-sm text-muted-foreground">No videos match &ldquo;{query.trim()}&rdquo;.</p>
              <p className="mt-1 text-xs text-muted-foreground/70">Try a different search.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          <div
            ref={trackRef}
            className="flex snap-x gap-3.5 overflow-x-auto pb-1 md:grid md:grid-cols-4 md:overflow-visible md:pb-0"
          >
            {groups.map((group) => (
              <Link
                key={group.category}
                href={`#category-${slugify(group.category)}`}
                className="group relative aspect-[4/3] w-[70%] shrink-0 snap-start overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/25 via-card to-secondary min-[480px]:w-[45%] md:w-auto"
              >
                <div className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
                  <Clapperboard
                    className="h-16 w-16 text-primary/20 transition duration-300 group-hover:scale-105"
                    strokeWidth={1.5}
                  />
                </div>
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 text-center">
                  <p className="text-xs font-semibold leading-snug text-white drop-shadow-sm md:text-sm">
                    {group.category}
                    <span className="mt-1 block text-[11px] font-medium text-white/70">
                      {group.videoCount} {group.videoCount === 1 ? "video" : "videos"}
                    </span>
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {groups.map((group) => (
            <div key={group.category} id={`category-${slugify(group.category)}`} className="scroll-mt-4 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-heading text-base font-bold text-foreground">{group.category}</h4>
                <span className="text-xs font-medium text-muted-foreground">
                  {group.videoCount} {group.videoCount === 1 ? "video" : "videos"}
                </span>
              </div>
              {group.tracks.map((track) => (
                <div key={track.trackId} className="space-y-2.5">
                  <Link
                    href={`/learn/${track.trackSlug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition hover:text-primary"
                  >
                    {track.trackTitle}
                    <ChevronRight className="h-3 w-3" aria-hidden="true" />
                  </Link>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {track.videos.map((video) => (
                      <VideoCard
                        key={video.lessonId}
                        video={video}
                        trackTitle={track.trackTitle}
                        trackSlug={track.trackSlug}
                        category={group.category}
                        onWatch={onWatch}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
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
  groups,
}: {
  user: LibraryUser;
  groups: CategoryVideoGroup[];
}) {
  const [query, setQuery] = React.useState("");
  const [activeVideo, setActiveVideo] = React.useState<WatchTarget | null>(null);

  return (
    <>
      <VideoHeader user={user} query={query} onQueryChange={setQuery} />
      <div className="space-y-6 overflow-y-auto p-5 md:p-6">
        <CategoryShortcuts groups={groups} />
        <HeroBanner />
        <LibrarySection groups={groups} query={query} onWatch={setActiveVideo} />
      </div>
      <WatchModal
        key={activeVideo?.lessonId ?? "closed"}
        target={activeVideo}
        onClose={() => setActiveVideo(null)}
      />
    </>
  );
}
