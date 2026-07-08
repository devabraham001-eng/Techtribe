import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";

export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );
}

export async function getPublishedPosts(options?: {
  category?: string;
  tag?: string;
  author?: string;
  limit?: number;
  offset?: number;
  featured?: boolean;
}) {
  const supabase = await createServerSupabaseClient();
  let query = supabase
    .from("posts")
    .select(`
      *,
      author:authors(*),
      category:categories(*),
      tags:post_tags(*)
    `)
    .eq("status", "published")
    .eq("visibility", "public")
    .order("published_at", { ascending: false });

  if (options?.category) query = query.eq("category.slug", options.category);
  if (options?.tag) query = query.contains("tags", [options.tag]);
  if (options?.author) query = query.eq("author.slug", options.author);
  if (options?.featured) query = query.eq("is_featured", true);
  if (options?.limit) query = query.limit(options.limit);
  if (options?.offset) query = query.range(options.offset, options.offset + (options.limit || 10) - 1);

  return query;
}

export async function getPostBySlug(slug: string) {
  const supabase = await createServerSupabaseClient();
  return supabase
    .from("posts")
    .select(`
      *,
      author:authors(*),
      category:categories(*),
      tags:post_tags(*)
    `)
    .eq("slug", slug)
    .eq("status", "published")
    .single();
}

export async function getCategories() {
  const supabase = await createServerSupabaseClient();
  return supabase
    .from("categories")
    .select("*")
    .order("name");
}

export async function incrementView(postId: string) {
  const supabase = await createServerSupabaseClient();
  return supabase.rpc("increment_post_views", { post_id: postId } as any);
}