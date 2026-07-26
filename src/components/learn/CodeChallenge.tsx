"use client";

import * as React from "react";
import { CodeEditor } from "@/components/ui/code-editor";
import { Loader2, Play, RefreshCw, CheckCircle2, XCircle, Terminal, ChevronDown, ChevronUp } from "lucide-react";
import type { LessonChallenge, TestResult, ChallengeSubmission } from "@/types/blog";

interface CodeChallengeProps {
  lessonId: string;
}

export function CodeChallenge({ lessonId }: CodeChallengeProps) {
  const [challenges, setChallenges] = React.useState<LessonChallenge[]>([]);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [code, setCode] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [result, setResult] = React.useState<{ passed: boolean; output?: string; results?: TestResult[]; exitCode?: number } | null>(null);
  const [submissions, setSubmissions] = React.useState<ChallengeSubmission[]>([]);
  const [showSubmissions, setShowSubmissions] = React.useState(false);
  const [fetchingSubmissions, setFetchingSubmissions] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [authenticated, setAuthenticated] = React.useState(false);

  React.useEffect(() => {
    loadChallenges();
    checkAuth();
  }, [lessonId]);

  async function checkAuth() {
    try {
      const res = await fetch("/api/learn/progress");
      setAuthenticated(res.ok);
    } catch {
      setAuthenticated(false);
    }
  }

  async function loadChallenges() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/learn/challenges?lessonId=${lessonId}`);
      if (!res.ok) throw new Error("Failed to load challenges");
      const data = await res.json();
      const mapped: LessonChallenge[] = data.map((c: Record<string, unknown>) => ({
        id: c.id as string,
        lessonId: c.lesson_id as string,
        title: c.title as string,
        description: c.description as string | undefined,
        starterCode: c.starter_code as string,
        solutionCode: c.solution_code as string | undefined,
        testCode: c.test_code as string | undefined,
        language: c.language as string,
        difficulty: c.difficulty as string | undefined,
        orderIndex: c.order_index as number,
        createdAt: c.created_at as string,
      }));
      setChallenges(mapped);
      if (mapped.length > 0) {
        setCode(mapped[0].starterCode);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load challenges");
    } finally {
      setLoading(false);
    }
  }

  const currentChallenge = challenges[currentIndex];

  async function handleSubmit() {
    if (!currentChallenge || !authenticated) return;
    setSubmitting(true);
    setResult(null);
    setError(null);

    try {
      const res = await fetch(`/api/learn/challenges/${currentChallenge.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Submission failed");
      }

      const data = await res.json();
      setResult(data);
      loadSubmissions();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  }

  async function loadSubmissions() {
    if (!currentChallenge) return;
    setFetchingSubmissions(true);
    try {
      const res = await fetch(`/api/learn/challenges/${currentChallenge.id}/submissions`);
      if (res.ok) {
        const data = await res.json();
        setSubmissions(data);
      }
    } catch {
      // silently fail
    } finally {
      setFetchingSubmissions(false);
    }
  }

  function resetCode() {
    if (currentChallenge) {
      setCode(currentChallenge.starterCode);
      setResult(null);
      setError(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (challenges.length === 0) {
    return (
      <div className="text-center py-16">
        <Terminal className="mx-auto h-8 w-8 text-muted-foreground/50" />
        <p className="mt-4 text-muted-foreground">No challenges for this lesson yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Challenge selector */}
      {challenges.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {challenges.map((ch, idx) => (
            <button
              key={ch.id}
              onClick={() => { setCurrentIndex(idx); setCode(ch.starterCode); setResult(null); setError(null); }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                idx === currentIndex
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {ch.title}
            </button>
          ))}
        </div>
      )}

      {currentChallenge && (
        <>
          {/* Problem description */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="font-heading text-lg font-semibold text-foreground mb-2">
              {currentChallenge.title}
            </h3>
            {currentChallenge.description && (
              <p className="text-sm text-muted-foreground whitespace-pre-line">
                {currentChallenge.description}
              </p>
            )}
            <div className="flex gap-2 mt-3">
              <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                {currentChallenge.language}
              </span>
              {currentChallenge.difficulty && (
                <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                  {currentChallenge.difficulty}
                </span>
              )}
            </div>
          </div>

          {/* Code editor */}
          <div className="rounded-xl border border-border overflow-hidden">
            <div className="flex items-center justify-between bg-muted/50 px-4 py-2 border-b border-border">
              <span className="text-xs font-medium text-muted-foreground">
                main.{currentChallenge.language}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={resetCode}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                  title="Reset to starter code"
                >
                  <RefreshCw className="h-3 w-3" />
                  Reset
                </button>
                {!authenticated ? (
                  <span className="text-xs text-muted-foreground">Sign in to submit code</span>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {submitting ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Play className="h-3.5 w-3.5" />
                    )}
                    {submitting ? "Running..." : "Run"}
                  </button>
                )}
              </div>
            </div>
            <CodeEditor
              value={code}
              onChange={setCode}
              language={currentChallenge.language}
              height={320}
            />
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-xl border border-destructive/50 bg-destructive/5 p-4">
              <p className="text-sm font-medium text-destructive">{error}</p>
            </div>
          )}

          {/* Results */}
          {result && (
            <div className={`rounded-xl border p-5 ${result.passed ? "border-[#00FC90]/50 bg-[#00FC90]/5" : "border-destructive/50 bg-destructive/5"}`}>
              <div className="flex items-center gap-2 mb-3">
                {result.passed ? (
                  <CheckCircle2 className="h-5 w-5 text-[#00FC90]" />
                ) : (
                  <XCircle className="h-5 w-5 text-destructive" />
                )}
                <span className={`font-semibold ${result.passed ? "text-[#00FC90]" : "text-destructive"}`}>
                  {result.passed ? "All tests passed!" : "Tests failed"}
                </span>
                {result.exitCode !== undefined && (
                  <span className="text-xs text-muted-foreground ml-auto">
                    Exit code: {result.exitCode}
                  </span>
                )}
              </div>

              {result.results && result.results.length > 0 ? (
                <div className="space-y-1.5">
                  {result.results.map((test, idx) => (
                    <div
                      key={idx}
                      className={`flex items-start gap-2 rounded-lg p-2.5 ${
                        test.passed ? "bg-[#00FC90]/5" : "bg-destructive/5"
                      }`}
                    >
                      {test.passed ? (
                        <CheckCircle2 className="h-4 w-4 text-[#00FC90] mt-0.5 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm font-medium ${test.passed ? "text-[#00FC90]" : "text-destructive"}`}>
                          {test.name}
                        </p>
                        {test.output && (
                          <pre className="mt-1 text-xs text-muted-foreground whitespace-pre-wrap font-mono">
                            {test.output}
                          </pre>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : result.output ? (
                <pre className="mt-2 rounded-lg bg-background p-3 text-xs font-mono text-foreground overflow-x-auto">
                  {result.output}
                </pre>
              ) : null}
            </div>
          )}

          {/* Submissions history */}
          <div>
            <button
              onClick={() => {
                setShowSubmissions(!showSubmissions);
                if (!showSubmissions && submissions.length === 0) {
                  loadSubmissions();
                }
              }}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {showSubmissions ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              Submission history ({submissions.length})
            </button>

            {showSubmissions && (
              <div className="mt-3 space-y-2 max-h-[300px] overflow-y-auto">
                {fetchingSubmissions ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading...
                  </div>
                ) : submissions.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-2">No submissions yet.</p>
                ) : (
                  submissions.map((sub) => (
                    <div
                      key={sub.id}
                      className={`flex items-center gap-3 rounded-lg border p-3 ${
                        sub.passed ? "border-[#00FC90]/30" : "border-destructive/30"
                      }`}
                    >
                      {sub.passed ? (
                        <CheckCircle2 className="h-4 w-4 text-[#00FC90] flex-shrink-0" />
                      ) : (
                        <XCircle className="h-4 w-4 text-destructive flex-shrink-0" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className={`text-xs font-medium ${sub.passed ? "text-[#00FC90]" : "text-destructive"}`}>
                          {sub.passed ? "Passed" : "Failed"}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {new Date(sub.submittedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
