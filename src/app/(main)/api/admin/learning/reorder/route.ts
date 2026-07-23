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
  const { type, items } = body as {
    type: "module" | "lesson";
    items: { id: string; sort_order: number }[];
  };

  if (!type || !items || !Array.isArray(items)) {
    return NextResponse.json({ error: "type and items array required" }, { status: 400 });
  }

  const table = type === "module" ? "track_modules" : "lessons";

  const errors: string[] = [];
  for (const item of items) {
    const { error } = await supabase
      .from(table)
      .update({ sort_order: item.sort_order } as never)
      .eq("id", item.id);

    if (error) errors.push(error.message);
  }

  if (errors.length > 0) {
    return NextResponse.json({ error: errors.join("; ") }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
