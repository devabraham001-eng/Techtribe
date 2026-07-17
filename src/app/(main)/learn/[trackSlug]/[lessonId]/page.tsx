import * as React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLearningTrackBySlug, getTrackModulesWithLessons, getLessonById } from "@/lib/learning-data";
import { MdxRenderer } from "@/components/markdown/MdxRenderer";
import { LessonCompleteButton } from "@/components/learn/LessonCompleteButton";
import { ArrowLeft, BookOpen, CheckCircle2, Circle, Code2 } from "lucide-react";
import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://techtribe.app";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; lessonId: string }>;
}): Promise<Metadata> {
  const { lessonId } = await params;
  const lesson = await getLessonById(lessonId);
  if (!lesson) return { title: "Lesson not found" };
  return {
    title: `${lesson.title} — TechTribe`,
    description: lesson.isProject ? lesson.projectPrompt || lesson.title : lesson.title,
  };
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ slug: string; lessonId: string }>;
}) {
  const { slug, lessonId } = await params;
  const [track, lesson] = await Promise.all([
    getLearningTrackBySlug(slug),
    getLessonById(lessonId),
  ]);

  if (!track || !lesson) notFound();

  const modules = await getTrackModulesWithLessons(track.id);
  const allLessons = modules.flatMap((m) => m.lessons);
  const currentIdx = allLessons.findIndex((l) => l.id === lessonId);
  const prevLesson = currentIdx > 0 ? allLessons[currentIdx - 1] : null;
  const nextLesson = currentIdx < allLessons.length - 1 ? allLessons[currentIdx + 1] : null;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/learn" className="hover:text-foreground transition-colors">
            Paths
          </Link>
          <span>/</span>
          <Link href={`/learn/${track.slug}`} className="hover:text-foreground transition-colors">
            {track.title}
          </Link>
          <span>/</span>
          <span className="text-foreground truncate">{lesson.title}</span>
        </div>

        {/* Lesson header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            {lesson.isProject ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 px-3 py-0.5 text-xs font-medium text-primary">
                <Code2 className="h-3 w-3" />
                Project
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <BookOpen className="h-3 w-3" />
                Lesson
              </span>
            )}
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-foreground">
            {lesson.title}
          </h1>
        </div>

        {/* Lesson content */}
        <div className="prose prose-sm dark:prose-invert max-w-none mb-12">
          {lesson.content ? (
            <MdxRenderer content={lesson.content} />
          ) : lesson.isProject && lesson.projectPrompt ? (
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="font-heading text-lg font-semibold text-foreground mb-3">Project Brief</h2>
              <p className="text-muted-foreground whitespace-pre-line">{lesson.projectPrompt}</p>
            </div>
          ) : (
            <p className="text-muted-foreground">No content yet.</p>
          )}
        </div>

        {/* Actions */}
        <div className="border-t border-border pt-6">
          <LessonCompleteButton
            lessonId={lesson.id}
            isProject={lesson.isProject}
            trackSlug={track.slug}
          />

          {/* Prev / Next */}
          <div className="mt-6 flex items-center justify-between gap-4">
            {prevLesson ? (
              <Link
                href={`/learn/${track.slug}/${prevLesson.id}`}
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                {prevLesson.title}
              </Link>
            ) : (
              <div />
            )}
            {nextLesson && (
              <Link
                href={`/learn/${track.slug}/${nextLesson.id}`}
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors ml-auto"
              >
                {nextLesson.title}
                <ArrowLeft className="h-4 w-4 rotate-180" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
