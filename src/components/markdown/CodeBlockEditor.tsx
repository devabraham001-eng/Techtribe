"use client";

import * as React from "react";
import { CodeEditor } from "@/components/ui/code-editor";
import { Check, Copy } from "lucide-react";

interface CodeBlockEditorProps {
  children: string;
  className?: string;
  height?: number;
}

export function CodeBlockEditor({ children, className, height = 180 }: CodeBlockEditorProps) {
  const [copied, setCopied] = React.useState(false);
  const language = className?.replace("language-", "") || "text";

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(String(children).replace(/\n$/, ""));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  return (
    <div className="relative group my-6 rounded-lg overflow-hidden border border-border">
      <div className="flex items-center justify-between bg-muted/50 px-4 py-1.5 border-b border-border">
        <span className="text-xs text-muted-foreground font-mono">{language}</span>
        <button
          type="button"
          onClick={copyCode}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {copied ? (
            <><Check className="h-3 w-3" />Copied</>
          ) : (
            <><Copy className="h-3 w-3" />Copy code</>
          )}
        </button>
      </div>
      <div className="[&_.monaco-editor]:!pt-0">
        <CodeEditor
          value={String(children).replace(/\n$/, "")}
          language={language}
          height={height}
          readOnly
          theme="vs-dark"
        />
      </div>
    </div>
  );
}
