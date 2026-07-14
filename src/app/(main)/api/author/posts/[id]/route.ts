import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { Database } from "@/types/database";

type PostUpdate = Database["public"]["Tables"]["posts"]["Update"];
type PostRow = Database["public"]["Tables"]["posts"]["Row"];
type AuthorPostUpdate = PostUpdate & Pick<PostRow, "updated_at">;

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

  const { data: authorData, error: authorError } = await supabase
    .from("authors")
    .select("id")
    .eq("user_id", user.id)
    .single();
  const author = authorData as { id: string } | null;

  if (authorError || !author) {
    return NextResponse.json({ error: "Author profile not found." }, { status: 403 });
  }

  const { data: post, error } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .eq("author_id", author.id)
    .single();

  if (error || !post) {
    return NextResponse.json({ error: "Post not found." }, { status: 404 });
  }

  return NextResponse.json({ post });
}

export async function PUT(
  request: Request,
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

  const { data: authorData, error: authorError } = await supabase
    .from("authors")
    .select("id, is_staff")
    .eq("user_id", user.id)
    .single();
  const author = authorData as Pick<PostRow, "id"> & { is_staff: boolean } | null;

  if (authorError || !author) {
    return NextResponse.json({ error: "Author profile not found." }, { status: 403 });
  }

  const { data: existing } = await supabase
    .from("posts")
    .select("author_id, status")
    .eq("id", id)
    .single();
  const post = existing as Pick<PostRow, "author_id" | "status"> | null;

  if (!post) {
    return NextResponse.json({ error: "Post not found." }, { status: 404 });
  }

  if (post.author_id !== author.id) {
    return NextResponse.json({ error: "You can only edit your own posts." }, { status: 403 });
  }

  const body = await request.json();
  const updates: Partial<AuthorPostUpdate> = {};

  if (typeof body.title === "string") {
    const title = body.title.trim();
    if (title.length < 5) {
      return NextResponse.json({ error: "Title must be at least 5 characters." }, { status: 400 });
    }
    updates.title = title;
  }
  if (typeof body.excerpt === "string") {
    updates.excerpt = body.excerpt.trim() || null;
  }
  if (typeof body.contentMdx === "string") {
    const contentMdx = body.contentMdx.trim();
    if (!contentMdx) {
      return NextResponse.json({ error: "Article content is required." }, { status: 400 });
    }
    updates.content_mdx = contentMdx;
  }
  if (typeof body.categoryId === "string" && body.categoryId) {
    updates.category_id = body.categoryId;
  } else if (body.categoryId === null || body.categoryId === "") {
    updates.category_id = null;
  }
  if (Array.isArray(body.tagIds)) {
    updates.tags = body.tagIds.filter((t: unknown) => typeof t === "string");
  }

  if (body.status === "published" || body.status === "draft") {
    const targetStatus = body.status;
    if (targetStatus === "published" && !author.is_staff && post.status !== "published") {
      return NextResponse.json({ error: "Only staff authors can publish." }, { status: 403 });
    }
    updates.status = targetStatus;
    if (targetStatus === "published" && post.status !== "published") {
      updates.published_at = new Date().toISOString();
    }
  }
  updates.updated_at = new Date().toISOString();

  const { data: updated, error } = await supabase
    .from("posts")
    .update(updates as never)
    .eq("id", id)
    .select("id, slug, status")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ post: updated });
}

export async function DELETE(
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
    .select("id, is_staff")
    .eq("user_id", user.id)
    .single();
  const author = authorData as { id: string; is_staff: boolean } | null;

  if (!author) {
    return NextResponse.json({ error: "Author profile not found." }, { status: 403 });
  }

  const { data: existing } = await supabase
    .from("posts")
    .select("author_id, status")
    .eq("id", id)
    .single();
  const post = existing as { author_id: string; status: PostRow["status"] } | null;

  if (!post) {
    return NextResponse.json({ error: "Post not found." }, { status: 404 });
  }

  if (post.author_id !== author.id) {
    return NextResponse.json({ error: "You can only delete your own posts." }, { status: 403 });
  }

  if (post.status === "published" && !author.is_staff) {
    return NextResponse.json({ error: "Only staff authors can delete published posts." }, { status: 403 });
  }

  const { error } = await supabase.from("posts").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
