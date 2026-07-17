import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export async function GET(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json([]);
  }

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const trackId = searchParams.get("trackId");
  const lessonIdsParam = searchParams.get("lessonIds");

  let query = supabase
    .from("user_lesson_progress")
    .select("*")
    .eq("user_id", user.id);

  if (trackId) {
    const { data: modules } = await supabase
      .from("track_modules")
      .select("id")
      .eq("track_id", trackId);

    if (modules && modules.length > 0) {
      const moduleIds = modules.map((m: { id: string }) => m.id);
      const { data: lessons } = await supabase
        .from("lessons")
        .select("id")
        .in("module_id", moduleIds);

      if (lessons && lessons.length > 0) {
        const lessonIds = lessons.map((l: { id: string }) => l.id);
        query = query.in("lesson_id", lessonIds);
      }
    }
  } else if (lessonIdsParam) {
    const lessonIds = lessonIdsParam.split(",");
    query = query.in("lesson_id", lessonIds);
  }

  const { data } = await query;
  return NextResponse.json(data ?? []);
}

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const body = await request.json() as { lessonId: string; submittedProjectArticleId?: string | null };

  if (!body.lessonId) {
    return NextResponse.json({ error: "lessonId is required" }, { status: 400 });
  }

  const insertData: Record<string, unknown> = {
    user_id: user.id,
    lesson_id: body.lessonId,
  };

  if (body.submittedProjectArticleId) {
    insertData.submitted_project_article_id = body.submittedProjectArticleId;
  }

  const { data, error } = await supabase
    .from("user_lesson_progress")
    .upsert(insertData as never, { onConflict: "user_id, lesson_id" })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data, { status: 201 });
}
