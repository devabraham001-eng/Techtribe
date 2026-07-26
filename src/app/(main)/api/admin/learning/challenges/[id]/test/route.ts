import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

const PISTON_API = "https://emkc.org/api/v2/piston/execute";

const LANGUAGE_RUNTIMES: Record<string, string> = {
  javascript: "18",
  js: "18",
  typescript: "5.0",
  ts: "5.0",
  python: "3.10",
  py: "3.10",
  go: "1.21",
  rust: "1.80",
  rs: "1.80",
  cpp: "10.2.0",
  java: "15.0.2",
  ruby: "3.0.1",
  bash: "5.2.0",
  sql: "3",
};

async function checkStaff(supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data } = await supabase.from("authors").select("is_staff").eq("user_id", user.id).single();
  return (data as { is_staff: boolean } | null)?.is_staff ?? false;
}

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const supabase = await createServerSupabaseClient();
  if (!(await checkStaff(supabase))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();

  const { data: rawChallenge } = await supabase
    .from("lesson_challenges")
    .select("*")
    .eq("id", id)
    .single();

  if (!rawChallenge) {
    return NextResponse.json({ error: "Challenge not found" }, { status: 404 });
  }

  const challenge = rawChallenge as { solution_code: string | null; starter_code: string; language: string; test_code: string | null };
  const code = body.code || challenge.solution_code || challenge.starter_code;
  const language = (body.language || challenge.language || "javascript").toLowerCase();
  const runtime = LANGUAGE_RUNTIMES[language] || LANGUAGE_RUNTIMES.javascript;

  const testCode = body.test_code || challenge.test_code;
  const combinedCode = testCode ? `${code}\n\n${testCode}` : code;

  try {
    const pistonRes = await fetch(PISTON_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language,
        version: runtime,
        files: [{ name: `main.${language}`, content: combinedCode }],
      }),
    });

    if (!pistonRes.ok) {
      return NextResponse.json({ error: "Code execution failed" }, { status: 502 });
    }

    const response = await pistonRes.json();
    return NextResponse.json({
      stdout: response.run.stdout,
      stderr: response.run.stderr,
      output: response.run.output,
      exitCode: response.run.code,
    });
  } catch {
    return NextResponse.json({ error: "Code execution service unavailable" }, { status: 502 });
  }
}
