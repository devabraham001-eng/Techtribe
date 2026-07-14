import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { Database } from "@/types/database";

type PostStatus = Database["public"]["Tables"]["posts"]["Row"]["status"];

const ALLOWED_STATUSES: PostStatus[] = ["draft", "review", "scheduled", "published", "archived"];

async function requireStaff() {
  if (!isSupabaseConfigured()) {
    return { error: NextResponse.json({ error: "Supabase is not configured." }, { status: 503 }) };
  }

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: NextResponse.json({ error: "Authentication required." }, { status: 401 }) };
  }

  const { data: authorRows } = await supabase
    .from("authors")
    .select("is_staff")
    .eq("user_id", user.id)
    .single();

  if (!(authorRows as unknown as { is_staff: boolean } | null)?.is_staff) {
    return { error: NextResponse.json({ error: "Forbidden." }, { status: 403 }) };
  }

  return { supabase };
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { supabase, error: authError } = await requireStaff();
  if (authError) return authError;

  const body = await request.json();
  const status = typeof body.status === "string" ? body.status : "";
  if (!ALLOWED_STATUSES.includes(status as PostStatus)) {
    return NextResponse.json({ error: "Invalid post status." }, { status: 400 });
  }

  const updates: Partial<Database["public"]["Tables"]["posts"]["Row"]> = {
    status: status as PostStatus,
    updated_at: new Date().toISOString(),
  };

  if (status === "published") {
    const { data: existing } = await supabase
      .from("posts")
      .select("published_at")
      .eq("id", id)
      .single();
    if (!(existing as { published_at: string | null } | null)?.published_at) {
      updates.published_at = new Date().toISOString();
    }
  }

  const { data, error } = await supabase
    .from("posts")
    .update(updates as never)
    .eq("id", id)
    .select("id, slug, title, status, view_count, published_at, created_at, author_id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ post: data });
}
