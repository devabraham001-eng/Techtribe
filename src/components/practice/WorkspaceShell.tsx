"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import {
  ArrowLeft,
  ArrowRight,
  Bug,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Expand,
  FileCode2,
  FilePlus2,
  FileText,
  History,
  Loader2,
  Maximize2,
  NotebookPen,
  PanelLeft,
  LayoutGrid,
  Play,
  Plug,
  Plus,
  Rocket,
  Search,
  Send,
  Share2,
  Sparkles,
  SplitSquareHorizontal,
  SquareTerminal,
  Terminal,
  Wand2,
  X,
  XCircle,
} from "lucide-react";
import type { OnMount } from "@monaco-editor/react";
import { cn } from "@/lib/utils";
import type { Workload, WorkloadFile, TestResult } from "@/types/blog";

const Editor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-background">
      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" aria-label="Loading editor" />
    </div>
  ),
});

// Solution filename per category — must match the API's SOLUTION_FILE map
const SOLUTION_FILE: Record<string, { name: string; starter: string }> = {
  javascript: { name: "main.js", starter: "// Your code here\n" },
  web: { name: "main.js", starter: "// Your code here\n" },
  python: { name: "main.py", starter: "# Your code here\n" },
  linux: { name: "solution.sh", starter: "# Write your bash command here\n# Data files are in the same directory\n" },
  sql: { name: "query.sql", starter: "-- Write your query here\n" },
};

const MONACO_LANGUAGE: Record<string, string> = {
  javascript: "javascript",
  web: "javascript",
  python: "python",
  linux: "shell",
  sql: "sql",
};

const RUNNER_LABEL: Record<string, string> = {
  javascript: "Node.js",
  web: "Node.js",
  python: "Python 3",
  linux: "Bash",
  sql: "SQLite",
};

function ensureSolutionFile(category: string, starter: WorkloadFile[]): WorkloadFile[] {
  const solution = SOLUTION_FILE[category];
  if (!solution) return starter;
  if (starter.some((f) => f.name === solution.name)) return starter;
  return [...starter, { name: solution.name, content: solution.starter }];
}

function fileIcon(name: string): { Icon: typeof FileCode2; className: string } {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "sql") return { Icon: FileCode2, className: "text-orange-400" };
  if (ext === "sh") return { Icon: SquareTerminal, className: "text-emerald-400" };
  if (ext === "py") return { Icon: FileCode2, className: "text-blue-400" };
  if (ext === "txt") return { Icon: FileText, className: "text-muted-foreground" };
  return { Icon: FileCode2, className: "text-cyan-400" };
}

interface SubmissionRecord {
  passed: boolean;
  submitted_at: string;
  output?: string | null;
}

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
}

type PanelTab = "output" | "terminal" | "notes" | "debugger" | "integration" | "history";

export function WorkspaceShell({
  workload,
  onComplete,
  onExit,
}: {
  workload: Workload;
  onComplete: () => void;
  onExit: () => void;
}) {
  const initialFiles = React.useMemo(
    () => ensureSolutionFile(workload.category, workload.starterFiles),
    [workload.category, workload.starterFiles]
  );
  const initialNames = React.useMemo(() => new Set(initialFiles.map((f) => f.name)), [initialFiles]);
  const initialContents = React.useMemo(
    () => new Map(initialFiles.map((f) => [f.name, f.content])),
    [initialFiles]
  );

  const [files, setFiles] = React.useState<WorkloadFile[]>(initialFiles);
  const [activeFile, setActiveFile] = React.useState(() => {
    const idx = initialFiles.findIndex((f) => f.name === SOLUTION_FILE[workload.category]?.name);
    return idx >= 0 ? idx : 0;
  });
  const [running, setRunning] = React.useState(false);
  const [results, setResults] = React.useState<TestResult[] | null>(null);
  const [output, setOutput] = React.useState("");
  const [passed, setPassed] = React.useState<boolean | null>(null);
  const [runMs, setRunMs] = React.useState<number | null>(null);
  const [runAt, setRunAt] = React.useState<string | null>(null);

  const [explorerOpen, setExplorerOpen] = React.useState(true);
  const [filesExpanded, setFilesExpanded] = React.useState(true);
  const [fileQuery, setFileQuery] = React.useState("");
  const [panelOpen, setPanelOpen] = React.useState(true);
  const [panelTab, setPanelTab] = React.useState<PanelTab>("output");
  const [aiOpen, setAiOpen] = React.useState(true);
  const [history, setHistory] = React.useState<SubmissionRecord[]>([]);
  const [historyLoaded, setHistoryLoaded] = React.useState(false);
  const [notes, setNotes] = React.useState(() => {
    if (typeof window === "undefined") return "";
    try {
      return localStorage.getItem(`techtribe_notes_${workload.id}`) ?? "";
    } catch {
      return "";
    }
  });
  const [messages, setMessages] = React.useState<ChatMessage[]>(() => [
    { role: "user", text: "Explain what is happening in this code" },
    {
      role: "assistant",
      text: `This workload is "${workload.title}". ${workload.brief.split("\n")[0] ?? ""} Open the solution file and press Run when you are ready — I can walk through test failures with you.`,
    },
  ]);
  const [chatInput, setChatInput] = React.useState("");
  const [cursor, setCursor] = React.useState({ line: 1, col: 1 });
  const [scratchCount, setScratchCount] = React.useState(0);

  const editorRef = React.useRef<Parameters<OnMount>[0] | null>(null);
  const shellRef = React.useRef<HTMLDivElement>(null);

  const location =
    typeof window === "undefined"
      ? `techtribe.online/learn/practice/${workload.id.slice(0, 8)}`
      : `${window.location.host}/learn/practice/${workload.id.slice(0, 8)}`;

  const loadHistory = React.useCallback(async () => {
    try {
      const res = await fetch(`/api/practice/workloads/${workload.id}/submissions`);
      if (!res.ok) return;
      const data = await res.json();
      setHistory(
        (Array.isArray(data) ? data : []).map((s: { passed: boolean; submitted_at: string; output?: string | null }) => ({
          passed: s.passed,
          submitted_at: s.submitted_at,
          output: s.output ?? null,
        }))
      );
    } catch {
      /* history is best-effort */
    } finally {
      setHistoryLoaded(true);
    }
  }, [workload.id]);

  function openPanel(tab: PanelTab) {
    setPanelTab(tab);
    setPanelOpen(true);
    if (tab === "history" && !historyLoaded) void loadHistory();
  }

  const handleRun = async () => {
    setRunning(true);
    setResults(null);
    setOutput("");
    setPassed(null);
    setPanelTab("output");
    setPanelOpen(true);
    const startedAt = Date.now();

    try {
      // Scratch files are editor-only; submit the original workload files.
      const payload = files.filter((f) => initialNames.has(f.name));
      const res = await fetch(`/api/practice/workloads/${workload.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files: payload }),
      });

      if (!res.ok) {
        const err = await res.json();
        setOutput(err.detail ? `${err.error || "Execution failed"} (${err.detail})` : err.error || "Execution failed");
        return;
      }

      const data = await res.json();
      setPassed(data.passed);
      setOutput(data.output || "");
      if (data.results) setResults(data.results);
      if (data.passed) {
        onComplete();
        setHistoryLoaded(false);
      }
    } catch {
      setOutput("Network error — please try again.");
    } finally {
      const elapsed = Date.now() - startedAt;
      setRunMs(elapsed);
      setRunAt(
        new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
      );
      setRunning(false);
    }
  };

  const updateFile = (index: number, content: string) => {
    setFiles((prev) => prev.map((f, i) => (i === index ? { ...f, content } : f)));
  };

  function addScratchFile() {
    const next = scratchCount + 1;
    setScratchCount(next);
    const name = `scratch-${next}.txt`;
    setFiles((prev) => [...prev, { name, content: "" }]);
    setActiveFile(files.length);
    setFilesExpanded(true);
  }

  function closeFile(index: number) {
    const file = files[index];
    if (!file || initialNames.has(file.name)) return;
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setActiveFile((prev) => Math.max(0, Math.min(prev, files.length - 2)));
  }

  function formatActiveFile() {
    const content = files[activeFile]?.content ?? "";
    const formatted = content
      .split("\n")
      .map((line) => line.replace(/[ \t]+$/, ""))
      .join("\n")
      .replace(/\n$/, "")
      .concat("\n");
    updateFile(activeFile, formatted);
  }

  function toggleFullscreen() {
    const el = shellRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      void document.exitFullscreen().catch(() => {});
    } else {
      void el.requestFullscreen().catch(() => {});
    }
  }

  async function copyWorkloadLink() {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/learn/practice/${workload.id}`);
    } catch {
      /* clipboard unavailable */
    }
  }

  function persistNotes(value: string) {
    setNotes(value);
    try {
      localStorage.setItem(`techtribe_notes_${workload.id}`, value);
    } catch {
      /* storage unavailable */
    }
  }

  function coachReply(input: string): string {
    const q = input.toLowerCase();
    const failing = results?.filter((r) => !r.passed) ?? [];
    if (/(hint|stuck|help|clue)/.test(q)) {
      if (failing.length > 0) {
        return `Start here: "${failing[0].name}" is failing${failing[0].output ? ` — ${failing[0].output}` : ""}. Re-read that requirement in the brief and trace your code against it step by step.`;
      }
      return `Break the brief into the smallest steps you can test one at a time, then press Run. The test names in the Debugger tab tell you exactly what is checked: ${files.map((f) => f.name).filter((n) => initialNames.has(n)).join(", ")}.`;
    }
    if (/(test|fail|error|wrong|debug)/.test(q)) {
      if (!results) return "Press Run first — I will explain exactly which tests fail and why once I can see the output.";
      if (failing.length === 0) return "All tests are passing. Nice work — try the next workload to keep your streak going.";
      return `${failing.length} of ${results.length} tests failing: ${failing.map((r) => `"${r.name}"`).join(", ")}. Fix the first one and re-run.`;
    }
    if (/(file|where|code|folder)/.test(q)) {
      return `This workload has ${files.length} file${files.length === 1 ? "" : "s"}: ${files.map((f) => f.name).join(", ")}. Your solution goes in ${SOLUTION_FILE[workload.category]?.name ?? "the solution file"}.`;
    }
    if (/(xp|point|reward|score)/.test(q)) {
      return `This workload is worth ${workload.xpReward} XP${passed ? ", which you have already earned" : " once all tests pass"}. Difficulty: ${workload.difficulty}.`;
    }
    const firstLine = workload.brief.split("\n").find((line) => line.trim().length > 0) ?? workload.title;
    return `${firstLine} Ask me for a "hint", or ask about "tests", "files", or "XP".`;
  }

  function sendChat() {
    const text = chatInput.trim();
    if (!text) return;
    setChatInput("");
    setMessages((prev) => [...prev, { role: "user", text }, { role: "assistant", text: coachReply(text) }]);
  }

  const handleEditorMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    editor.onDidChangeCursorPosition((e) => {
      setCursor({ line: e.position.lineNumber, col: e.position.column });
    });
    monaco.editor.defineTheme("techtribe-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [],
      colors: { "editor.background": "#0a0a0a" },
    });
    monaco.editor.setTheme("techtribe-dark");
  };

  const activeName = files[activeFile]?.name ?? "";
  const language = MONACO_LANGUAGE[workload.category] ?? "plaintext";
  const runner = RUNNER_LABEL[workload.category] ?? workload.category;
  const visibleFiles = files.filter((f) => f.name.toLowerCase().includes(fileQuery.trim().toLowerCase()));
  const isDirty = (name: string) => initialContents.get(name) !== files.find((f) => f.name === name)?.content;

  const widgets: { id: PanelTab | "ai"; label: string; Icon: typeof Terminal; active: boolean }[] = [
    { id: "ai", label: "AI Chat", Icon: Sparkles, active: aiOpen },
    { id: "output", label: "Output", Icon: SquareTerminal, active: panelOpen && panelTab === "output" },
    { id: "notes", label: "Notes", Icon: NotebookPen, active: panelOpen && panelTab === "notes" },
    { id: "debugger", label: "Debugger", Icon: Bug, active: panelOpen && panelTab === "debugger" },
    { id: "terminal", label: "Terminal", Icon: Terminal, active: panelOpen && panelTab === "terminal" },
    { id: "integration", label: "Integration", Icon: Plug, active: panelOpen && panelTab === "integration" },
  ];

  function handleWidget(id: (typeof widgets)[number]["id"]) {
    if (id === "ai") {
      setAiOpen((prev) => !prev);
      return;
    }
    if (panelOpen && panelTab === id) {
      setPanelOpen(false);
      return;
    }
    openPanel(id);
  }

  return (
    <div ref={shellRef} className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-background text-xs text-foreground">
      {/* Browser chrome */}
      <header className="flex h-10 shrink-0 select-none items-center justify-between border-b border-border bg-secondary px-3 text-muted-foreground">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2" aria-hidden="true">
            <div className="h-3 w-3 rounded-full border border-[#e0443e] bg-[#ff5f56]" />
            <div className="h-3 w-3 rounded-full border border-[#dea123] bg-[#ffbd2e]" />
            <div className="h-3 w-3 rounded-full border border-[#1aab29] bg-[#27c93f]" />
          </div>
          <div className="hidden items-center space-x-2 pl-2 sm:flex">
            <button type="button" onClick={() => window.history.back()} aria-label="Go back" title="Go back" className="transition-colors hover:text-foreground">
              <ArrowLeft className="h-3.5 w-3.5" />
            </button>
            <button type="button" onClick={() => window.history.forward()} aria-label="Go forward" title="Go forward" className="transition-colors hover:text-foreground">
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
        <div className="flex w-56 items-center justify-center space-x-2 truncate rounded-md border border-border bg-background px-4 py-1 md:w-96">
          <span suppressHydrationWarning className="truncate tracking-tight text-muted-foreground">{location}</span>
        </div>
        <div className="flex items-center space-x-3">
          <button type="button" onClick={() => setExplorerOpen((v) => !v)} aria-label="Toggle explorer" title="Toggle explorer" className="transition-colors hover:text-foreground">
            <PanelLeft className="h-3.5 w-3.5" />
          </button>
          <button type="button" onClick={() => void copyWorkloadLink()} aria-label="Copy workload link" title="Copy workload link" className="transition-colors hover:text-foreground">
            <Share2 className="h-3.5 w-3.5" />
          </button>
          <button type="button" onClick={addScratchFile} aria-label="New scratch file" title="New scratch file" className="transition-colors hover:text-foreground">
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      </header>

      {/* IDE app header */}
      <div className="flex h-11 shrink-0 items-center justify-between border-b border-border bg-secondary px-3">
        <div className="flex min-w-0 items-center space-x-3">
          <button type="button" onClick={onExit} aria-label="Back to brief" title="Back to brief" className="shrink-0 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-3.5 w-3.5" />
          </button>
          <button type="button" onClick={() => setExplorerOpen((v) => !v)} aria-label="Toggle sidebar" title="Toggle sidebar" className="hidden shrink-0 text-muted-foreground hover:text-foreground md:block">
            <PanelLeft className="h-4 w-4" />
          </button>
          <span className="truncate text-xs font-medium text-foreground">{workload.title}</span>
        </div>
        <div className="hidden w-[340px] max-w-full sm:block">
          <button
            type="button"
            onClick={() => {
              setAiOpen(true);
              window.setTimeout(() => document.getElementById("ai-chat-input")?.focus(), 50);
            }}
            className="flex w-full cursor-pointer items-center rounded-md border border-border bg-background px-2.5 py-1 text-xs text-muted-foreground transition hover:border-fg-tertiary"
          >
            <span className="flex-grow truncate text-left">Ask AI &amp; Search</span>
            <kbd className="rounded border border-border bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground shadow-sm">
              Ctrl + K
            </kbd>
          </button>
        </div>
        <div className="flex shrink-0 items-center space-x-2">
          <button
            type="button"
            onClick={() => void handleRun()}
            disabled={running}
            className="flex items-center space-x-1.5 rounded border border-border bg-card px-2.5 py-1 text-xs text-foreground transition hover:bg-card-hover disabled:opacity-50"
          >
            <Rocket className="h-3.5 w-3.5 text-primary" />
            <span className="hidden text-[11px] font-medium min-[480px]:inline">Deploy</span>
          </button>
          <button type="button" onClick={() => setAiOpen((v) => !v)} aria-label="Toggle side panels" title="Toggle side panels" className="hidden rounded p-1.5 text-muted-foreground transition hover:bg-card-hover hover:text-foreground min-[480px]:block">
            <LayoutGrid className="h-3.5 w-3.5" />
          </button>
          <button type="button" onClick={() => void copyWorkloadLink()} aria-label="Share workload" title="Share workload" className="hidden rounded p-1.5 text-muted-foreground transition hover:bg-card-hover hover:text-foreground min-[480px]:block">
            <Share2 className="h-3.5 w-3.5" />
          </button>
          <div className="relative ml-1 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-tr from-primary/60 to-primary/20 text-[10px] font-bold text-primary-foreground" title="Signed in">
            <Terminal className="h-3 w-3" />
            <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-secondary" />
          </div>
        </div>
      </div>

      {/* Workspace */}
      <div className="relative flex min-h-0 flex-1 overflow-hidden">
        {/* Explorer */}
        {explorerOpen && (
          <aside className="hidden w-56 shrink-0 flex-col justify-between border-r border-border bg-secondary text-xs md:flex" aria-label="Explorer">
            <div className="flex min-h-0 flex-col">
              <div className="border-b border-border p-2">
                <div className="relative flex items-center">
                  <input
                    value={fileQuery}
                    onChange={(e) => setFileQuery(e.target.value)}
                    placeholder="Search"
                    aria-label="Search files"
                    className="w-full rounded border border-border bg-background px-2.5 py-1 text-[11px] text-foreground placeholder:text-fg-tertiary focus:border-fg-tertiary focus:outline-none"
                  />
                  <Search className="absolute right-2 h-3 w-3 text-fg-tertiary" aria-hidden="true" />
                </div>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto p-2">
                <div className="mb-1.5 flex items-center justify-between px-1 text-muted-foreground">
                  <button
                    type="button"
                    onClick={() => setFilesExpanded((v) => !v)}
                    aria-expanded={filesExpanded}
                    className="flex items-center space-x-1 text-[11px] font-medium uppercase tracking-wider"
                  >
                    {filesExpanded ? <ChevronDown className="h-2.5 w-2.5" /> : <ChevronRight className="h-2.5 w-2.5" />}
                    <span>Files</span>
                  </button>
                  <div className="flex items-center space-x-1.5">
                    <button type="button" onClick={addScratchFile} aria-label="New file" title="New file" className="transition-colors hover:text-foreground">
                      <FilePlus2 className="h-3 w-3" />
                    </button>
                    <span className="text-[10px] text-fg-tertiary" title={`${files.length} files`}>
                      {files.length}
                    </span>
                  </div>
                </div>
                {filesExpanded && (
                  <div className="space-y-0.5">
                    {visibleFiles.map((file) => {
                      const index = files.findIndex((f) => f.name === file.name);
                      const { Icon, className } = fileIcon(file.name);
                      return (
                        <button
                          key={file.name}
                          type="button"
                          onClick={() => setActiveFile(index)}
                          className={cn(
                            "flex w-full items-center space-x-2 truncate rounded px-2 py-1.5 text-left transition",
                            index === activeFile ? "bg-card-hover text-foreground" : "text-muted-foreground hover:bg-card/60"
                          )}
                        >
                          <Icon className={cn("h-3.5 w-3.5 shrink-0", className)} aria-hidden="true" />
                          <span className="truncate font-mono text-xs font-medium">{file.name}</span>
                          {isDirty(file.name) && <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-primary" title="Unsaved changes" />}
                        </button>
                      );
                    })}
                    {visibleFiles.length === 0 && (
                      <p className="px-2 py-3 text-[11px] text-fg-tertiary">No files match.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2 border-t border-border p-2">
              <div className="flex items-center justify-between px-1 text-muted-foreground">
                <span className="text-[11px] font-medium uppercase tracking-wider">Manager</span>
              </div>
              <div className="space-y-0.5">
                <div className="px-1 py-0.5 text-[11px] font-medium text-muted-foreground">Widgets</div>
                {widgets.map((widget) => {
                  const WidgetIcon = widget.Icon;
                  return (
                    <button
                      key={widget.id}
                      type="button"
                      onClick={() => handleWidget(widget.id)}
                      aria-pressed={widget.active}
                      className={cn(
                        "flex w-full items-center space-x-2.5 rounded px-2 py-1 text-left transition",
                        widget.active ? "text-foreground" : "text-muted-foreground hover:bg-card/60"
                      )}
                    >
                      <WidgetIcon className="h-3 w-3 shrink-0 text-primary" aria-hidden="true" />
                      <span>{widget.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>
        )}

        {/* Center */}
        <main className="flex min-w-0 flex-1 flex-col border-r border-border bg-background">
          {/* Tabs */}
          <div className="flex h-9 shrink-0 items-center justify-between border-b border-border bg-secondary px-2">
            <div className="flex h-full min-w-0 items-center space-x-1 overflow-x-auto no-scrollbar">
              {files.map((file, i) => {
                const { Icon, className } = fileIcon(file.name);
                const scratch = !initialNames.has(file.name);
                return (
                  <div
                    key={file.name}
                    className={cn(
                      "flex h-full shrink-0 items-center space-x-2 border-t-2 px-3 text-xs",
                      i === activeFile
                        ? "border-primary bg-background text-foreground"
                        : "border-transparent text-muted-foreground"
                    )}
                  >
                    <button type="button" onClick={() => setActiveFile(i)} className="flex items-center space-x-2" title={file.name}>
                      <Icon className={cn("h-3 w-3", className)} aria-hidden="true" />
                      <span className="font-mono text-[11px]">{file.name}</span>
                      {isDirty(file.name) && <span className="h-1.5 w-1.5 rounded-full bg-primary" title="Unsaved changes" />}
                    </button>
                    {scratch && (
                      <button type="button" onClick={() => closeFile(i)} aria-label={`Close ${file.name}`} className="text-fg-tertiary transition-colors hover:text-foreground">
                        <X className="h-2.5 w-2.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="flex shrink-0 items-center space-x-1.5 pl-2">
              <button
                type="button"
                onClick={() => void handleRun()}
                disabled={running}
                className="flex items-center space-x-1.5 rounded bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground shadow-sm transition hover:bg-primary-dark disabled:opacity-50"
              >
                {running ? <Loader2 className="h-2.5 w-2.5 animate-spin" /> : <Play className="h-2.5 w-2.5" fill="currentColor" aria-hidden="true" />}
                <span className="text-[11px]">{running ? "Running" : "Run"}</span>
              </button>
              <button type="button" onClick={() => setAiOpen((v) => !v)} aria-label="Split view" title="Split view" className="hidden p-1 text-muted-foreground hover:text-foreground min-[480px]:block">
                <SplitSquareHorizontal className="h-3 w-3" />
              </button>
              <button type="button" onClick={toggleFullscreen} aria-label="Fullscreen" title="Fullscreen" className="hidden p-1 text-muted-foreground hover:text-foreground min-[480px]:block">
                <Maximize2 className="h-3 w-3" />
              </button>
            </div>
          </div>

          {/* Breadcrumbs */}
          <div className="flex h-7 shrink-0 select-none items-center justify-between border-b border-border/50 bg-background px-3 text-[11px] text-muted-foreground">
            <div className="flex min-w-0 items-center space-x-1.5">
              <span className="shrink-0">My Code</span>
              <ChevronRight className="h-2 w-2 shrink-0 text-fg-tertiary" aria-hidden="true" />
              <span className="truncate font-mono text-foreground">{activeName}</span>
            </div>
            <button type="button" onClick={formatActiveFile} className="flex shrink-0 items-center space-x-1 text-[11px] transition-colors hover:text-foreground" title="Format file">
              <Wand2 className="h-3 w-3" aria-hidden="true" />
              <span>Format</span>
            </button>
          </div>

          {/* Editor */}
          <div className="min-h-0 flex-1 font-mono text-[13px]">
            <Editor
              value={files[activeFile]?.content ?? ""}
              language={language}
              onChange={(value) => updateFile(activeFile, value ?? "")}
              onMount={handleEditorMount}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                fontFamily: "var(--font-mono), monospace",
                automaticLayout: true,
                scrollBeyondLastLine: false,
                padding: { top: 8 },
                lineNumbersMinChars: 3,
                renderLineHighlight: "all",
                stickyScroll: { enabled: false },
                scrollbar: { verticalScrollbarSize: 8, horizontalScrollbarSize: 8 },
              }}
            />
          </div>

          {/* Status bar */}
          <div className="flex h-6 shrink-0 select-none items-center justify-between border-t border-border bg-secondary px-3 text-[10px] text-muted-foreground">
            <div className="flex items-center space-x-3">
              <button type="button" onClick={() => openPanel("history")} className="flex items-center transition-colors hover:text-foreground" title="Submission history">
                <History className="mr-1 h-3 w-3" aria-hidden="true" /> History
              </button>
              <span>
                Ln {cursor.line}, Col {cursor.col}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="flex cursor-pointer items-center space-x-1 transition-colors hover:text-foreground" title="Language mode">
                <FileCode2 className="mr-0.5 h-3 w-3 text-cyan-400" aria-hidden="true" />
                <span className="capitalize">{runner}</span>
              </span>
            </div>
          </div>

          {/* Bottom panel */}
          {panelOpen && (
            <div className="flex h-44 shrink-0 flex-col border-t border-border bg-background">
              <div className="flex h-8 shrink-0 items-center justify-between border-b border-border bg-secondary px-2 text-xs">
                <div className="flex min-w-0 items-center space-x-3 overflow-x-auto no-scrollbar">
                  {(["output", "terminal", "notes", "debugger", "integration", "history"] as PanelTab[]).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => openPanel(tab)}
                      aria-pressed={panelTab === tab}
                      className={cn(
                        "flex shrink-0 items-center space-x-1.5 px-1 py-1.5 capitalize transition-colors",
                        panelTab === tab
                          ? "border-b-2 border-primary font-medium text-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <span>{tab}</span>
                    </button>
                  ))}
                  <button type="button" onClick={addScratchFile} aria-label="New scratch file" title="New scratch file" className="shrink-0 text-muted-foreground hover:text-foreground">
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
                <div className="flex shrink-0 items-center space-x-2 text-muted-foreground">
                  <button type="button" onClick={() => setAiOpen((v) => !v)} aria-label="Split view" title="Split view" className="hover:text-foreground">
                    <SplitSquareHorizontal className="h-3 w-3" />
                  </button>
                  <button type="button" onClick={toggleFullscreen} aria-label="Fullscreen" title="Fullscreen" className="hover:text-foreground">
                    <Expand className="h-3 w-3" />
                  </button>
                  <button type="button" onClick={() => setPanelOpen(false)} aria-label="Close panel" title="Close panel" className="hover:text-foreground">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between border-b border-border/40 bg-secondary/50 px-3 py-1 text-[11px] text-muted-foreground">
                <div className="flex min-w-0 items-center space-x-2">
                  <span className={cn("h-2 w-2 shrink-0 rounded-full", passed === false ? "bg-red-500" : "bg-emerald-500")} />
                  <span className="truncate font-mono text-[10px]">My Code &gt; {activeName}</span>
                </div>
                <div className="flex shrink-0 items-center space-x-3 text-[10px]">
                  <button
                    type="button"
                    onClick={() => {
                      setAiOpen(true);
                      window.setTimeout(() => document.getElementById("ai-chat-input")?.focus(), 50);
                    }}
                    className="flex items-center space-x-1 text-primary transition hover:text-primary-dark"
                  >
                    <Sparkles className="h-3 w-3" aria-hidden="true" />
                    <span>Ask AI</span>
                  </button>
                  <span className="hidden font-mono text-fg-tertiary min-[480px]:inline">
                    {runMs !== null && runAt ? `${runMs}ms on ${runAt}` : running ? "Running…" : "Not run yet"}
                  </span>
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto p-3 font-mono text-xs">
                {panelTab === "output" && <OutputView results={results} output={output} running={running} />}
                {panelTab === "terminal" && (
                  <div className="space-y-1 text-muted-foreground">
                    <div>
                      <span className="text-primary">$ </span>run --workload {workload.id.slice(0, 8)}
                    </div>
                    {running && <div className="animate-pulse">Running…</div>}
                    {!running && !output && !results && <div className="text-fg-tertiary">Press Run to execute your solution.</div>}
                    {output && <pre className="whitespace-pre-wrap text-foreground">{output}</pre>}
                    {results && (
                      <div className={cn(passed ? "text-emerald-400" : "text-red-400")}>
                        exit code {passed ? 0 : 1} — {results.filter((r) => r.passed).length}/{results.length} tests passed
                      </div>
                    )}
                  </div>
                )}
                {panelTab === "notes" && (
                  <textarea
                    value={notes}
                    onChange={(e) => persistNotes(e.target.value)}
                    placeholder="Scratch notes for this workload — saved in this browser."
                    aria-label="Workload notes"
                    spellCheck={false}
                    className="h-full min-h-[5rem] w-full resize-none bg-transparent font-mono text-xs text-foreground placeholder:text-fg-tertiary focus:outline-none"
                  />
                )}
                {panelTab === "debugger" && <DebuggerView results={results} running={running} />}
                {panelTab === "integration" && (
                  <dl className="grid grid-cols-2 gap-x-6 gap-y-1.5 font-mono text-[11px] sm:grid-cols-4">
                    {[
                      ["Runtime", runner],
                      ["Language", language],
                      ["Files", String(files.length)],
                      ["XP reward", `${workload.xpReward} XP`],
                      ["Difficulty", workload.difficulty],
                      ["Category", workload.category],
                    ].map(([term, value]) => (
                      <div key={term} className="space-y-0.5">
                        <dt className="text-fg-tertiary">{term}</dt>
                        <dd className="truncate text-foreground">{value}</dd>
                      </div>
                    ))}
                  </dl>
                )}
                {panelTab === "history" && (
                  <HistoryView records={history} loaded={historyLoaded} onRetry={() => void loadHistory()} />
                )}
              </div>
            </div>
          )}
        </main>

        {/* AI panel */}
        {aiOpen && (
          <aside
            aria-label="AI assistant"
            className="absolute inset-y-0 right-0 z-20 flex w-80 max-w-[92vw] shrink-0 flex-col border-l border-border bg-secondary text-xs lg:static lg:w-[380px] lg:max-w-none xl:w-[430px]"
          >
            <div className="flex h-9 shrink-0 items-center justify-between border-b border-border bg-secondary px-3">
              <div className="-mb-px flex items-center space-x-2 border-t-2 border-primary bg-background px-2.5 py-1.5 text-xs text-foreground">
                <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_6px_rgba(208,242,1,0.7)]" />
                <span className="text-[11px] font-medium">AI Chat</span>
                <button type="button" onClick={() => setAiOpen(false)} aria-label="Close AI chat" className="ml-1 text-muted-foreground hover:text-foreground">
                  <X className="h-2.5 w-2.5" />
                </button>
              </div>
              <div className="flex items-center space-x-1.5 text-muted-foreground">
                <button type="button" onClick={() => setAiOpen(false)} aria-label="Split view" title="Split view" className="p-1 hover:text-foreground">
                  <SplitSquareHorizontal className="h-3 w-3" />
                </button>
                <button type="button" onClick={toggleFullscreen} aria-label="Fullscreen" title="Fullscreen" className="p-1 hover:text-foreground">
                  <Expand className="h-3 w-3" />
                </button>
              </div>
            </div>
            <div className="flex shrink-0 items-center justify-between border-b border-border px-3 py-2 text-muted-foreground">
              <div className="flex min-w-0 cursor-pointer items-center space-x-1 text-xs hover:text-foreground" title={workload.brief}>
                <span className="truncate">{workload.title} Explanation</span>
                <ChevronDown className="h-2.5 w-2.5 shrink-0" aria-hidden="true" />
              </div>
            </div>
            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3">
              {messages.map((message, i) =>
                message.role === "user" ? (
                  <div key={i} className="flex justify-end">
                    <div className="max-w-[85%] rounded-xl border border-border bg-card-hover px-3 py-1.5 text-[12px] text-foreground shadow-sm">
                      {message.text}
                    </div>
                  </div>
                ) : (
                  <div key={i} className="flex items-start space-x-2">
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-primary/50 bg-primary/10 text-primary">
                      <Sparkles className="h-[11px] w-[11px]" aria-hidden="true" />
                    </div>
                    <div className="flex-1 space-y-2 text-[12px] leading-relaxed text-muted-foreground">
                      <p>{message.text}</p>
                      {results && i === messages.length - 1 && (
                        <div className="space-y-1 rounded-md border border-border bg-background p-2 font-mono text-[11px]">
                          {results.slice(0, 4).map((result, j) => (
                            <div key={j} className={result.passed ? "text-emerald-400" : "text-red-400"}>
                              {result.passed ? "✓" : "✗"} {result.name}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )
              )}
            </div>
            <div className="shrink-0 border-t border-border bg-secondary p-3">
              <div className="rounded-lg border border-border bg-background p-2 transition focus-within:border-primary/70">
                <div className="flex items-center justify-between gap-2 pb-1">
                  <input
                    id="ai-chat-input"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendChat();
                      }
                    }}
                    placeholder="Type Something..."
                    aria-label="Ask the AI coach"
                    className="w-full border-none bg-transparent p-0 text-xs text-foreground placeholder:text-fg-tertiary focus:outline-none focus:ring-0"
                  />
                  <button
                    type="button"
                    onClick={() => setChatInput((prev) => (prev ? `${prev} @${activeName}` : `@${activeName} `))}
                    className="flex shrink-0 items-center space-x-1 rounded border border-border bg-card px-2 py-0.5 font-mono text-[10px] text-muted-foreground transition hover:text-foreground"
                    title={`Attach ${activeName} to your question`}
                  >
                    <span className="max-w-[90px] truncate">{activeName}</span>
                  </button>
                </div>
                <div className="mt-2 flex items-center justify-between border-t border-border/40 pt-2 text-muted-foreground">
                  <span className="flex items-center space-x-1 text-[11px]">
                    <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                    <span className="hidden min-[400px]:inline">Ask for a hint, tests, or files</span>
                  </span>
                  <button
                    type="button"
                    onClick={sendChat}
                    disabled={!chatInput.trim()}
                    aria-label="Send message"
                    className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-md transition hover:bg-primary-dark disabled:opacity-40"
                  >
                    <Send className="h-3 w-3" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

function OutputView({
  results,
  output,
  running,
}: {
  results: TestResult[] | null;
  output: string;
  running: boolean;
}) {
  if (running) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> Running tests…
      </div>
    );
  }
  if (!results && !output) {
    return <p className="text-fg-tertiary">Press Run to execute your solution. Output appears here.</p>;
  }
  return (
    <div className="space-y-1">
      {results?.map((result, i) => (
        <div key={i} className={cn("flex items-center gap-2", result.passed ? "text-emerald-400" : "text-red-400")}>
          {result.passed ? (
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          ) : (
            <XCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          )}
          <span>{result.name}</span>
          {result.output && <span className="truncate text-muted-foreground">— {result.output}</span>}
        </div>
      ))}
      {output && !results && <pre className="whitespace-pre-wrap text-muted-foreground">{output}</pre>}
    </div>
  );
}

function DebuggerView({ results, running }: { results: TestResult[] | null; running: boolean }) {
  if (running) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> Debugging…
      </div>
    );
  }
  if (!results) {
    return <p className="text-fg-tertiary">Run your code to inspect per-test results here.</p>;
  }
  const failing = results.filter((r) => !r.passed);
  return (
    <div className="space-y-1.5">
      <p className="text-[11px] text-muted-foreground">
        {results.length - failing.length}/{results.length} passing
      </p>
      {results.map((result, i) => (
        <div key={i} className="rounded-md border border-border bg-secondary px-2 py-1.5">
          <div className={cn("flex items-center gap-2", result.passed ? "text-emerald-400" : "text-red-400")}>
            {result.passed ? (
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            ) : (
              <XCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            )}
            <span className="truncate">{result.name}</span>
          </div>
          {result.output && <p className="mt-1 truncate pl-5 text-[11px] text-muted-foreground">{result.output}</p>}
        </div>
      ))}
    </div>
  );
}

function HistoryView({
  records,
  loaded,
  onRetry,
}: {
  records: SubmissionRecord[];
  loaded: boolean;
  onRetry: () => void;
}) {
  if (!loaded) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> Loading history…
      </div>
    );
  }
  if (records.length === 0) {
    return (
      <div className="flex items-center justify-between gap-2">
        <p className="text-fg-tertiary">No submissions yet.</p>
        <button type="button" onClick={onRetry} className="text-[11px] text-primary hover:underline">
          Retry
        </button>
      </div>
    );
  }
  return (
    <div className="space-y-1">
      {records.map((record, i) => (
        <div key={i} className="flex items-center gap-2 text-[11px]">
          <span className={cn("flex items-center gap-1 font-medium", record.passed ? "text-emerald-400" : "text-red-400")}>
            {record.passed ? <CheckCircle2 className="h-3 w-3" aria-hidden="true" /> : <XCircle className="h-3 w-3" aria-hidden="true" />}
            {record.passed ? "Passed" : "Failed"}
          </span>
          <span className="text-fg-tertiary">
            {new Date(record.submitted_at).toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      )      )}
    </div>
  );
}
