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
  const category = searchParams.get("category");

  let query = supabase.from("workloads").select("*");
  if (category) query = query.eq("category", category);
  const { data } = await query.order("sort_order");

  return NextResponse.json(data ?? []);
}

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  if (!(await checkStaff(supabase))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { title, brief, category, difficulty, xp_reward, starter_files, hidden_tests, sort_order, is_active } = body;

  if (!title || !brief || !category) {
    return NextResponse.json({ error: "title, brief and category are required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("workloads")
    .insert({
      title,
      brief,
      category,
      difficulty: difficulty || "beginner",
      xp_reward: xp_reward ?? 100,
      starter_files: starter_files || [],
      hidden_tests: hidden_tests || [],
      sort_order: sort_order || 0,
      is_active: is_active ?? true,
    } as never)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
