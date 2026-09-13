"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Zap, Clock, Terminal, Code2, Database, Globe } from "lucide-react";
import { WorkspaceShell } from "@/components/practice/WorkspaceShell";
import type { Workload } from "@/types/blog";

const categoryIcons: Record<string, typeof Code2> = {
  javascript: Code2,
  python: Terminal,
  linux: Terminal,
  sql: Database,
  web: Globe,
};

export function WorkloadPageContent({ workload }: { workload: Workload }) {
  const [started, setStarted] = React.useState(false);
  const [, setPassed] = React.useState(false);
  const Icon = categoryIcons[workload.category] || Code2;

  if (started) {
    return (
      <div className="flex min-h-screen items-stretch justify-center bg-black p-0 sm:items-center sm:p-2 lg:p-4">
        <div className="flex max-h-none w-full max-w-[1720px] flex-1 flex-col overflow-hidden border-border sm:max-h-[960px] sm:rounded-xl sm:border sm:shadow-2xl">
          <WorkspaceShell
            workload={workload}
            onComplete={() => setPassed(true)}
            onExit={() => setStarted(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 pt-6 lg:pt-8 pb-16">
      <Link
        href="/learn/practice"
        className="mb-6 inline-flex items-center gap-1.5 text-sm hover:opacity-70 transition-opacity"
        style={{ color: "#98989d" }}
      >
        <ArrowLeft className="h-4 w-4" />
        All Workloads
      </Link>

      {/* Brief card */}
      <div
        className="rounded-2xl p-6 sm:p-8 mb-6"
        style={{
          background: "#1c1c1e",
          border: "1px solid rgba(245,245,247,0.08)",
        }}
      >
        <div className="flex items-center gap-2 mb-4">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ background: "rgba(208,242,1,0.1)" }}
          >
            <Icon className="h-5 w-5" style={{ color: "#D0F201" }} />
          </div>
          <div>
            <span
              className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
              style={{
                background: `${workload.difficulty === "beginner" ? "#30d15815" : workload.difficulty === "intermediate" ? "#ff9f0a15" : "#ff453a15"}`,
                color: workload.difficulty === "beginner" ? "#30d158" : workload.difficulty === "intermediate" ? "#ff9f0a" : "#ff453a",
              }}
            >
              {workload.difficulty}
            </span>
          </div>
        </div>

        <h1
          className="font-heading text-2xl sm:text-3xl font-bold mb-4"
          style={{ color: "#f5f5f7" }}
        >
          {workload.title}
        </h1>

        <div
          className="prose prose-sm max-w-none mb-6"
          style={{ color: "#98989d", lineHeight: 1.7 }}
        >
          {workload.brief.split("\n").map((line, i) => (
            <p key={i} className="mb-2">
              {line}
            </p>
          ))}
        </div>

        <div className="flex items-center gap-4 text-xs" style={{ color: "#636366" }}>
          <span className="flex items-center gap-1">
            <Zap className="h-3.5 w-3.5" style={{ color: "#D0F201" }} />
            {workload.xpReward} XP
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            ~{Math.ceil(workload.brief.length / 200)} min
          </span>
        </div>
      </div>

      {/* Files preview */}
      <div
        className="rounded-2xl p-6 mb-6"
        style={{
          background: "#1c1c1e",
          border: "1px solid rgba(245,245,247,0.08)",
        }}
      >
        <h3 className="text-sm font-semibold mb-3" style={{ color: "#f5f5f7" }}>
          Starter Files
        </h3>
        <div className="space-y-2">
          {workload.starterFiles.map((file) => (
            <div
              key={file.name}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono"
              style={{ background: "#0a0a0a", color: "#98989d" }}
            >
              <span style={{ color: "#D0F201" }}>{file.name}</span>
              <span style={{ color: "#636366" }}>— {file.content.split("\n").length} lines</span>
            </div>
          ))}
        </div>
      </div>

      {/* Start button */}
      <button
        type="button"
        onClick={() => setStarted(true)}
        className="w-full inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all"
        style={{
          background: "#D0F201",
          color: "#10180B",
          padding: "16px 32px",
          fontSize: 15,
        }}
      >
        Start Workload
      </button>
    </div>
  );
}
