import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

interface PageViewRow {
  id: string;
  hashed_ip: string | null;
  visitor_id: string | null;
  created_at: string;
  is_authenticated: boolean;
}

function identityFor(row: PageViewRow): string {
  return row.visitor_id || row.hashed_ip || `row:${row.id}`;
}

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
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

  const { data: raw } = await supabase
    .from("page_views")
    .select("id, hashed_ip, visitor_id, created_at, is_authenticated");
  const rows = (raw ?? []) as PageViewRow[];

  const todayKey = todayStart.toISOString().slice(0, 10);
  const monthKey = monthStart.toISOString().slice(0, 10);
  const ninetyKey = ninetyDaysAgo.toISOString().slice(0, 10);

  const firstSeen = new Map<string, { day: string; isAuthenticated: boolean }>();
  const uniqueIds = new Set<string>();
  for (const row of rows) {
    const id = identityFor(row);
    const day = row.created_at.slice(0, 10);
    const key = `${id}|${day}`;
    if (!firstSeen.has(key)) {
      firstSeen.set(key, { day, isAuthenticated: row.is_authenticated });
    }
    if (!id.startsWith("row:")) {
      uniqueIds.add(id);
    }
  }

  let totalViews = 0;
  let todayViews = 0;
  let monthViews = 0;
  let totalUnique = 0;
  let todayUnique = 0;
  let authCount = 0;
  let anonCount = 0;
  const authDailyMap = new Map<string, number>();
  const anonDailyMap = new Map<string, number>();

  for (const [key, visit] of firstSeen) {
    const id = key.split("|")[0];
    const isTrackable = !id.startsWith("row:");

    totalViews += 1;
    if (visit.day === todayKey) todayViews += 1;
    if (visit.day >= monthKey) monthViews += 1;
    if (visit.isAuthenticated) authCount += 1;
    else anonCount += 1;

    if (isTrackable) {
      if (visit.day === todayKey) todayUnique += 1;
    }

    if (visit.day >= ninetyKey) {
      if (visit.isAuthenticated) {
        authDailyMap.set(visit.day, (authDailyMap.get(visit.day) ?? 0) + 1);
      } else {
        anonDailyMap.set(visit.day, (anonDailyMap.get(visit.day) ?? 0) + 1);
      }
    }
  }

  totalUnique = uniqueIds.size;

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
    totalViews,
    todayViews,
    monthViews,
    totalUnique,
    todayUnique,
    authCount,
    anonCount,
    dailyViews,
    topPages,
  });
}
