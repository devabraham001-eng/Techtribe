import * as React from "react";
import { notFound } from "next/navigation";
import { getLearningTrackBySlug, getTrackModulesWithLessons, getLessonById } from "@/lib/learning-data";
import { LessonTabs } from "@/components/learn/LessonTabs";
import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://techtribe.app";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ trackSlug: string; lessonId: string }>;
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
  params: Promise<{ trackSlug: string; lessonId: string }>;
}) {
  const { trackSlug, lessonId } = await params;
  const [track, lesson] = await Promise.all([
    getLearningTrackBySlug(trackSlug),
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
      <LessonTabs
        lesson={lesson}
        trackSlug={track.slug}
        prevLesson={prevLesson}
        nextLesson={nextLesson}
      />
    </div>
  );
}
