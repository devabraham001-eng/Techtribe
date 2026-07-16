import { createClient } from "@supabase/supabase-js";
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

export function createAdminSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createClient<Database>(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
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
    .select("id, name, slug, description, color, icon, post_count")
    .order("name");
}

export async function incrementView(postId: string) {
  const supabase = await createServerSupabaseClient();
  const args: Database["public"]["Functions"]["increment_post_views"]["Args"] = {
    post_id: postId,
  };

  return supabase.rpc("increment_post_views" as never, args as never);
}
