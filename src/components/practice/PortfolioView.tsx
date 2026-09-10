"use client";

import * as React from "react";
import Link from "next/link";
import { Code2, FileText, Zap, Flame, Trophy, Terminal, Database, Globe, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PortfolioData } from "@/lib/portfolio-data";

const categoryIcons: Record<string, typeof Code2> = {
  javascript: Code2,
  python: Terminal,
  linux: Terminal,
  sql: Database,
  web: Globe,
};

function getLevelName(level: number): string {
  if (level <= 1) return "Intern";
  if (level <= 3) return "Junior";
  if (level <= 5) return "Mid-Level";
  if (level <= 7) return "Senior";
  if (level <= 9) return "Lead";
  return "Staff";
}

export function PortfolioView({ data }: { data: PortfolioData & { author: NonNullable<PortfolioData["author"]> } }) {
  const { author, xp, stats, recentWorkloads, recentArticles } = data;

  return (
    <div className="min-h-screen" style={{ background: "#0a0a0a" }}>
      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 pt-16 md:pt-24 pb-12">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          {/* Avatar */}
          {author.avatarUrl ? (
            <img
              src={author.avatarUrl}
              alt={author.name}
              className="h-20 w-20 rounded-full object-cover"
              style={{ border: "3px solid #38383a" }}
            />
          ) : (
            <div
              className="h-20 w-20 rounded-full flex items-center justify-center text-2xl font-bold"
              style={{ background: "rgba(208,242,1,0.15)", color: "#D0F201" }}
            >
              {author.name.charAt(0)}
            </div>
          )}

          <div className="flex-1">
            <h1 className="font-heading text-2xl sm:text-3xl font-bold mb-1" style={{ color: "#f5f5f7" }}>
              {author.name}
            </h1>
            {author.bio && (
              <p className="text-sm mb-3" style={{ color: "#98989d" }}>
                {author.bio}
              </p>
            )}

            {/* Social links */}
            <div className="flex flex-wrap gap-2">
              {author.twitter && (
                <Button variant="outline" size="sm" asChild>
                  <a href={`https://twitter.com/${author.twitter}`} target="_blank" rel="noopener noreferrer">
                    <Globe className="h-4 w-4 mr-2" />
                    Twitter
                  </a>
                </Button>
              )}
              {author.github && (
                <Button variant="outline" size="sm" asChild>
                  <a href={`https://github.com/${author.github}`} target="_blank" rel="noopener noreferrer">
                    <Code2 className="h-4 w-4 mr-2" />
                    GitHub
                  </a>
                </Button>
              )}
              {author.linkedin && (
                <Button variant="outline" size="sm" asChild>
                  <a href={`https://linkedin.com/in/${author.linkedin}`} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    LinkedIn
                  </a>
                </Button>
              )}
              {author.website && (
                <Button variant="outline" size="sm" asChild>
                  <a href={author.website} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Website
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* XP & Stats */}
      <section className="mx-auto max-w-4xl px-6 pb-12">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="rounded-xl p-4" style={{ background: "#1c1c1e", border: "1px solid rgba(245,245,247,0.08)" }}>
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="h-4 w-4" style={{ color: "#D0F201" }} />
              <span className="text-[10px] uppercase tracking-wider" style={{ color: "#636366" }}>Level</span>
            </div>
            <div className="text-2xl font-heading font-bold" style={{ color: "#D0F201" }}>
              L{xp?.level ?? 1}
            </div>
            <div className="text-xs" style={{ color: "#98989d" }}>{getLevelName(xp?.level ?? 1)}</div>
          </div>

          <div className="rounded-xl p-4" style={{ background: "#1c1c1e", border: "1px solid rgba(245,245,247,0.08)" }}>
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4" style={{ color: "#D0F201" }} />
              <span className="text-[10px] uppercase tracking-wider" style={{ color: "#636366" }}>XP</span>
            </div>
            <div className="text-2xl font-heading font-bold" style={{ color: "#f5f5f7" }}>
              {stats.totalXp.toLocaleString()}
            </div>
          </div>

          <div className="rounded-xl p-4" style={{ background: "#1c1c1e", border: "1px solid rgba(245,245,247,0.08)" }}>
            <div className="flex items-center gap-2 mb-2">
              <Code2 className="h-4 w-4" style={{ color: "#30d158" }} />
              <span className="text-[10px] uppercase tracking-wider" style={{ color: "#636366" }}>Workloads</span>
            </div>
            <div className="text-2xl font-heading font-bold" style={{ color: "#f5f5f7" }}>
              {stats.workloadsCompleted}
            </div>
          </div>

          <div className="rounded-xl p-4" style={{ background: "#1c1c1e", border: "1px solid rgba(245,245,247,0.08)" }}>
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4" style={{ color: "#64d2ff" }} />
              <span className="text-[10px] uppercase tracking-wider" style={{ color: "#636366" }}>Articles</span>
            </div>
            <div className="text-2xl font-heading font-bold" style={{ color: "#f5f5f7" }}>
              {stats.articlesPublished}
            </div>
          </div>
        </div>

        {xp && xp.streakDays > 0 && (
          <div className="mt-4 flex items-center gap-2 text-xs" style={{ color: "#ff9f0a" }}>
            <Flame className="h-4 w-4" />
            <span>{xp.streakDays} day streak</span>
          </div>
        )}
      </section>

      {/* Recent Workloads */}
      {recentWorkloads.length > 0 && (
        <section className="mx-auto max-w-4xl px-6 pb-12">
          <h2 className="font-heading text-lg font-semibold mb-4" style={{ color: "#f5f5f7" }}>
            Completed Workloads
          </h2>
          <div className="space-y-2">
            {recentWorkloads.map((w) => {
              const Icon = categoryIcons[w.category] || Code2;
              return (
                <div
                  key={w.id}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors hover:bg-white/[0.02]"
                  style={{ background: "#1c1c1e", border: "1px solid rgba(245,245,247,0.08)" }}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" style={{ color: "#D0F201" }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate" style={{ color: "#f5f5f7" }}>{w.title}</div>
                    <div className="text-[10px]" style={{ color: "#636366" }}>
                      {w.difficulty} · {new Date(w.submittedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold" style={{ color: "#D0F201" }}>+{w.xpReward} XP</span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Recent Articles */}
      {recentArticles.length > 0 && (
        <section className="mx-auto max-w-4xl px-6 pb-16">
          <h2 className="font-heading text-lg font-semibold mb-4" style={{ color: "#f5f5f7" }}>
            Published Articles
          </h2>
          <div className="space-y-2">
            {recentArticles.map((a) => (
              <Link
                key={a.id}
                href={`/blog/${a.slug}`}
                className="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors hover:bg-white/[0.02]"
                style={{ background: "#1c1c1e", border: "1px solid rgba(245,245,247,0.08)" }}
              >
                <FileText className="h-4 w-4 flex-shrink-0" style={{ color: "#64d2ff" }} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate" style={{ color: "#f5f5f7" }}>{a.title}</div>
                  <div className="text-[10px]" style={{ color: "#636366" }}>
                    {a.category ?? "Uncategorized"} · {new Date(a.publishedAt).toLocaleDateString()}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Empty state */}
      {stats.workloadsCompleted === 0 && stats.articlesPublished === 0 && (
        <section className="mx-auto max-w-4xl px-6 pb-16 text-center">
          <p className="text-sm" style={{ color: "#636366" }}>
            No proof of work yet. Start by completing a workload or publishing an article.
          </p>
        </section>
      )}
    </div>
  );
}
