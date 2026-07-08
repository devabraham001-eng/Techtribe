import { DEMO_AUTHORS, DEMO_CATEGORIES, DEMO_POSTS, DEMO_TAGS } from "@/lib/demo-data";
import {
  createServerSupabaseClient,
  incrementView as incrementSupabaseView,
} from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { Author, Category, Post, Tag } from "@/types/blog";
import type { Database } from "@/types/database";

type PostRow = Database["public"]["Tables"]["posts"]["Row"];
type AuthorRow = Database["public"]["Tables"]["authors"]["Row"];
type CategoryRow = Database["public"]["Tables"]["categories"]["Row"];
type TagRow = Database["public"]["Tables"]["tags"]["Row"];
const localViewCounts = new Map<string, number>();

export interface PostQuery {
  category?: string | null;
  tag?: string | null;
  author?: string | null;
  featured?: boolean;
  page?: number;
  limit?: number;
}

export interface PaginatedPosts {
  posts: Post[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

function paginate(posts: Post[], page = 1, limit = 9): PaginatedPosts {
  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : 9;
  const total = posts.length;
  const totalPages = Math.max(Math.ceil(total / safeLimit), 1);
  const offset = (safePage - 1) * safeLimit;

  return {
    posts: posts.slice(offset, offset + safeLimit),
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages,
      hasMore: safePage < totalPages,
    },
  };
}

function mapAuthor(row: AuthorRow): Author {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    bio: row.bio ?? undefined,
    avatarUrl: row.avatar_url ?? undefined,
    twitter: row.twitter ?? undefined,
    github: row.github ?? undefined,
    linkedin: row.linkedin ?? undefined,
    website: row.website ?? undefined,
    isStaff: row.is_staff,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description ?? undefined,
    color: row.color ?? undefined,
    icon: row.icon ?? undefined,
    postCount: row.post_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapTag(row: TagRow): Tag {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description ?? undefined,
    postCount: row.post_count,
    createdAt: row.created_at,
  };
}

function mapPost(
  row: PostRow,
  authors: Map<string, Author>,
  categories: Map<string, Category>,
  tagsById: Map<string, Tag>
): Post | null {
  const author = row.author_id ? authors.get(row.author_id) : undefined;
  if (!author) return null;

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt ?? undefined,
    contentMdx: row.content_mdx,
    contentHtml: row.content_html ?? undefined,
    coverImageUrl: row.cover_image_url ?? undefined,
    coverImageAlt: row.cover_image_alt ?? undefined,
    status: row.status,
    visibility: row.visibility,
    publishedAt: row.published_at ?? undefined,
    scheduledAt: row.scheduled_at ?? undefined,
    author,
    category: row.category_id ? categories.get(row.category_id) : undefined,
    tags: row.tags.map((id) => tagsById.get(id)).filter((tag): tag is Tag => Boolean(tag)),
    seoTitle: row.seo_title ?? undefined,
    seoDescription: row.seo_description ?? undefined,
    seoKeywords: row.seo_keywords,
    canonicalUrl: row.canonical_url ?? undefined,
    ogImageUrl: row.og_image_url ?? undefined,
    readingTime: row.reading_time,
    viewCount: row.view_count,
    adEnabled: row.ad_enabled,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function getSupabaseCollections() {
  const supabase = await createServerSupabaseClient();
  const [authorsResult, categoriesResult, tagsResult, postsResult] = await Promise.all([
    supabase.from("authors").select("*"),
    supabase.from("categories").select("*").order("name"),
    supabase.from("tags").select("*").order("name"),
    supabase
      .from("posts")
      .select("*")
      .eq("status", "published")
      .eq("visibility", "public")
      .order("published_at", { ascending: false }),
  ]);

  if (authorsResult.error) throw authorsResult.error;
  if (categoriesResult.error) throw categoriesResult.error;
  if (tagsResult.error) throw tagsResult.error;
  if (postsResult.error) throw postsResult.error;

  const authors = (authorsResult.data ?? []).map(mapAuthor);
  const categories = (categoriesResult.data ?? []).map(mapCategory);
  const tags = (tagsResult.data ?? []).map(mapTag);
  const authorsById = new Map(authors.map((author) => [author.id, author]));
  const categoriesById = new Map(categories.map((category) => [category.id, category]));
  const tagsById = new Map(tags.map((tag) => [tag.id, tag]));
  const posts = (postsResult.data ?? [])
    .map((post) => mapPost(post, authorsById, categoriesById, tagsById))
    .filter((post): post is Post => Boolean(post));

  return { authors, categories, tags, posts };
}

async function getCollections() {
  if (!isSupabaseConfigured()) {
    return {
      authors: DEMO_AUTHORS,
      categories: DEMO_CATEGORIES,
      tags: DEMO_TAGS,
      posts: DEMO_POSTS,
    };
  }

  try {
    return await getSupabaseCollections();
  } catch (error) {
    console.error("Falling back to demo blog data:", error);
    return {
      authors: DEMO_AUTHORS,
      categories: DEMO_CATEGORIES,
      tags: DEMO_TAGS,
      posts: DEMO_POSTS,
    };
  }
}

export async function getBlogPosts(query: PostQuery = {}) {
  const { posts } = await getCollections();
  let filtered = [...posts];

  if (query.category) filtered = filtered.filter((post) => post.category?.slug === query.category);
  if (query.tag) {
    filtered = filtered.filter((post) => post.tags.some((tag) => tag.slug === query.tag));
  }
  if (query.author) filtered = filtered.filter((post) => post.author.slug === query.author);
  if (query.featured) filtered = filtered.slice(0, 1);

  return filtered;
}

export async function getPaginatedBlogPosts(query: PostQuery = {}) {
  const posts = await getBlogPosts(query);
  return paginate(posts, query.page, query.limit);
}

export async function getBlogPostBySlug(slug: string) {
  const posts = await getBlogPosts();
  return posts.find((post) => post.slug === slug) ?? null;
}

export async function getBlogCategories() {
  const { categories } = await getCollections();
  return categories;
}

export async function getBlogTags() {
  const { tags } = await getCollections();
  return tags;
}

export async function getBlogAuthors() {
  const { authors } = await getCollections();
  return authors;
}

export async function searchBlogPosts(query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];

  const posts = await getBlogPosts();
  return posts.filter((post) => {
    const searchText = [
      post.title,
      post.excerpt,
      post.author.name,
      post.category?.name,
      ...post.tags.map((tag) => tag.name),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return searchText.includes(normalized);
  });
}

export async function getBlogViewCount(slug: string) {
  const post = await getBlogPostBySlug(slug);
  if (!post) return null;
  return localViewCounts.get(slug) ?? post.viewCount;
}

export async function incrementBlogViewCount(slug: string) {
  const post = await getBlogPostBySlug(slug);
  if (!post) return null;

  if (isSupabaseConfigured()) {
    try {
      const { error } = await incrementSupabaseView(post.id);
      if (error) throw error;
      const updatedPost = await getBlogPostBySlug(slug);
      return updatedPost?.viewCount ?? post.viewCount + 1;
    } catch (error) {
      console.error("Could not persist post view:", error);
    }
  }

  const currentCount = localViewCounts.get(slug) ?? post.viewCount;
  const nextCount = currentCount + 1;
  localViewCounts.set(slug, nextCount);
  return nextCount;
}
