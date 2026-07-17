"use client";

import * as React from "react";
import { codeToHtml } from "shiki";
import { Check, Copy } from "lucide-react";

interface CodeBlockProps {
  children: string;
  className?: string;
}

export function CodeBlock({ children, className }: CodeBlockProps) {
  const [html, setHtml] = React.useState<string>("");
  const [copied, setCopied] = React.useState(false);
  const language = className?.replace("language-", "") || "text";

  React.useEffect(() => {
    codeToHtml(children.replace(/\n$/, ""), {
      lang: language,
      theme: "github-dark",
    }).then(setHtml);
  }, [children, language]);

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(children.replace(/\n$/, ""));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  }

  return (
    <div className="relative group my-6 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between bg-[#0d1117] px-4 py-1.5 border-b border-[#30363d]">
        <span className="text-xs text-[#8b949e] font-mono">{language}</span>
        <button
          type="button"
          onClick={copyCode}
          className="inline-flex items-center gap-1 text-xs text-[#8b949e] hover:text-[#e6edf3] transition-colors"
        >
          {copied ? (
            <><Check className="h-3 w-3" />Copied</>
          ) : (
            <><Copy className="h-3 w-3" />Copy code</>
          )}
        </button>
      </div>
      {html ? (
        <div
          className="[&>pre]:m-0 [&>pre]:rounded-none [&>pre]:bg-[#0d1117] [&>pre]:px-4 [&>pre]:py-3 [&>pre]:text-sm [&>pre]:leading-relaxed"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <pre className="bg-[#0d1117] px-4 py-3 text-sm overflow-x-auto">
          <code>{children}</code>
        </pre>
      )}
    </div>
  );
}
