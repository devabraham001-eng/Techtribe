"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn, getInitials } from "@/lib/utils";
import {
  GraduationCap,
  ArrowRight,
  Users,
  Link2,
  ChevronLeft,
  ChevronRight,
  Play,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: "easeOut" as const } },
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

function ProgressRing({
  percentage,
  size = 96,
  strokeWidth = 7,
}: {
  percentage: number;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className="text-border"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="text-primary transition-all duration-700 ease-out"
      />
    </svg>
  );
}

function MiniBarChart({ data }: { data: ActivityData[] }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className="flex items-end gap-2 h-16 mt-3">
      {data.map((d) => (
        <div key={d.period} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full rounded-sm bg-primary/80 transition-all duration-500"
            style={{ height: `${(d.count / max) * 100}%`, minHeight: d.count > 0 ? 4 : 0 }}
          />
          <span className="text-[9px] text-muted-foreground">{d.period}</span>
        </div>
      ))}
    </div>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
}

function getStatusLabel(status: string | null): string {
  if (!status) return "Mentor";
  switch (status) {
    case "mentoring":
      return "Mentor";
    case "open_for_mentorship":
      return "Available";
    case "open_to_work":
      return "Open to work";
    case "hiring":
      return "Hiring";
    default:
      return "Mentor";
  }
}

export function LearnDashboard({
  user,
  stats,
  trackProgress,
  continueWatching,
  activityData,
  recentLessons,
  mentors,
}: LearnDashboardProps) {
  const [followedIds, setFollowedIds] = React.useState<Set<string>>(new Set());
  const [greeting] = React.useState(getGreeting);
  const completionPct =
    stats.totalLessons > 0
      ? Math.round((stats.completedLessons / stats.totalLessons) * 100)
      : 0;

  function toggleFollow(id: string) {
    setFollowedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  // Top 3 tracks with progress for micro trackers
  const topTracks = trackProgress
    .filter((t) => t.completedLessons > 0)
    .sort((a, b) => b.completedLessons - a.completedLessons)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl p-4 sm:p-6 space-y-6">
        {/* ===== HERO BANNER ===== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/20 via-primary/10 to-background p-6 sm:p-8 border border-primary/20"
        >
          <div className="relative z-10 max-w-lg">
            <Badge className="mb-3 bg-primary/20 text-primary border-primary/30 text-[10px] uppercase tracking-wider">
              Online Course
            </Badge>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-foreground leading-tight">
              Sharpen Your Skills with Professional Online Courses
            </h1>
            <Button className="mt-4 gap-2" size="sm">
              <Play className="h-4 w-4" />
              Join Now
            </Button>
          </div>
          <div className="absolute right-0 top-0 h-full w-1/3 opacity-10 pointer-events-none">
            <svg viewBox="0 0 200 200" className="h-full w-full">
              <circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary" />
              <circle cx="100" cy="100" r="60" fill="none" stroke="currentColor" strokeWidth="1" className="text-primary" />
              <circle cx="100" cy="100" r="40" fill="none" stroke="currentColor" strokeWidth="1" className="text-primary" />
            </svg>
          </div>
        </motion.div>

        {/* ===== MAIN GRID ===== */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
          {/* — LEFT COLUMN — */}
          <div className="space-y-6">
            {/* — Micro Progress Trackers — */}
            {topTracks.length > 0 && (
              <motion.div
                variants={stagger}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-40px" }}
                className="grid grid-cols-1 gap-4 sm:grid-cols-3"
              >
                {topTracks.map((track) => {
                  const pct = track.totalLessons > 0 ? Math.round((track.completedLessons / track.totalLessons) * 100) : 0;
                  return (
                    <motion.div key={track.id} variants={fadeUp}>
                      <Link
                        href={`/learn/${track.slug}`}
                        className="group block"
                      >
                        <Card className="bg-card border-border hover:border-primary/30 transition-colors">
                          <CardContent className="flex items-center gap-4 p-4">
                            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-secondary">
                              <ProgressRing percentage={pct} size={48} strokeWidth={4} />
                              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-foreground">
                                {track.completedLessons}/{track.totalLessons}
                              </span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs text-muted-foreground">watched</p>
                              <p className="text-sm font-semibold text-foreground truncate">
                                {track.title}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}

            {/* — Continue Watching — */}
            {continueWatching.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-heading text-lg font-semibold text-foreground">
                    Continue Watching
                  </h2>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" className="h-7 w-7">
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="h-7 w-7">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <motion.div
                  variants={stagger}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-40px" }}
                  className="grid grid-cols-1 gap-4 sm:grid-cols-3"
                >
                  {continueWatching.map((item) => (
                    <motion.div key={item.id} variants={scaleIn}>
                      <Link
                        href={`/learn/${item.trackSlug}`}
                        className="group block"
                      >
                        <Card className="bg-card border-border overflow-hidden hover:border-primary/30 transition-colors">
                          <div className="relative aspect-video bg-secondary">
                            {item.coverImageUrl ? (
                              <Image
                                src={item.coverImageUrl}
                                alt={item.trackTitle}
                                fill
                                sizes="(max-width: 640px) 100vw, 33vw"
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <span className="text-3xl font-heading font-bold text-primary/15">TT</span>
                              </div>
                            )}
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="h-10 w-10 rounded-full bg-background/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Play className="h-4 w-4 text-foreground ml-0.5" />
                              </div>
                            </div>
                            {item.trackCategory && (
                              <Badge className="absolute top-2 left-2 bg-background/80 text-foreground border-border text-[9px] uppercase tracking-wider">
                                {item.trackCategory}
                              </Badge>
                            )}
                          </div>
                          <CardContent className="p-3">
                            <h3 className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                              {item.lessonTitle}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-1">
                              {item.trackTitle}
                            </p>
                          </CardContent>
                        </Card>
                      </Link>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            )}

            {/* — Your Lessons Table — */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <Card className="bg-card border-border">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="font-heading text-base font-semibold text-foreground">
                    Your Lesson
                  </CardTitle>
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                  >
                    See all <ArrowRight className="h-3 w-3" />
                  </Link>
                </CardHeader>
                <CardContent className="p-0">
                  {recentLessons.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <GraduationCap className="mb-3 h-8 w-8 text-muted-foreground/30" />
                      <p className="text-sm text-muted-foreground">
                        No lessons completed yet.
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground/70">
                        Start learning to see your progress here.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border">
                      {/* Header */}
                      <div className="grid grid-cols-[1fr_auto_1fr_auto] gap-4 px-6 py-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                        <span>Mentor</span>
                        <span>Type</span>
                        <span>Desc</span>
                        <span>Action</span>
                      </div>
                      {recentLessons.map((row) => (
                        <Link
                          key={row.id}
                          href={`/learn/${row.lesson.track.slug}/${row.lesson.id}`}
                          className="grid grid-cols-[1fr_auto_1fr_auto] gap-4 items-center px-6 py-3 transition-colors hover:bg-card-hover"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-secondary">
                              {row.lesson.track.coverImageUrl ? (
                                <Image
                                  src={row.lesson.track.coverImageUrl}
                                  alt={row.lesson.track.title}
                                  fill
                                  sizes="32px"
                                  className="object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center">
                                  <span className="text-[8px] font-bold text-muted-foreground/30">TT</span>
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">{row.lesson.track.title}</p>
                              <p className="text-[10px] text-muted-foreground">
                                {new Date(row.completedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                              </p>
                            </div>
                          </div>
                          <div>
                            {row.lesson.track.category && (
                              <Badge variant="secondary" className="text-[9px] uppercase tracking-wider">
                                {row.lesson.track.category}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">{row.lesson.title}</p>
                          <div className="flex items-center justify-center h-7 w-7 rounded-full border border-border">
                            <ArrowRight className="h-3 w-3 text-muted-foreground" />
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* — RIGHT SIDEBAR — */}
          <div className="space-y-6">
            {/* — Statistics — */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <Card className="bg-card border-border">
                <CardContent className="flex flex-col items-center p-6 text-center">
                  <h3 className="text-sm font-semibold text-muted-foreground mb-4">Statistic</h3>
                  <div className="relative mb-4">
                    <ProgressRing percentage={completionPct} size={96} strokeWidth={7} />
                    <Avatar className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 border-2 border-background">
                      <AvatarImage src={user.avatarUrl ?? ""} alt={user.name} />
                      <AvatarFallback className="text-sm">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <h2 className="font-heading text-lg font-bold text-foreground">
                    {greeting}, {user.firstName} 🔥
                  </h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Complete your learning to achieve your target
                  </p>
                  <div className="w-full mt-4">
                    <MiniBarChart data={activityData} />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* — Your Mentor — */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            >
              <Card className="bg-card border-border">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="font-heading text-base font-semibold text-foreground">
                    Your mentor
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="p-0">
                  {mentors.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Users className="mb-3 h-8 w-8 text-muted-foreground/30" />
                      <p className="text-sm text-muted-foreground">No mentors found.</p>
                    </div>
                  ) : (
                    <>
                      <div className="divide-y divide-border">
                        {mentors.slice(0, 3).map((mentor) => (
                          <div
                            key={mentor.id}
                            className="flex items-center gap-3 px-6 py-3"
                          >
                            <Avatar className="h-9 w-9">
                              <AvatarImage src={mentor.avatarUrl ?? ""} alt={mentor.name} />
                              <AvatarFallback className="text-xs">
                                {getInitials(mentor.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-foreground">
                                {mentor.name}
                              </p>
                              <p className="text-[11px] text-muted-foreground">
                                {getStatusLabel(mentor.status)}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className={cn(
                                "h-7 shrink-0 px-2 text-[11px] font-medium gap-1",
                                followedIds.has(mentor.id)
                                  ? "text-primary"
                                  : "text-muted-foreground"
                              )}
                              onClick={() => toggleFollow(mentor.id)}
                            >
                              <Link2 className="h-3 w-3" />
                              {followedIds.has(mentor.id) ? "Following" : "Follow"}
                            </Button>
                          </div>
                        ))}
                      </div>
                      {mentors.length > 3 && (
                        <div className="px-6 py-3 border-t border-border">
                          <Button variant="outline" size="sm" className="w-full text-xs">
                            See All
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
