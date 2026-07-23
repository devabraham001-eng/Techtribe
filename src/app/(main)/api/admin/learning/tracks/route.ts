import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

interface LessonResponse {
  id: string;
  module_id: string;
  title: string;
  content: string | null;
  is_project: boolean;
  project_prompt: string | null;
  sort_order: number;
  created_at: string;
}

interface ModuleResponse {
  id: string;
  track_id: string;
  title: string;
  description: string | null;
  sort_order: number;
  created_at: string;
  lessons: LessonResponse[];
}

interface TrackResponse {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  cover_image_url: string | null;
  category: string | null;
  lesson_count: number;
  created_at: string;
  modules: ModuleResponse[];
}

export const dynamic = "force-dynamic";

async function checkStaff(supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data } = await supabase.from("authors").select("is_staff").eq("user_id", user.id).single();
  return (data as { is_staff: boolean } | null)?.is_staff ?? false;
}

export async function GET() {
  const supabase = await createServerSupabaseClient();
  if (!(await checkStaff(supabase))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data: tracks } = await supabase.from("learning_tracks").select("*").order("created_at", { ascending: false });
  const { data: modules } = await supabase.from("track_modules").select("*").order("sort_order", { ascending: true });
  const { data: lessons } = await supabase.from("lessons").select("*").order("sort_order", { ascending: true });

  const modulesByTrack = new Map<string, typeof modules>();
  for (const mod of modules ?? []) {
    const list = modulesByTrack.get((mod as Record<string, unknown>).track_id as string) ?? [];
    list.push(mod);
    modulesByTrack.set((mod as Record<string, unknown>).track_id as string, list);
  }

  const lessonsByModule = new Map<string, typeof lessons>();
  for (const lesson of lessons ?? []) {
    const list = lessonsByModule.get((lesson as Record<string, unknown>).module_id as string) ?? [];
    list.push(lesson);
    lessonsByModule.set((lesson as Record<string, unknown>).module_id as string, list);
  }

  const result = (tracks ?? []).map((track) => {
    const trackRecord = track as Record<string, unknown>;
    const mods = modulesByTrack.get(trackRecord.id as string) ?? [];
    return {
      ...trackRecord,
      modules: mods.map((mod) => {
        const modRecord = mod as Record<string, unknown>;
        return {
          ...modRecord,
          lessons: lessonsByModule.get(modRecord.id as string) ?? [],
        };
      }),
    };
  });

  return NextResponse.json(result);
}

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  if (!(await checkStaff(supabase))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { title, description, slug, cover_image_url, category } = body;

  if (!title || !slug) {
    return NextResponse.json({ error: "title and slug are required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("learning_tracks")
    .insert({ title, description, slug, cover_image_url, category } as never)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
