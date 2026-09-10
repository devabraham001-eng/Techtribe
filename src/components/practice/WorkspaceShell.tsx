"use client";

import * as React from "react";
import { Play, Loader2, CheckCircle2, XCircle, ChevronDown, ChevronRight } from "lucide-react";
import type { Workload, WorkloadFile, TestResult } from "@/types/blog";

export function WorkspaceShell({
  workload,
  onComplete,
}: {
  workload: Workload;
  onComplete: () => void;
}) {
  const [files, setFiles] = React.useState<WorkloadFile[]>(workload.starterFiles);
  const [activeFile, setActiveFile] = React.useState(0);
  const [running, setRunning] = React.useState(false);
  const [results, setResults] = React.useState<TestResult[] | null>(null);
  const [output, setOutput] = React.useState("");
  const [passed, setPassed] = React.useState<boolean | null>(null);
  const [showHistory, setShowHistory] = React.useState(false);
  const [history, setHistory] = React.useState<{ passed: boolean; submittedAt: string; results: TestResult[] }[]>([]);

  const handleRun = async () => {
    setRunning(true);
    setResults(null);
    setOutput("");
    setPassed(null);

    try {
      const res = await fetch(`/api/practice/workloads/${workload.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files }),
      });

      if (!res.ok) {
        const err = await res.json();
        setOutput(err.error || "Execution failed");
        return;
      }

      const data = await res.json();
      setPassed(data.passed);
      setOutput(data.output || "");
      if (data.results) {
        setResults(data.results);
      }
      if (data.passed) {
        onComplete();
      }
    } catch {
      setOutput("Network error — please try again.");
    } finally {
      setRunning(false);
    }
  };

  const updateFile = (index: number, content: string) => {
    setFiles((prev) => prev.map((f, i) => (i === index ? { ...f, content } : f)));
  };

  return (
    <div className="flex flex-col h-full" style={{ background: "#0a0a0a" }}>
      {/* File tabs */}
      <div
        className="flex items-center gap-1 px-2 py-1.5 overflow-x-auto border-b"
        style={{ borderColor: "#38383a", background: "#141416" }}
      >
        {files.map((file, i) => (
          <button
            key={file.name}
            type="button"
            onClick={() => setActiveFile(i)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap"
            style={{
              background: i === activeFile ? "#1c1c1e" : "transparent",
              color: i === activeFile ? "#f5f5f7" : "#636366",
              border: i === activeFile ? "1px solid #38383a" : "1px solid transparent",
            }}
          >
            {file.name}
          </button>
        ))}
      </div>

      {/* Editor */}
      <div className="flex-1 min-h-0">
        <textarea
          value={files[activeFile]?.content ?? ""}
          onChange={(e) => updateFile(activeFile, e.target.value)}
          className="w-full h-full resize-none p-4 text-sm leading-relaxed focus:outline-none"
          style={{
            background: "#0a0a0a",
            color: "#f5f5f7",
            fontFamily: "var(--font-mono)",
            tabSize: 2,
          }}
          spellCheck={false}
        />
      </div>

      {/* Run bar */}
      <div
        className="flex items-center justify-between px-4 py-3 border-t"
        style={{ borderColor: "#38383a", background: "#141416" }}
      >
        <div className="flex items-center gap-2">
          {passed === true && (
            <span className="flex items-center gap-1.5 text-xs font-medium" style={{ color: "#30d158" }}>
              <CheckCircle2 className="h-4 w-4" />
              All tests passed
            </span>
          )}
          {passed === false && (
            <span className="flex items-center gap-1.5 text-xs font-medium" style={{ color: "#ff453a" }}>
              <XCircle className="h-4 w-4" />
              Some tests failed
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={handleRun}
          disabled={running}
          className="inline-flex items-center gap-2 rounded-full font-semibold transition-all disabled:opacity-50"
          style={{
            background: "#D0F201",
            color: "#10180B",
            padding: "10px 20px",
            fontSize: 13,
          }}
        >
          {running ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Play className="h-4 w-4" />
          )}
          {running ? "Running..." : "Run & Submit"}
        </button>
      </div>

      {/* Results panel */}
      {(results || output) && (
        <div
          className="border-t max-h-48 overflow-y-auto"
          style={{ borderColor: "#38383a", background: "#141416" }}
        >
          <div className="p-4 space-y-2">
            {results?.map((r, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-xs"
                style={{ color: r.passed ? "#30d158" : "#ff453a" }}
              >
                {r.passed ? (
                  <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" />
                ) : (
                  <XCircle className="h-3.5 w-3.5 flex-shrink-0" />
                )}
                <span className="font-mono">{r.name}</span>
                {r.output && (
                  <span style={{ color: "#636366" }}>— {r.output}</span>
                )}
              </div>
            ))}
            {output && !results && (
              <pre
                className="text-xs font-mono whitespace-pre-wrap"
                style={{ color: "#98989d" }}
              >
                {output}
              </pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
