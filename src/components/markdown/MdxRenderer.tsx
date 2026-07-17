"use client";

import * as React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";
import { CodeBlock } from "./CodeBlock";

interface MdxRendererProps {
  content: string;
  className?: string;
}

function getEmbed(url: string): { type: string; src: string } | null {
  const yt = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/
  );
  if (yt) return { type: "youtube", src: `https://www.youtube.com/embed/${yt[1]}` };

  const cp = url.match(/codepen\.io\/([^/]+)\/pen\/([a-zA-Z0-9_-]+)/);
  if (cp) return { type: "codepen", src: `https://codepen.io/${cp[1]}/embed/${cp[2]}?default-tab=result` };

  const loom = url.match(/loom\.com\/share\/([a-f0-9]+)/);
  if (loom) return { type: "loom", src: `https://www.loom.com/embed/${loom[1]}` };

  const figma = url.match(/figma\.com\/(file|proto)\/([a-zA-Z0-9]+)/);
  if (figma) return { type: "figma", src: `https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(url)}` };

  return null;
}

const components: Partial<Components> = {
  code({ className, children, ...props }) {
    const isInline = !className || !className.startsWith("language-");
    if (isInline) {
      return (
        <code
          className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono text-foreground before:content-none after:content-none"
          {...props}
        >
          {children}
        </code>
      );
    }
    return <CodeBlock className={className}>{String(children)}</CodeBlock>;
  },

  a({ href, children, ...props }) {
    if (href) {
      const embed = getEmbed(href);
      if (embed) {
        if (embed.type === "youtube" || embed.type === "loom") {
          return (
            <div className="aspect-video rounded-lg overflow-hidden my-6">
              <iframe
                src={embed.src}
                className="w-full h-full"
                allowFullScreen
                title="Embedded media"
              />
            </div>
          );
        }
        return (
          <div className="my-6">
            <iframe
              className="w-full rounded-lg border border-border"
              height={embed.type === "codepen" ? 400 : 500}
              src={embed.src}
              allowFullScreen
              title="Embedded media"
            />
          </div>
        );
      }
    }
    return (
      <a href={href} className="text-primary hover:underline" {...props}>
        {children}
      </a>
    );
  },

  img({ src, alt }) {
    return (
      <img
        src={src}
        alt={alt || ""}
        className="rounded-lg w-full h-auto my-6 border border-border"
        loading="lazy"
      />
    );
  },

  video({ src, ...props }) {
    return (
      <video
        src={src}
        controls
        className="rounded-lg w-full my-6 border border-border"
        {...props}
      />
    );
  },

  blockquote({ children }) {
    return (
      <blockquote className="border-l-2 border-primary pl-4 sm:pl-5 italic text-muted-foreground my-6 sm:my-8">
        {children}
      </blockquote>
    );
  },

  h1({ children }) {
    return (
      <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight mt-8 mb-4 text-foreground">
        {children}
      </h1>
    );
  },

  h2({ children }) {
    return (
      <h2 className="font-heading text-xl sm:text-2xl font-semibold tracking-tight mt-8 sm:mt-10 mb-4 text-foreground">
        {children}
      </h2>
    );
  },

  h3({ children }) {
    return (
      <h3 className="font-heading text-lg sm:text-xl font-semibold tracking-tight mt-6 sm:mt-8 mb-3 text-foreground">
        {children}
      </h3>
    );
  },

  p({ children }) {
    return (
      <p className="mb-5 sm:mb-6 leading-relaxed text-sm sm:text-base text-muted-foreground break-words">
        {children}
      </p>
    );
  },

  ul({ children }) {
    return (
      <ul className="list-disc pl-6 mb-5 space-y-1.5 text-sm sm:text-base text-muted-foreground">
        {children}
      </ul>
    );
  },

  ol({ children }) {
    return (
      <ol className="list-decimal pl-6 mb-5 space-y-1.5 text-sm sm:text-base text-muted-foreground">
        {children}
      </ol>
    );
  },

  li({ children }) {
    return <li className="leading-relaxed">{children}</li>;
  },

  hr() {
    return <hr className="my-8 sm:my-10 border-border" />;
  },

  table({ children }) {
    return (
      <div className="overflow-x-auto my-6">
        <table className="w-full border-collapse text-sm">{children}</table>
      </div>
    );
  },

  th({ children }) {
    return (
      <th className="border border-border bg-muted px-3 py-2 text-left font-medium text-foreground">
        {children}
      </th>
    );
  },

  td({ children }) {
    return (
      <td className="border border-border px-3 py-2 text-muted-foreground">
        {children}
      </td>
    );
  },
};

export function MdxRenderer({ content, className = "" }: MdxRendererProps) {
  return (
    <div className={`max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
