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
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();

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

  const { data: authData } = await supabase
    .from("page_views")
    .select("is_authenticated");

  const totalAuthed = (authData as { is_authenticated: boolean }[] | null)?.filter((r) => r.is_authenticated).length ?? 0;
  const totalAnon = (authData as { is_authenticated: boolean }[] | null)?.filter((r) => !r.is_authenticated).length ?? 0;

  const dailyRaw = (await supabase
    .from("page_views")
    .select("created_at, is_authenticated")
    .gte("created_at", ninetyDaysAgo)
    .order("created_at", { ascending: true })
  ).data as { created_at: string; is_authenticated: boolean }[] | null;

  const authDailyMap = new Map<string, number>();
  const anonDailyMap = new Map<string, number>();
  if (dailyRaw) {
    for (const row of dailyRaw) {
      const day = row.created_at.slice(0, 10);
      if (row.is_authenticated) {
        authDailyMap.set(day, (authDailyMap.get(day) ?? 0) + 1);
      } else {
        anonDailyMap.set(day, (anonDailyMap.get(day) ?? 0) + 1);
      }
    }
  }

  const dailyViews: { date: string; authenticated: number; anonymous: number }[] = [];
  for (let i = 89; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().slice(0, 10);
    dailyViews.push({
      date: key,
      authenticated: authDailyMap.get(key) ?? 0,
      anonymous: anonDailyMap.get(key) ?? 0,
    });
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
