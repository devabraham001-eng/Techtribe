"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn, getInitials } from "@/lib/utils";
import {
  Flame,
  GraduationCap,
  Trophy,
  ArrowRight,
  Clock,
  Users,
} from "lucide-react";

interface Mentor {
  id: string;
  name: string;
  avatarUrl: string | null;
  bio: string | null;
  status: string | null;
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
  recentLessons: RecentLesson[];
  mentors: Mentor[];
}

function ProgressRing({
  percentage,
  size = 80,
  strokeWidth = 6,
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

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
}

function getStatusLabel(status: string | null): string {
  if (!status) return "Instructor";
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
      return "Instructor";
  }
}

export function LearnDashboard({
  user,
  stats,
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

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* ===== TOP ROW ===== */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
          {/* — Micro Progress Trackers — */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card className="bg-card border-border">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <GraduationCap className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground">Lessons completed</p>
                  <p className="text-lg font-bold text-foreground tabular-nums">
                    {stats.completedLessons}
                    <span className="text-sm font-normal text-muted-foreground">
                      /{stats.totalLessons}
                    </span>
                  </p>
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-border">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-500"
                      style={{ width: `${completionPct}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-500/10">
                  <Flame className="h-5 w-5 text-orange-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground">Day streak</p>
                  <p className="text-lg font-bold text-foreground tabular-nums">
                    {stats.streak}
                    <span className="ml-1 text-sm">🔥</span>
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
                  <Trophy className="h-5 w-5 text-emerald-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground">Challenges passed</p>
                  <p className="text-lg font-bold text-foreground tabular-nums">
                    {stats.challengesPassed}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* — User Statistics Widget — */}
          <Card className="bg-card border-border">
            <CardContent className="flex flex-col items-center p-6 text-center">
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
                {completionPct}% overall completion
              </p>
              <div className="mt-4 grid w-full grid-cols-2 gap-3">
                <div className="rounded-lg bg-secondary p-2">
                  <p className="text-xs text-muted-foreground">Projects</p>
                  <p className="text-sm font-bold text-foreground tabular-nums">
                    {stats.projectsSubmitted}
                  </p>
                </div>
                <div className="rounded-lg bg-secondary p-2">
                  <p className="text-xs text-muted-foreground">Challenges</p>
                  <p className="text-sm font-bold text-foreground tabular-nums">
                    {stats.challengesPassed}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ===== BOTTOM ROW ===== */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
          {/* — Your Lessons — */}
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="font-heading text-base font-semibold text-foreground">
                Your Lessons
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
                  {recentLessons.map((row) => (
                    <Link
                      key={row.id}
                      href={`/learn/${row.lesson.track.slug}/${row.lesson.id}`}
                      className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-card-hover"
                    >
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-secondary">
                        {row.lesson.track.coverImageUrl ? (
                          <Image
                            src={row.lesson.track.coverImageUrl}
                            alt={row.lesson.track.title}
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <span className="text-xs font-bold text-muted-foreground/30">
                              TT
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          {row.lesson.track.category && (
                            <Badge
                              variant="secondary"
                              className="h-4 shrink-0 px-1.5 text-[9px] uppercase tracking-wider"
                            >
                              {row.lesson.track.category}
                            </Badge>
                          )}
                          <h4 className="truncate text-sm font-medium text-foreground">
                            {row.lesson.title}
                          </h4>
                        </div>
                        <div className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>
                            {new Date(row.completedAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="shrink-0 text-xs text-primary hover:text-primary/80"
                        asChild
                      >
                        <span>Review</span>
                      </Button>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* — Your Mentors — */}
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="font-heading text-base font-semibold text-foreground">
                Your Mentors
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
                <div className="divide-y divide-border">
                  {mentors.map((mentor) => (
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
                        variant={followedIds.has(mentor.id) ? "default" : "outline"}
                        size="sm"
                        className={cn(
                          "h-7 shrink-0 px-2.5 text-[11px] font-medium",
                          followedIds.has(mentor.id) && "bg-primary text-primary-foreground"
                        )}
                        onClick={() => toggleFollow(mentor.id)}
                      >
                        {followedIds.has(mentor.id) ? "Following" : "+ Follow"}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
