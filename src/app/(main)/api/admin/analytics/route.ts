import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
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

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [{ count: totalViews }, { count: todayViews }, { count: monthViews }] = await Promise.all([
    supabase.from("page_views").select("*", { count: "exact", head: true }),
    supabase.from("page_views").select("*", { count: "exact", head: true }).gte("created_at", todayStart),
    supabase.from("page_views").select("*", { count: "exact", head: true }).gte("created_at", monthStart),
  ]);

  const { count: totalUnique } = await supabase
    .from("page_views")
    .select("hashed_ip", { count: "exact", head: true })
    .not("hashed_ip", "is", null);

  const { count: todayUnique } = await supabase
    .from("page_views")
    .select("hashed_ip", { count: "exact", head: true })
    .not("hashed_ip", "is", null)
    .gte("created_at", todayStart);

  const authData = (await supabase
    .from("page_views")
    .select("is_authenticated")
  ).data as { is_authenticated: boolean }[] | null;

  const totalAuthed = authData?.filter((r) => r.is_authenticated).length ?? 0;
  const totalAnon = authData?.filter((r) => !r.is_authenticated).length ?? 0;

  const dailyRaw = (await supabase
    .from("page_views")
    .select("created_at")
    .gte("created_at", thirtyDaysAgo)
    .order("created_at", { ascending: true })
  ).data as { created_at: string }[] | null;

  const dailyMap = new Map<string, number>();
  if (dailyRaw) {
    for (const row of dailyRaw) {
      const day = row.created_at.slice(0, 10);
      dailyMap.set(day, (dailyMap.get(day) ?? 0) + 1);
    }
  }

  const dailyViews: { date: string; count: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().slice(0, 10);
    dailyViews.push({ date: key, count: dailyMap.get(key) ?? 0 });
  }

  const topPagesRaw = (await supabase
    .from("page_views")
    .select("path")
  ).data as { path: string }[] | null;

  const pageMap = new Map<string, number>();
  if (topPagesRaw) {
    for (const row of topPagesRaw) {
      pageMap.set(row.path, (pageMap.get(row.path) ?? 0) + 1);
    }
  }

  const topPages = [...pageMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([path, count]) => ({ path, count }));

  return NextResponse.json({
    totalViews: totalViews ?? 0,
    todayViews: todayViews ?? 0,
    monthViews: monthViews ?? 0,
    totalUnique: totalUnique ?? 0,
    todayUnique: todayUnique ?? 0,
    authCount: totalAuthed,
    anonCount: totalAnon,
    dailyViews,
    topPages,
  });
}
