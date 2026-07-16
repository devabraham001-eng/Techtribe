import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { Database } from "@/types/database";

type PostViewRow = Database["public"]["Tables"]["post_views"]["Row"];

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const { data: authorData } = await supabase
    .from("authors")
    .select("id")
    .eq("user_id", user.id)
    .single();
  const author = authorData as { id: string } | null;

  if (!author) {
    return NextResponse.json({ error: "Author profile not found." }, { status: 403 });
  }

  const { data: post } = await supabase
    .from("posts")
    .select("author_id")
    .eq("id", id)
    .single();
  const postRow = post as { author_id: string } | null;

  if (!postRow || postRow.author_id !== author.id) {
    return NextResponse.json({ error: "Post not found." }, { status: 404 });
  }

  const { data: views, error } = await supabase
    .from("post_views")
    .select("*")
    .eq("post_id", id)
    .order("viewed_at", { ascending: false })
    .limit(100);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ views: views as PostViewRow[] });
}
