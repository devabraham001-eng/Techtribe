import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export interface PortfolioData {
  author: {
    name: string;
    slug: string;
    avatarUrl: string | null;
    bio: string | null;
    twitter: string | null;
    github: string | null;
    linkedin: string | null;
    website: string | null;
  } | null;
  xp: {
    totalXp: number;
    level: number;
    streakDays: number;
  } | null;
  stats: {
    workloadsCompleted: number;
    articlesPublished: number;
    challengesPassed: number;
    totalXp: number;
  };
  recentWorkloads: {
    id: string;
    title: string;
    category: string;
    difficulty: string;
    xpReward: number;
    submittedAt: string;
  }[];
  recentArticles: {
    id: string;
    title: string;
    slug: string;
    publishedAt: string;
    category: string | null;
  }[];
}

export async function getPortfolioData(username: string): Promise<PortfolioData | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createServerSupabaseClient();

  const { data: author } = await supabase
    .from("authors")
    .select("name, slug, avatar_url, bio, twitter, github, linkedin, website")
    .eq("slug", username)
    .single();

  if (!author) return null;

  const authorRow = author as Record<string, unknown>;

  // Get XP
  const { data: xpData } = await supabase
    .from("user_xp")
    .select("total_xp, level, streak_days")
    .eq("user_id", (authorRow as { user_id: string }).user_id)
    .single();

  // Get workload completions
  const { data: submissions } = await supabase
    .from("user_workload_submissions")
    .select("id, workload_id, passed, submitted_at, workloads!inner(title, category, difficulty, xp_reward)")
    .eq("user_id", (authorRow as { user_id: string }).user_id)
    .eq("passed", true)
    .order("submitted_at", { ascending: false })
    .limit(10);

  // Get published articles
  const { data: articles } = await supabase
    .from("posts")
    .select("id, title, slug, published_at, category:categories(name)")
    .eq("author_id", authorRow.id as string)
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(10);

  // Get challenges passed
  const { count: challengesCount } = await supabase
    .from("user_challenge_submissions")
    .select("id", { count: "exact", head: true })
    .eq("user_id", (authorRow as { user_id: string }).user_id)
    .eq("passed", true);

  const xpRow = xpData as Record<string, unknown> | null;
  const workloadSubmissions = (submissions ?? []).map((s: Record<string, unknown>) => {
    const wl = s.workloads as Record<string, unknown> | null;
    return {
      id: s.id as string,
      title: (wl?.title as string) ?? "Unknown",
      category: (wl?.category as string) ?? "",
      difficulty: (wl?.difficulty as string) ?? "",
      xpReward: (wl?.xp_reward as number) ?? 0,
      submittedAt: s.submitted_at as string,
    };
  });

  const articleRows = (articles ?? []).map((a: Record<string, unknown>) => {
    const cat = a.category as Record<string, unknown> | null;
    return {
      id: a.id as string,
      title: a.title as string,
      slug: a.slug as string,
      publishedAt: a.published_at as string,
      category: (cat?.name as string) ?? null,
    };
  });

  return {
    author: {
      name: authorRow.name as string,
      slug: authorRow.slug as string,
      avatarUrl: (authorRow.avatar_url ?? null) as string | null,
      bio: (authorRow.bio ?? null) as string | null,
      twitter: (authorRow.twitter ?? null) as string | null,
      github: (authorRow.github ?? null) as string | null,
      linkedin: (authorRow.linkedin ?? null) as string | null,
      website: (authorRow.website ?? null) as string | null,
    },
    xp: xpRow ? {
      totalXp: xpRow.total_xp as number,
      level: xpRow.level as number,
      streakDays: xpRow.streak_days as number,
    } : null,
    stats: {
      workloadsCompleted: workloadSubmissions.length,
      articlesPublished: articleRows.length,
      challengesPassed: challengesCount ?? 0,
      totalXp: (xpRow?.total_xp as number) ?? 0,
    },
    recentWorkloads: workloadSubmissions,
    recentArticles: articleRows,
  };
}
