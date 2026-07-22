import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
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

  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format") || "json";

  const { data: rows } = await supabase
    .from("page_views")
    .select("*")
    .order("created_at", { ascending: false });

  if (!rows) {
    return NextResponse.json({ error: "No data" }, { status: 404 });
  }

  if (format === "csv") {
    const headers = ["id", "path", "user_id", "is_authenticated", "hashed_ip", "referrer", "user_agent", "created_at"];
    const csvRows = [headers.join(",")];
    for (const row of rows) {
      csvRows.push(
        headers.map((h) => {
          const val = (row as Record<string, unknown>)[h];
          if (val === null || val === undefined) return "";
          const str = String(val);
          return str.includes(",") || str.includes('"') || str.includes("\n")
            ? `"${str.replace(/"/g, '""')}"`
            : str;
        }).join(",")
      );
    }
    const csv = csvRows.join("\n");
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="page_views_export_${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  }

  return NextResponse.json(rows);
}
