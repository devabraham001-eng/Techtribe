import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { path, visitorId } = body as { path?: unknown; visitorId?: unknown };
  if (typeof path !== "string" || !path.trim()) {
    return NextResponse.json({ error: "Missing path" }, { status: 400 });
  }
  const visitorIdStr = typeof visitorId === "string" && visitorId ? visitorId : null;

  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    const userAgent = request.headers.get("user-agent") || null;
    const referrer = request.headers.get("referer") || null;
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || request.headers.get("x-real-ip")
      || request.headers.get("cf-connecting-ip")
      || null;

    let hashedIp: string | null = null;
    if (ip) {
      const encoder = new TextEncoder();
      const data = encoder.encode(ip);
      const hashBuffer = await crypto.subtle.digest("SHA-256", data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      hashedIp = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    let alreadyTrackedToday = false;
    if (visitorIdStr || hashedIp) {
      let query = supabase
        .from("page_views")
        .select("id", { count: "exact", head: true })
        .eq("path", path.trim())
        .gte("created_at", todayStart.toISOString());
      if (visitorIdStr) {
        query = query.eq("visitor_id", visitorIdStr);
      } else if (hashedIp) {
        query = query.eq("hashed_ip", hashedIp);
      }
      const { count } = await query;
      alreadyTrackedToday = (count ?? 0) > 0;
    }

    if (!alreadyTrackedToday) {
      await supabase.from("page_views").insert({
        path: path.trim(),
        user_id: user?.id ?? null,
        is_authenticated: !!user,
        hashed_ip: hashedIp,
        visitor_id: visitorIdStr,
        referrer,
        user_agent: userAgent,
      } as never);
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
