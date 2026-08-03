import { NextResponse } from "next/server";
import { createServerSupabaseClient, createAdminSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: authorData } = await supabase
    .from("authors")
    .select("is_staff")
    .eq("user_id", user.id)
    .single();
  const author = authorData as { is_staff: boolean } | null;

  if (!author?.is_staff) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const before = typeof body?.before === "string" && body.before ? body.before : null;

  let cutoff: Date | null = null;
  if (before) {
    cutoff = new Date(before);
    if (isNaN(cutoff.getTime())) {
      return NextResponse.json({ error: "Invalid date" }, { status: 400 });
    }
  }

  const admin = createAdminSupabaseClient();
  if (!admin) {
    return NextResponse.json(
      { error: "Analytics deletion requires SUPABASE_SERVICE_ROLE_KEY to be configured" },
      { status: 503 }
    );
  }

  let query = admin.from("page_views").delete({ count: "exact" });
  if (cutoff) {
    query = query.lt("created_at", cutoff.toISOString());
  }

  const { error, count } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, deletedCount: count ?? 0 });
}
