import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { path } = await request.json();
  if (typeof path !== "string" || !path.trim()) {
    return NextResponse.json({ error: "Missing path" }, { status: 400 });
  }

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

    await supabase.from("page_views").insert({
      path: path.trim(),
      user_id: user?.id ?? null,
      is_authenticated: !!user,
      hashed_ip: hashedIp,
      referrer,
      user_agent: userAgent,
    } as never);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
