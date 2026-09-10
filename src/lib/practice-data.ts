import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { Workload, WorkloadSubmission, UserXP } from "@/types/blog";

function mapWorkload(row: Record<string, unknown>): Workload {
  return {
    id: row.id as string,
    title: row.title as string,
    brief: row.brief as string,
    category: row.category as Workload["category"],
    difficulty: row.difficulty as Workload["difficulty"],
    xpReward: row.xp_reward as number,
    starterFiles: (row.starter_files ?? []) as Workload["starterFiles"],
    hiddenTests: (row.hidden_tests ?? []) as Workload["hiddenTests"],
    sortOrder: row.sort_order as number,
    isActive: row.is_active as boolean,
    createdAt: row.created_at as string,
  };
}

export async function getWorkloads(category?: string): Promise<Workload[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createServerSupabaseClient();
  let query = supabase
    .from("workloads")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (category) query = query.eq("category", category);
  const { data } = await query;
  return (data ?? []).map(mapWorkload);
}

export async function getWorkloadById(id: string): Promise<Workload | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.from("workloads").select("*").eq("id", id).single();
  if (!data) return null;
  return mapWorkload(data as Record<string, unknown>);
}

export async function getUserSubmissions(userId: string, workloadId: string): Promise<WorkloadSubmission[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("user_workload_submissions")
    .select("*")
    .eq("user_id", userId)
    .eq("workload_id", workloadId)
    .order("submitted_at", { ascending: false });
  return (data ?? []).map((row: Record<string, unknown>) => ({
    id: row.id as string,
    userId: row.user_id as string,
    workloadId: row.workload_id as string,
    files: (row.files ?? []) as WorkloadSubmission["files"],
    passed: row.passed as boolean,
    testResults: (row.test_results ?? undefined) as WorkloadSubmission["testResults"],
    output: (row.output ?? undefined) as string | undefined,
    submittedAt: row.submitted_at as string,
  }));
}

export async function getUserXP(userId: string): Promise<UserXP | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.from("user_xp").select("*").eq("user_id", userId).single();
  if (!data) return null;
  const row = data as Record<string, unknown>;
  return {
    userId: row.user_id as string,
    totalXp: row.total_xp as number,
    level: row.level as number,
    streakDays: row.streak_days as number,
    lastActiveDate: (row.last_active_date ?? null) as string | null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export async function getLeaderboard(limit = 10): Promise<(UserXP & { authorName?: string })[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("user_xp")
    .select("*, authors:user_id(name, avatar_url)")
    .order("total_xp", { ascending: false })
    .limit(limit);
  return (data ?? []).map((row: Record<string, unknown>) => {
    const author = row.authors as { name?: string; avatar_url?: string } | null;
    return {
      userId: row.user_id as string,
      totalXp: row.total_xp as number,
      level: row.level as number,
      streakDays: row.streak_days as number,
      lastActiveDate: (row.last_active_date ?? null) as string | null,
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string,
      authorName: author?.name ?? undefined,
    };
  });
}

export async function hasUserPassedWorkload(userId: string, workloadId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("user_workload_submissions")
    .select("id")
    .eq("user_id", userId)
    .eq("workload_id", workloadId)
    .eq("passed", true)
    .limit(1);
  return (data ?? []).length > 0;
}
