import * as React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLearningTrackBySlug, getTrackModulesWithLessons, getUserProgressByTrack } from "@/lib/learning-data";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { ArrowLeft, CheckCircle2, Circle, BookOpen, Code2, Terminal, ChevronRight } from "lucide-react";
import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://techtribe.app";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const track = await getLearningTrackBySlug(slug);
  if (!track) return { title: "Path not found" };
  return {
    title: `${track.title} — TechTribe`,
    description: track.description || `Start the ${track.title} learning path on TechTribe.`,
    alternates: { canonical: `${siteUrl}/learn/${track.slug}` },
  };
}

function ProgressBar({ percentage }: { percentage: number }) {
  return (
    <div className="h-2 rounded-full bg-muted overflow-hidden">
      <div
        className="h-full rounded-full bg-[#00FC90] transition-all duration-500"
        style={{ width: `${Math.min(percentage, 100)}%` }}
      />
    </div>
  );
}

export default async function TrackDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const track = await getLearningTrackBySlug(slug);
  if (!track) notFound();

  const modules = await getTrackModulesWithLessons(track.id);

  let progressMap = new Map<string, true>();
  let userId: string | null = null;

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createServerSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        userId = user.id;
        const allLessonIds = modules.flatMap((m) => m.lessons.map((l) => l.id));
        const progress = await getUserProgressByTrack(user.id, track.id);
        progressMap = new Map(progress.map((p) => [p.lessonId, true as const]));
      }
    } catch { /* not authenticated */ }
  }

  const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0);
  const completedLessons = progressMap.size;
  const progressPct = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <Link
          href="/learn"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          All paths
        </Link>

        {/* Track header */}
        <div className="mb-8">
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">
            {track.title}
          </h1>
          {track.description && (
            <p className="mt-2 text-muted-foreground max-w-2xl">{track.description}</p>
          )}

          {/* Progress summary */}
          <div className="mt-6 flex flex-wrap items-center gap-4 p-4 rounded-lg bg-card border border-border">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <BookOpen className="h-4 w-4" />
              <span>{totalLessons} lessons</span>
            </div>
            {userId && (
              <>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-[#00FC90]" />
                  <span>{completedLessons} completed</span>
                </div>
                <div className="flex-1 min-w-[120px]">
                  <ProgressBar percentage={progressPct} />
                </div>
                <span className="text-xs font-medium text-muted-foreground">
                  {Math.round(progressPct)}%
                </span>
              </>
            )}
          </div>
        </div>

        {/* Module tree */}
        <div className="space-y-6">
          {modules.length === 0 ? (
            <div className="text-center py-12">
              <Terminal className="mx-auto h-8 w-8 text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">This path has no modules yet.</p>
            </div>
          ) : (
            modules.map((mod, modIdx) => (
              <div key={mod.id} className="rounded-xl border border-border bg-card overflow-hidden">
                {/* Module header */}
                <div className="flex items-start gap-3 p-4 sm:p-5 bg-muted/30">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary flex-shrink-0">
                    {modIdx + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="font-heading text-base font-semibold text-foreground">
                      {mod.title}
                    </h2>
                    {mod.description && (
                      <p className="text-sm text-muted-foreground mt-0.5">{mod.description}</p>
                    )}
                  </div>
                </div>

                {/* Lesson list */}
                <div className="divide-y divide-border">
                  {mod.lessons.map((lesson) => {
                    const completed = progressMap.has(lesson.id);
                    return (
                      <Link
                        key={lesson.id}
                        href={`/learn/${track.slug}/${lesson.id}`}
                        className="flex items-center gap-3 px-4 sm:px-5 py-3 hover:bg-muted/20 transition-colors group"
                      >
                        <div className="flex-shrink-0">
                          {completed ? (
                            <CheckCircle2 className="h-5 w-5 text-[#00FC90]" />
                          ) : lesson.isProject ? (
                            <Code2 className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <Circle className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-medium ${completed ? "text-[#00FC90]" : "text-foreground"} group-hover:text-primary transition-colors`}>
                              {lesson.title}
                            </span>
                            {lesson.isProject && (
                              <span className="rounded-full border border-primary/30 px-2 py-0.5 text-[10px] font-medium text-primary">
                                Project
                              </span>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary transition-colors flex-shrink-0" />
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
