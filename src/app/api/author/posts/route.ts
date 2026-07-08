import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { slugify } from "@/lib/utils";
import type { Database } from "@/types/database";

type PostInsert = Database["public"]["Tables"]["posts"]["Insert"];
type AuthorRow = Database["public"]["Tables"]["authors"]["Row"];

interface CreatePostBody {
  title?: unknown;
  excerpt?: unknown;
  contentMdx?: unknown;
  categoryId?: unknown;
  tagIds?: unknown;
  status?: unknown;
}

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  const body = (await request.json()) as CreatePostBody;
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const excerpt = typeof body.excerpt === "string" ? body.excerpt.trim() : "";
  const contentMdx = typeof body.contentMdx === "string" ? body.contentMdx.trim() : "";
  const categoryId = typeof body.categoryId === "string" && body.categoryId ? body.categoryId : null;
  const tagIds = Array.isArray(body.tagIds)
    ? body.tagIds.filter((tag): tag is string => typeof tag === "string")
    : [];
  const requestedStatus = body.status === "published" ? "published" : "draft";

  if (title.length < 5 || !contentMdx) {
    return NextResponse.json(
      { error: "A title and article content are required." },
      { status: 400 }
    );
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const { data: authorData, error: authorError } = await supabase
    .from("authors")
    .select("*")
    .eq("user_id", user.id)
    .single();
  const author = authorData as AuthorRow | null;

  if (authorError || !author) {
    return NextResponse.json(
      { error: "Your author profile is missing. Re-run the latest Supabase schema." },
      { status: 403 }
    );
  }

  const status = requestedStatus === "published" && author.is_staff ? "published" : "draft";
  const slug = `${slugify(title)}-${crypto.randomUUID().slice(0, 8)}`;
  const now = new Date().toISOString();
  const payload: PostInsert = {
    slug,
    title,
    excerpt: excerpt || null,
    content_mdx: contentMdx,
    content_html: null,
    cover_image_url: null,
    cover_image_alt: null,
    status,
    visibility: "public",
    published_at: status === "published" ? now : null,
    scheduled_at: null,
    author_id: author.id,
    category_id: categoryId,
    tags: tagIds,
    seo_title: null,
    seo_description: excerpt || null,
    seo_keywords: [],
    canonical_url: null,
    og_image_url: null,
    reading_time: 0,
    ad_enabled: true,
    is_featured: false,
    is_trending: false,
  };

  const { data: post, error } = await supabase
    .from("posts")
    .insert(payload as never)
    .select("id, slug, status")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ post }, { status: 201 });
}
