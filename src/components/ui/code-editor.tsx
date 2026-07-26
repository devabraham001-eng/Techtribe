"use client";

import * as React from "react";
import Editor, { type OnMount } from "@monaco-editor/react";

interface CodeEditorProps {
  value: string;
  onChange?: (value: string) => void;
  language?: string;
  height?: string | number;
  readOnly?: boolean;
  theme?: string;
}

const LANGUAGE_MAP: Record<string, string> = {
  javascript: "javascript",
  js: "javascript",
  typescript: "typescript",
  ts: "typescript",
  python: "python",
  py: "python",
  go: "go",
  rust: "rust",
  rs: "rust",
  cpp: "cpp",
  "c++": "cpp",
  c: "c",
  java: "java",
  ruby: "ruby",
  rb: "ruby",
  sql: "sql",
  html: "html",
  css: "css",
  bash: "shell",
  shell: "shell",
  sh: "shell",
};

export function CodeEditor({
  value,
  onChange,
  language = "javascript",
  height = 300,
  readOnly = false,
  theme = "vs-dark",
}: CodeEditorProps) {
  const monacoLanguage = LANGUAGE_MAP[language.toLowerCase()] || "plaintext";

  const handleMount: OnMount = (editor) => {
    editor.getModel()?.updateOptions({ tabSize: 2 });
  };

  return (
    <Editor
      height={height}
      language={monacoLanguage}
      value={value}
      onChange={(v) => onChange?.(v ?? "")}
      onMount={handleMount}
      theme={theme}
      options={{
        readOnly,
        minimap: { enabled: false },
        fontSize: 14,
        lineNumbers: "on",
        scrollBeyondLastLine: false,
        padding: { top: 12, bottom: 12 },
        automaticLayout: true,
        tabSize: 2,
        wordWrap: "on",
      }}
    />
  );
}
