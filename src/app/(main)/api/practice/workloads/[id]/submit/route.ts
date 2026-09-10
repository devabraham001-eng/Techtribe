import { NextRequest, NextResponse } from "next/server";
import Database from "better-sqlite3";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getWorkloadById } from "@/lib/practice-data";

const JDOODLE_API = "https://api.jdoodle.com/v1/execute";

// Workload category -> JDoodle language (must match JDoodle's identifiers exactly)
const CATEGORY_LANGUAGE: Record<string, string> = {
  javascript: "nodejs",
  web: "nodejs",
  python: "python3",
  linux: "bash",
  sql: "sqlite",
};

// File holding the learner's solution per category
const SOLUTION_FILE: Record<string, string> = {
  javascript: "main.js",
  web: "main.js",
  python: "main.py",
  linux: "solution.sh",
  sql: "query.sql",
};

interface ExecResult {
  stdout: string;
  stderr: string;
  exitCode: number;
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
  const solutionName = SOLUTION_FILE[workload.category] ?? files[0].name;

  // Split learner solution from data/attachment files
  const solutionFile = files.find((f) => f.name === solutionName) ?? files[files.length - 1];
  const attachments = files.filter((f) => f !== solutionFile);

  let scriptFiles: { name: string; content: string }[];
  let results: { name: string; passed: boolean; output?: string }[] = [];
  let stdout = "";
  let stderr = "";
  let exitCode = 1;

  if (language === "bash") {
    // JDoodle accepts a single script: embed data files via heredocs, then the learner's command
    const heredocs = attachments
      .map((f) => `cat > ${f.name} << 'TEchTRIBE_EOF'\n${f.content}TEchTRIBE_EOF`)
      .join("\n");
    const script = heredocs ? `${heredocs}\n${solutionFile.content}` : solutionFile.content;
    scriptFiles = [{ name: "main.sh", content: script }];
    const run = await executeOnJDoodle(language, script);
    if (!run.ok) return NextResponse.json({ error: run.error, detail: run.detail }, { status: run.status });
    stdout = run.stdout; stderr = run.stderr; exitCode = run.exitCode;
    results = gradeOutputTests(stdout, workload.hiddenTests, exitCode);
  } else if (language === "sqlite") {
    // Run schema + learner query in a local in-memory SQLite database
    const combined = [...attachments.map((f) => f.content), solutionFile.content].join("\n");
    const run = runSqlite(combined);
    stdout = run.stdout; stderr = run.stderr; exitCode = run.exitCode;
    results = gradeOutputTests(stdout, workload.hiddenTests, exitCode);
  } else {
    // javascript / python: single file (solution first) + assertion harness
    const ordered = [solutionFile, ...attachments];
    const userCode = ordered.map((f) => f.content).join("\n\n");
    const harness = language === "python3" ? pyHarness(workload.hiddenTests) : jsHarness(workload.hiddenTests);
    const script = harness ? `${userCode}\n\n${harness}` : userCode;
    scriptFiles = [{ name: language === "python3" ? "main.py" : "main.js", content: script }];
    const run = await executeOnJDoodle(language, script);
    if (!run.ok) return NextResponse.json({ error: run.error, detail: run.detail }, { status: run.status });
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

// JDoodle (api.jdoodle.com) — free tier, key-based, reliable.
// Needs JDOODLE_CLIENT_ID + JDOODLE_CLIENT_SECRET env vars.
// Response: { output, statusCode, memory, cpuTime }.
async function executeOnJDoodle(
  language: string,
  script: string
): Promise<
  | { ok: true; stdout: string; stderr: string; exitCode: number }
  | { ok: false; error: string; detail: string; status: number }
> {
  const clientId = process.env.JDOODLE_CLIENT_ID;
  const clientSecret = process.env.JDOODLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    console.error("JDoodle credentials missing: set JDOODLE_CLIENT_ID and JDOODLE_CLIENT_SECRET");
    return {
      ok: false,
      error: "Code runner not configured",
      detail: "Missing JDoodle API credentials on the server",
      status: 503,
    };
  }

  try {
    const res = await fetch(JDOODLE_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId, clientSecret, script, language, versionIndex: "0" }),
      signal: AbortSignal.timeout(25000),
    });

    if (!res.ok) {
      let detail = "";
      try {
        detail = (await res.text()).slice(0, 300);
      } catch {}
      console.error(`JDoodle error ${res.status} for ${language}: ${detail}`);
      return { ok: false, error: "Code execution failed", detail: detail || `HTTP ${res.status}`, status: 502 };
    }

    const response = (await res.json()) as { output?: string; statusCode?: number };
    const output = response.output || "";
    // JDoodle exposes no process exit code: detect hard crashes from output markers.
    // (Test harnesses report per-test pass/fail themselves; this only catches crashes.)
    const crashed =
      /(\bcommand not found\b|syntax error|Traceback \(most recent call last\)|ReferenceError|TypeError: |Error: Cannot find module)/i.test(output) &&
      !output.includes('"passed":true');
    return { ok: true, stdout: output, stderr: "", exitCode: crashed ? 1 : 0 };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown";
    console.error(`JDoodle request failed for ${language}: ${msg}`);
    return { ok: false, error: "Code execution failed", detail: msg, status: 502 };
  }
}

// Local in-memory SQLite for SQL workloads — no network needed.
// Groups lines into statements by leading keyword (seeds carry no semicolons),
// runs setup statements, and captures SELECT rows as stdout.
function runSqlite(script: string): { stdout: string; stderr: string; exitCode: number } {
  let db: InstanceType<typeof Database> | null = null;
  try {
    db = new Database(":memory:");
    const lines = script
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0 && !l.startsWith("--"));

    const KEYWORDS = /^(CREATE|INSERT|SELECT|WITH|VALUES|UPDATE|DELETE|DROP|ALTER|PRAGMA|EXPLAIN|REPLACE)\b/i;
    const statements: string[] = [];
    let current = "";
    for (const line of lines) {
      if (KEYWORDS.test(line) && current.trim()) {
        statements.push(current);
        current = line;
      } else {
        current += (current ? "\n" : "") + line;
      }
    }
    if (current.trim()) statements.push(current);

    const outRows: string[] = [];
    for (const stmt of statements) {
      const text = stmt.trim().replace(/;$/, "");
      if (!text) continue;
      if (/^(select|with|values|pragma|explain)\b/i.test(text)) {
        const rows = db.prepare(text).all() as Record<string, unknown>[];
        for (const row of rows) {
          outRows.push(Object.values(row).join(" | "));
        }
      } else {
        db.exec(text);
      }
    }
    return { stdout: outRows.join("\n"), stderr: "", exitCode: 0 };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown";
    return { stdout: "", stderr: msg, exitCode: 1 };
  } finally {
    try {
      db?.close();
    } catch {}
  }
}
