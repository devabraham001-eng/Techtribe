import * as React from "react";
import Link from "next/link";
import { getLearningTracks } from "@/lib/learning-data";
import { BookOpen, GraduationCap, Code2, Database, Shield, Cpu, Brain, Bot, ArrowRight, Sparkles } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Learning Paths — TechTribe",
  description: "Choose a learning path and start building real-world skills. Structured tracks with hands-on projects.",
  openGraph: {
    title: "Learning Paths — TechTribe",
    description: "Structured tracks with hands-on projects to build real-world skills.",
  },
};

const categoryIcons: Record<string, React.ReactNode> = {
  "web-development": <Code2 className="h-5 w-5" />,
  "backend-devops": <Database className="h-5 w-5" />,
  "ai-tools": <Brain className="h-5 w-5" />,
  "mobile": <Cpu className="h-5 w-5" />,
  "security": <Shield className="h-5 w-5" />,
  "career-freelancing": <GraduationCap className="h-5 w-5" />,
};

const categoryLabels: Record<string, string> = {
  "web-development": "Web Dev",
  "backend-devops": "Backend & DevOps",
  "ai-tools": "AI & ML",
  "mobile": "Mobile",
  "security": "Security",
  "career-freelancing": "Career",
};

export default async function LearnPage() {
  const tracks = await getLearningTracks();

  const categories = [...new Set(tracks.map((t) => t.category).filter(Boolean))] as string[];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-primary/5 to-background">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-16 pb-20 sm:pt-24 sm:pb-28">
          <div className="max-w-2xl">
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground">
              Shape <span className="text-primary">your future</span> self
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-xl">
              Paths are collections of lessons designed to build deep skills in a particular area.
              Whether you&apos;re starting fresh or leveling up, there&apos;s a path for you.
            </p>
          </div>
        </div>
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
      </section>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Category filters */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-10">
            {categories.map((cat) => (
              <div
                key={cat}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground"
              >
                {categoryIcons[cat]}
                <span>{categoryLabels[cat] || cat}</span>
              </div>
            ))}
          </div>
        )}

        {/* Track grid */}
        {tracks.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h2 className="mt-4 text-xl font-semibold text-foreground">No paths yet</h2>
            <p className="mt-2 text-muted-foreground">Learning paths are being created. Check back soon!</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tracks.map((track) => (
              <Link
                key={track.id}
                href={`/learn/${track.slug}`}
                className="group relative flex flex-col rounded-xl border border-border bg-card p-6 hover:border-primary/30 hover:shadow-lg transition-all"
              >
                {/* Category badge */}
                {track.category && (
                  <div className="mb-3 inline-flex items-center gap-1.5 text-xs font-medium text-primary">
                    {categoryIcons[track.category]}
                    <span>{categoryLabels[track.category] || track.category}</span>
                  </div>
                )}

                <h3 className="font-heading text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                  {track.title}
                </h3>

                {track.description && (
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed line-clamp-2">
                    {track.description}
                  </p>
                )}

                <div className="mt-auto pt-4 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {track.lessonCount} lesson{track.lessonCount !== 1 ? "s" : ""}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    Start path <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* CTA */}
        <section className="mt-16 rounded-xl border border-border bg-gradient-to-br from-primary/5 to-background p-8 sm:p-12 text-center">
          <Sparkles className="mx-auto h-8 w-8 text-primary" />
          <h2 className="mt-4 font-heading text-2xl sm:text-3xl font-bold text-foreground">
            Continue your learning journey
          </h2>
          <p className="mt-2 text-muted-foreground max-w-md mx-auto">
            Track your progress, earn achievements, and share your work with the community.
          </p>
          <Link
            href="/dashboard"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Visit dashboard <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      </div>
    </div>
  );
}
