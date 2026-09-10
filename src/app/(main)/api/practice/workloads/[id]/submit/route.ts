import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getWorkloadById } from "@/lib/practice-data";

const PISTON_API = "https://emkc.org/api/v2/piston/execute";
const PISTON_RUNTIMES = "https://emkc.org/api/v2/piston/runtimes";

// Workload category -> Piston language (must match Piston's language names exactly)
const CATEGORY_LANGUAGE: Record<string, string> = {
  javascript: "javascript",
  web: "javascript",
  python: "python",
  linux: "bash",
  sql: "sqlite3",
};

// Exact fallback versions (from Piston /runtimes)
const FALLBACK_VERSIONS: Record<string, string> = {
  javascript: "18.15.0",
  python: "3.10.0",
  bash: "5.2.0",
  sqlite3: "3.36.0",
};

// File holding the learner's solution per category
const SOLUTION_FILE: Record<string, string> = {
  javascript: "main.js",
  web: "main.js",
  python: "main.py",
  linux: "solution.sh",
  sql: "query.sql",
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

interface PistonRuntime {
  language: string;
  version: string;
  aliases: string[];
  runtime?: string;
}

// Cache resolved runtime versions for 1h to avoid a lookup per submission
let runtimeCache: { at: number; versions: Record<string, string> } | null = null;

async function resolveVersion(language: string): Promise<string> {
  const now = Date.now();
  if (runtimeCache && now - runtimeCache.at < 3600_000 && runtimeCache.versions[language]) {
    return runtimeCache.versions[language];
  }
  try {
    const res = await fetch(PISTON_RUNTIMES, { signal: AbortSignal.timeout(8000) });
    if (res.ok) {
      const runtimes = (await res.json()) as PistonRuntime[];
      const versions: Record<string, string> = {};
      for (const r of runtimes) {
        // Prefer the node runtime for javascript (deno entry comes first otherwise)
        if (r.language === "javascript" && r.runtime !== "node") continue;
        if (!versions[r.language]) versions[r.language] = r.version;
        for (const a of r.aliases ?? []) {
          if (r.language === "javascript" && r.runtime !== "node") continue;
          if (!versions[a]) versions[a] = r.version;
        }
      }
      runtimeCache = { at: now, versions };
      if (versions[language]) return versions[language];
    }
  } catch {
    // fall through to hardcoded versions
  }
  return FALLBACK_VERSIONS[language] ?? "18.15.0";
}

// Extract per-line JSON test results (ignores demo console.log/print noise)
function parseTestResults(stdout: string): { results: { name: string; passed: boolean; output?: string }[]; raw: string } {
  const results: { name: string; passed: boolean; output?: string }[] = [];
  for (const line of stdout.split("\n")) {
    const t = line.trim();
    if (!t.startsWith("{") || !t.endsWith("}")) continue;
    try {
      const o = JSON.parse(t) as { name?: unknown; passed?: unknown; output?: unknown };
      if (o && typeof o.name === "string" && typeof o.passed === "boolean") {
        results.push({ name: o.name, passed: o.passed, output: typeof o.output === "string" ? o.output : undefined });
      }
    } catch {}
  }
  return { results, raw: stdout };
}

// JS harness: fn(args) ==/=== expected, deep-compared via JSON
function jsHarness(tests: { name: string }[]): string {
  return tests
    .map((t) => {
      const safeName = JSON.stringify(t.name);
      const match = t.name.match(/^(\w+)\(([^)]*)\)\s*={2,3}\s*(.+)$/);
      if (match) {
        const [, fn, args, expected] = match;
        return `try { const __r = ${fn}(${args}); const __e = ${expected}; const __p = JSON.stringify(__r) === JSON.stringify(__e); console.log(JSON.stringify({ name: ${safeName}, passed: __p, output: "got: " + JSON.stringify(__r) })); } catch(e) { console.log(JSON.stringify({ name: ${safeName}, passed: false, output: String((e && e.message) || e) })); }`;
      }
      return `console.log(JSON.stringify({ name: ${safeName}, passed: true, output: "ran without errors" }));`;
    })
    .join("\n");
}

// Python harness: same assertion format, Python syntax
function pyHarness(tests: { name: string }[]): string {
  const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/"/g, '\\"');
  const lines = ["import json"];
  for (const t of tests) {
    const safeName = JSON.stringify(t.name);
    const match = t.name.match(/^(\w+)\(([^)]*)\)\s*={2,3}\s*(.+)$/);
    if (match) {
      const [, fn, args, expected] = match;
      lines.push(
        `try:\n __r = ${fn}(${esc(args)})\n __e = ${esc(expected)}\n print(json.dumps({"name": ${safeName}, "passed": __r == __e, "output": "got: " + str(__r)}))\nexcept Exception as e:\n print(json.dumps({"name": ${safeName}, "passed": False, "output": str(e)}))`
      );
    } else {
      lines.push(`print(json.dumps({"name": ${safeName}, "passed": True, "output": "ran without errors"}))`);
    }
  }
  return lines.join("\n");
}

// Bash/SQL grading: each hidden test's `output` must appear in stdout
function gradeOutputTests(
  stdout: string,
  tests: { name: string; output?: string }[],
  exitCode: number
): { name: string; passed: boolean; output?: string }[] {
  return tests.map((t) => {
    const want = (t.output || "").trim();
    if (!want) {
      const ok = exitCode === 0;
      return { name: t.name, passed: ok, output: ok ? "ran without errors" : "non-zero exit code" };
    }
    const ok = exitCode === 0 && stdout.includes(want);
    return { name: t.name, passed: ok, output: ok ? `found: ${want}` : `missing: ${want}` };
  });
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
  const { files } = body as { files: { name: string; content: string }[] };
  if (!files || files.length === 0) {
    return NextResponse.json({ error: "files are required" }, { status: 400 });
  }

  const workload = await getWorkloadById(id);
  if (!workload) {
    return NextResponse.json({ error: "Workload not found" }, { status: 404 });
  }

  const language = CATEGORY_LANGUAGE[workload.category] ?? "javascript";
  const version = await resolveVersion(language);
  const solutionName = SOLUTION_FILE[workload.category] ?? files[0].name;

  // Split learner solution from data/attachment files
  const solutionFile = files.find((f) => f.name === solutionName) ?? files[files.length - 1];
  const attachments = files.filter((f) => f !== solutionFile);

  let pistonFiles: { name: string; content: string }[];
  let results: { name: string; passed: boolean; output?: string }[] = [];
  let stdout = "";
  let stderr = "";
  let exitCode = 1;

  if (language === "bash") {
    // Run the learner's command with data files alongside it
    pistonFiles = [
      { name: "main.sh", content: solutionFile.content },
      ...attachments.map((f) => ({ name: f.name, content: f.content })),
    ];
    const run = await executeOnPiston(language, version, pistonFiles);
    if (!run.ok) return NextResponse.json({ error: "Code execution failed", detail: run.detail }, { status: 502 });
    stdout = run.stdout; stderr = run.stderr; exitCode = run.exitCode;
    results = gradeOutputTests(stdout, workload.hiddenTests, exitCode);
  } else if (language === "sqlite3") {
    // Schema first, learner query last, single script
    const combined = [...attachments.map((f) => f.content), solutionFile.content].join("\n");
    pistonFiles = [{ name: "main.sql", content: combined }];
    const run = await executeOnPiston(language, version, pistonFiles);
    if (!run.ok) return NextResponse.json({ error: "Code execution failed", detail: run.detail }, { status: 502 });
    stdout = run.stdout; stderr = run.stderr; exitCode = run.exitCode;
    results = gradeOutputTests(stdout, workload.hiddenTests, exitCode);
  } else {
    // javascript / python: single file (solution first) + assertion harness
    const ordered = [solutionFile, ...attachments];
    const userCode = ordered.map((f) => f.content).join("\n\n");
    const harness = language === "python" ? pyHarness(workload.hiddenTests) : jsHarness(workload.hiddenTests);
    const ext = language === "python" ? "py" : "js";
    pistonFiles = [{ name: `main.${ext}`, content: harness ? `${userCode}\n\n${harness}` : userCode }];
    const run = await executeOnPiston(language, version, pistonFiles);
    if (!run.ok) return NextResponse.json({ error: "Code execution failed", detail: run.detail }, { status: 502 });
    stdout = run.stdout; stderr = run.stderr; exitCode = run.exitCode;
    results = parseTestResults(stdout).results;
  }

  const passed = exitCode === 0 && results.length > 0 && results.every((r) => r.passed);

  // Save submission
  const { error: insertError } = await supabase
    .from("user_workload_submissions")
    .insert({
      user_id: user.id,
      workload_id: id,
      files: files as never,
      passed,
      test_results: results.length > 0 ? results as never : null,
      output: stdout || stderr || null,
    } as never);

  if (insertError) {
    console.error("Failed to save submission:", insertError);
  }

  // Award XP on first pass
  if (passed) {
    const { data: existing } = await supabase
      .from("user_workload_submissions")
      .select("id")
      .eq("user_id", user.id)
      .eq("workload_id", id)
      .eq("passed", true)
      .limit(2);

    if (existing && existing.length <= 1) {
      await supabase.rpc("award_workload_xp" as never, {
        p_user_id: user.id,
        p_xp: workload.xpReward,
      } as never);
    }
  }

  return NextResponse.json({
    passed,
    output: stdout || stderr,
    results: results.length > 0 ? results : undefined,
    exitCode,
  });
}

async function executeOnPiston(
  language: string,
  version: string,
  files: { name: string; content: string }[]
): Promise<{ ok: true; stdout: string; stderr: string; exitCode: number } | { ok: false; detail: string }> {
  try {
    const pistonRes = await fetch(PISTON_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ language, version, files }),
      signal: AbortSignal.timeout(20000),
    });

    if (!pistonRes.ok) {
      let detail = "";
      try {
        detail = (await pistonRes.text()).slice(0, 300);
      } catch {}
      console.error(`Piston error ${pistonRes.status} for ${language}@${version}: ${detail}`);
      return { ok: false, detail: detail || `HTTP ${pistonRes.status}` };
    }

    const response = (await pistonRes.json()) as PistonResponse;
    return {
      ok: true,
      stdout: response.run.stdout || "",
      stderr: response.run.stderr || "",
      exitCode: response.run.code,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown";
    console.error(`Piston request failed for ${language}: ${msg}`);
    return { ok: false, detail: msg };
  }
}
