import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { LearningTrack, TrackModule, Lesson, UserLessonProgress } from "@/types/blog";
import type { Database } from "@/types/database";

type TrackRow = Database["public"]["Tables"]["learning_tracks"]["Row"];
type ModuleRow = Database["public"]["Tables"]["track_modules"]["Row"];
type LessonRow = Database["public"]["Tables"]["lessons"]["Row"];
type ProgressRow = Database["public"]["Tables"]["user_lesson_progress"]["Row"];

function mapTrack(row: TrackRow): LearningTrack {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    slug: row.slug,
    coverImageUrl: row.cover_image_url ?? undefined,
    category: row.category ?? undefined,
    lessonCount: row.lesson_count,
    createdAt: row.created_at,
  };
}

function mapModule(row: ModuleRow): TrackModule & { lessons: Lesson[] } {
  return {
    id: row.id,
    trackId: row.track_id,
    title: row.title,
    description: row.description ?? undefined,
    sortOrder: row.sort_order,
    lessons: [],
    createdAt: row.created_at,
  };
}

function mapLesson(row: LessonRow): Lesson {
  return {
    id: row.id,
    moduleId: row.module_id,
    title: row.title,
    content: row.content ?? undefined,
    isProject: row.is_project,
    projectPrompt: row.project_prompt ?? undefined,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
  };
}

function mapProgress(row: ProgressRow): UserLessonProgress {
  return {
    id: row.id,
    userId: row.user_id,
    lessonId: row.lesson_id,
    completedAt: row.completed_at,
    submittedProjectArticleId: row.submitted_project_article_id,
  };
}

export async function getLearningTracks(): Promise<LearningTrack[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("learning_tracks")
    .select("*")
    .order("title");

  return (data ?? []).map(mapTrack);
}

export async function getLearningTrackBySlug(slug: string): Promise<LearningTrack | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("learning_tracks")
    .select("*")
    .eq("slug", slug)
    .single();

  return data ? mapTrack(data as TrackRow) : null;
}

export async function getTrackModulesWithLessons(trackId: string): Promise<TrackModule[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = await createServerSupabaseClient();
  const { data: rawModules } = await supabase
    .from("track_modules")
    .select("*")
    .eq("track_id", trackId)
    .order("sort_order");

  const modules = (rawModules ?? []).map(mapModule);

  if (modules.length === 0) return [];

  const moduleIds = modules.map((m) => m.id);
  const { data: rawLessons } = await supabase
    .from("lessons")
    .select("*")
    .in("module_id", moduleIds)
    .order("sort_order");

  const lessons = (rawLessons ?? []).map(mapLesson);

  for (const mod of modules) {
    mod.lessons = lessons.filter((l) => l.moduleId === mod.id);
  }

  return modules;
}

export async function getLessonById(lessonId: string): Promise<Lesson | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("lessons")
    .select("*")
    .eq("id", lessonId)
    .single();

  return data ? mapLesson(data as LessonRow) : null;
}

export async function getUserProgress(
  userId: string,
  lessonIds: string[]
): Promise<UserLessonProgress[]> {
  if (!isSupabaseConfigured() || lessonIds.length === 0) return [];

  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("user_lesson_progress")
    .select("*")
    .eq("user_id", userId)
    .in("lesson_id", lessonIds);

  return (data ?? []).map(mapProgress);
}

export async function getUserProgressByTrack(
  userId: string,
  trackId: string
): Promise<UserLessonProgress[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = await createServerSupabaseClient();
  const { data: modules } = await supabase
    .from("track_modules")
    .select("id")
    .eq("track_id", trackId);

  if (!modules || modules.length === 0) return [];

  const moduleIds = modules.map((m: { id: string }) => m.id);
  const { data: lessons } = await supabase
    .from("lessons")
    .select("id")
    .in("module_id", moduleIds);

  if (!lessons || lessons.length === 0) return [];

  const lessonIds = lessons.map((l: { id: string }) => l.id);
  return getUserProgress(userId, lessonIds);
}
