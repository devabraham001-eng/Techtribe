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

interface PistonResponse {
  run: {
    stdout: string;
    stderr: string;
    output: string;
    code: number;
    signal: string | null;
  };
  language: string;
  version: string;
}

function parseTestResults(stdout: string): { results: { name: string; passed: boolean; output?: string }[]; raw: string } {
  try {
    const trimmed = stdout.trim();
    const parsed = JSON.parse(trimmed);
    if (Array.isArray(parsed)) {
      return { results: parsed, raw: stdout };
    }
  } catch {}
  return { results: [], raw: stdout };
}

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { code } = body as { code: string };
  if (!code) {
    return NextResponse.json({ error: "code is required" }, { status: 400 });
  }

  const { data: rawChallenge } = await supabase
    .from("lesson_challenges")
    .select("*")
    .eq("id", id)
    .single();

  if (!rawChallenge) {
    return NextResponse.json({ error: "Challenge not found" }, { status: 404 });
  }

  const challenge = rawChallenge as { language: string; test_code: string | null };
  const language = challenge.language?.toLowerCase() || "javascript";
  const runtime = LANGUAGE_RUNTIMES[language] || LANGUAGE_RUNTIMES.javascript;

  const combinedCode = challenge.test_code
    ? `${code}\n\n${challenge.test_code}`
    : code;

  let response: PistonResponse;
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

    response = await pistonRes.json();
  } catch {
    return NextResponse.json({ error: "Code execution service unavailable" }, { status: 502 });
  }

  const stdout = response.run.stdout || "";
  const stderr = response.run.stderr || "";
  const exitCode = response.run.code;
  const passed = exitCode === 0;
  const { results, raw } = parseTestResults(stdout);

  const { error: insertError } = await supabase
    .from("user_challenge_submissions")
    .insert({
      user_id: user.id,
      challenge_id: id,
      code,
      passed,
      test_results: results.length > 0 ? results as never : null,
      output: raw || stderr || null,
    } as never);

  if (insertError) {
    console.error("Failed to save submission:", insertError);
  }

  return NextResponse.json({
    passed,
    output: raw || stderr,
    results: results.length > 0 ? results : undefined,
    exitCode,
  });
}
