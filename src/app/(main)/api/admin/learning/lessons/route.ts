import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function checkStaff(supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data } = await supabase.from("authors").select("is_staff").eq("user_id", user.id).single();
  return (data as { is_staff: boolean } | null)?.is_staff ?? false;
}

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  if (!(await checkStaff(supabase))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { module_id, title, content, is_project, project_prompt, sort_order } = body;

  if (!module_id || !title) {
    return NextResponse.json({ error: "module_id and title are required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("lessons")
    .insert({
      module_id,
      title,
      content,
      is_project: is_project ?? false,
      project_prompt: project_prompt ?? null,
      sort_order: sort_order ?? 0,
    } as never)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
