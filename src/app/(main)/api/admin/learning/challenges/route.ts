import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

async function checkStaff(supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data } = await supabase.from("authors").select("is_staff").eq("user_id", user.id).single();
  return (data as { is_staff: boolean } | null)?.is_staff ?? false;
}

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  if (!(await checkStaff(supabase))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const lessonId = searchParams.get("lessonId");

  let query = supabase.from("lesson_challenges").select("*");
  if (lessonId) {
    query = query.eq("lesson_id", lessonId);
  }
  const { data } = await query.order("order_index");

  return NextResponse.json(data ?? []);
}

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  if (!(await checkStaff(supabase))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { lesson_id, title, description, starter_code, solution_code, test_code, language, difficulty, order_index } = body;

  if (!lesson_id || !title) {
    return NextResponse.json({ error: "lesson_id and title are required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("lesson_challenges")
    .insert({
      lesson_id,
      title,
      description,
      starter_code: starter_code || "",
      solution_code,
      test_code,
      language: language || "javascript",
      difficulty: difficulty || "beginner",
      order_index: order_index || 0,
    } as never)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
