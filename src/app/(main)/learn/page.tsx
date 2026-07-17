import * as React from "react";
import Link from "next/link";
import { getLearningTracks } from "@/lib/learning-data";
import { ArrowRight, BookOpen, Sparkles, Cpu, Shield, Database, Code2, GraduationCap, Brain, ChevronRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Choose Your Learning Path — TechTribe",
  description: "Paths are collections of lessons designed to build deep skills in a particular area. Whether you're starting fresh or leveling up, there's a path for you.",
  openGraph: {
    title: "Choose Your Learning Path — TechTribe",
    description: "Build real-world skills with structured learning paths.",
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
  "ai-tools": "AI / ML",
  "mobile": "Mobile",
  "security": "Security",
  "career-freelancing": "Career",
};

export default async function LearnPage() {
  const tracks = await getLearningTracks();

  const categories = [...new Set(tracks.map((t) => t.category).filter(Boolean))] as string[];

  return (
    <div className="min-h-screen bg-background">
      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden bg-background">
        {/* Decorative shapes */}
        <svg className="absolute top-0 left-0 w-full pointer-events-none" viewBox="0 0 1440 200" fill="none" preserveAspectRatio="none">
          <path d="M0 120 Q 360 0, 720 100 T 1440 60 L 1440 0 L 0 0 Z" fill="#D0F201" opacity="0.04" />
          <path d="M0 80 Q 480 160, 960 60 T 1440 100 L 1440 0 L 0 0 Z" fill="#D0F201" opacity="0.025" />
        </svg>
        <svg className="absolute top-0 right-0 h-full pointer-events-none opacity-[0.03]" viewBox="0 0 400 600" fill="none" preserveAspectRatio="xMaxYMid meet">
          <circle cx="300" cy="200" r="250" stroke="#D0F201" strokeWidth="2" />
          <circle cx="350" cy="150" r="180" stroke="#D0F201" strokeWidth="1" opacity="0.5" />
        </svg>

        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 pb-12 sm:pb-16 relative">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs sm:text-sm mb-6" style={{ color: "#636366" }}>
            <Link href="/" className="hover:opacity-70 transition-opacity">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-muted-foreground">Paths</span>
          </nav>

          <div className="max-w-2xl">
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.1]">
              Shape <span className="text-primary">your future</span> self
            </h1>
            <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-xl leading-relaxed">
              Paths are collections of learnings designed to build deep skills in a particular area.
              Whether you&apos;re looking to earn achievements, build a collection of skill badges,
              or prepare for a certification, there are paths right for you.
            </p>
          </div>

          {/* Free trial banner */}
          <div className="mt-6 flex flex-wrap items-center gap-3 rounded-xl border p-4 sm:p-5" style={{ borderColor: "#D0F201", background: "rgba(208, 242, 1, 0.04)" }}>
            <p className="text-sm sm:text-base flex-1" style={{ color: "#f5f5f7" }}>
              <span className="font-semibold">Apply your skills in real projects.</span> Build a portfolio that speaks for itself.
            </p>
            <Link
              href="/learn"
              className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-all hover:opacity-90 whitespace-nowrap"
              style={{ background: "#D0F201", color: "#10180B" }}
            >
              Get started
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== CATEGORY FILTERS ===== */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pb-8">
        <div className="flex flex-wrap gap-3">
          {categories.length > 0 ? (
            categories.map((cat) => (
              <Link
                key={cat}
                href={`/learn?category=${cat}`}
                className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all hover:border-primary/50 hover:bg-primary/5"
                style={{ borderColor: "#38383a", color: "#98989d" }}
              >
                {categoryIcons[cat]}
                <span>{categoryLabels[cat] || cat}</span>
              </Link>
            ))
          ) : (
            <>
              {[
                { slug: "web-development", label: "Web Dev", icon: <Code2 className="h-5 w-5" /> },
                { slug: "backend-devops", label: "Backend & DevOps", icon: <Database className="h-5 w-5" /> },
                { slug: "ai-tools", label: "AI / ML", icon: <Brain className="h-5 w-5" /> },
                { slug: "mobile", label: "Mobile", icon: <Cpu className="h-5 w-5" /> },
                { slug: "security", label: "Security", icon: <Shield className="h-5 w-5" /> },
                { slug: "career-freelancing", label: "Career", icon: <GraduationCap className="h-5 w-5" /> },
              ].map((c) => (
                <div
                  key={c.slug}
                  className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium"
                  style={{ borderColor: "#38383a", color: "#98989d" }}
                >
                  {c.icon}
                  <span>{c.label}</span>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {/* ===== TRACK CARDS ===== */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pb-16">
        {tracks.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="mx-auto h-12 w-12" style={{ color: "#636366" }} />
            <h2 className="mt-4 text-xl font-semibold text-foreground">No paths yet</h2>
            <p className="mt-2" style={{ color: "#98989d" }}>Learning paths are being created. Check back soon!</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {tracks.map((track) => (
              <Link
                key={track.id}
                href={`/learn/${track.slug}`}
                className="group relative flex flex-col rounded-xl border p-5 transition-all hover:shadow-lg hover:-translate-y-0.5"
                style={{ borderColor: "#38383a", background: "#1c1c1e" }}
              >
                {track.category && (
                  <div className="mb-3 inline-flex items-center gap-1.5 text-xs font-medium text-primary">
                    {categoryIcons[track.category]}
                    <span>{categoryLabels[track.category] || track.category}</span>
                  </div>
                )}
                <h3 className="font-heading text-base sm:text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                  {track.title}
                </h3>
                {track.description && (
                  <p className="mt-2 text-sm leading-relaxed line-clamp-2" style={{ color: "#98989d" }}>
                    {track.description}
                  </p>
                )}
                <div className="mt-auto pt-4 flex items-center justify-between border-t" style={{ borderColor: "#38383a" }}>
                  <span className="text-xs" style={{ color: "#636366" }}>
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

        {/* Explore more */}
        <div className="mt-10 text-center">
          <Link
            href={tracks.length > 0 ? "/learn" : "#"}
            className="inline-flex items-center gap-2 rounded-lg border px-5 py-2.5 text-sm font-medium transition-all hover:bg-card"
            style={{ borderColor: "#38383a", color: "#f5f5f7" }}
          >
            Explore more paths
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* ===== MEDIA SECTION ===== */}
      <section className="border-y" style={{ borderColor: "#38383a", background: "#141416" }}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground leading-[1.15]">
                Build the future with <span className="text-primary">structured learning</span>
              </h2>
              <p className="mt-4 text-base sm:text-lg leading-relaxed" style={{ color: "#98989d" }}>
                <strong className="text-foreground">Stop searching. Start building.</strong> Our learning paths guide you
                step-by-step from fundamentals to real-world projects. Each path includes hands-on exercises,
                quizzes, and a final project to showcase your skills.
              </p>
              <div className="mt-6">
                <Link
                  href="/learn"
                  className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-all hover:opacity-90"
                  style={{ background: "#D0F201", color: "#10180B" }}
                >
                  Start learning free
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="relative rounded-xl overflow-hidden border" style={{ borderColor: "#38383a", background: "#1c1c1e" }}>
                <div className="aspect-video flex items-center justify-center" style={{ background: "linear-gradient(135deg, rgba(208, 242, 1, 0.08) 0%, rgba(208, 242, 1, 0.02) 100%)" }}>
                  <div className="text-center p-8">
                    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" className="mx-auto mb-4">
                      <rect x="4" y="4" width="72" height="72" rx="16" stroke="#D0F201" strokeWidth="2" opacity="0.3"/>
                      <rect x="16" y="16" width="48" height="48" rx="10" stroke="#D0F201" strokeWidth="1.5" opacity="0.5"/>
                      <path d="M35 30L50 40L35 50V30Z" fill="#D0F201" opacity="0.8"/>
                    </svg>
                    <p className="text-sm font-medium text-primary">Watch how learning paths work</p>
                    <p className="text-xs mt-1" style={{ color: "#636366" }}>2:34 min</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CREDENTIALS SECTION ===== */}
      <section className="py-16 sm:py-20 bg-background">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Which credential is right for you?
            </h2>
            <p className="mt-3 text-base" style={{ color: "#98989d" }}>
              Skill badges, certificates, or real-world projects — level up your career your way.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {/* Certificate */}
            <div className="rounded-xl border p-6 sm:p-8 transition-all hover:border-primary/30 hover:shadow-lg" style={{ borderColor: "#38383a", background: "#1c1c1e" }}>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ background: "rgba(208, 242, 1, 0.1)" }}>
                <GraduationCap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-heading text-lg font-bold text-foreground">Certificates</h3>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: "#98989d" }}>
                Unlock new career paths and gain in-demand skills. Complete a certificate learning path
                to earn a shareable digital credential. No prerequisites required.
              </p>
              <Link href="/learn" className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                Explore certificates <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Skill Badges */}
            <div className="rounded-xl border p-6 sm:p-8 transition-all hover:border-primary/30 hover:shadow-lg" style={{ borderColor: "#38383a", background: "#1c1c1e" }}>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ background: "rgba(208, 242, 1, 0.1)" }}>
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-heading text-lg font-bold text-foreground">Skill Badges</h3>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: "#98989d" }}>
                Prove your practical skills with badges. Complete a series of lessons,
                earn a badge, then share your achievements with peers and employers.
              </p>
              <Link href="/learn" className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                Explore skill badges <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Projects */}
            <div className="rounded-xl border p-6 sm:p-8 transition-all hover:border-primary/30 hover:shadow-lg" style={{ borderColor: "#38383a", background: "#1c1c1e" }}>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ background: "rgba(208, 242, 1, 0.1)" }}>
                <Code2 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-heading text-lg font-bold text-foreground">Portfolio Projects</h3>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: "#98989d" }}>
                Apply everything you&apos;ve learned by building real projects. Share your work with the
                community, get feedback, and publish to your portfolio.
              </p>
              <Link href="/learn" className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                Explore projects <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="relative overflow-hidden border-t" style={{ borderColor: "#38383a", background: "#141416" }}>
        <svg className="absolute bottom-0 left-0 w-full pointer-events-none" viewBox="0 0 1440 120" fill="none" preserveAspectRatio="none">
          <path d="M0 80 Q 360 120, 720 60 T 1440 80 L 1440 120 L 0 120 Z" fill="#D0F201" opacity="0.04" />
        </svg>
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center relative">
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
            Continue your learning journey
          </h2>
          <p className="mt-4 text-base sm:text-lg max-w-lg mx-auto" style={{ color: "#98989d" }}>
            Track your learning progress, check out featured content, and celebrate your achievements.
          </p>
          <Link
            href="/dashboard"
            className="mt-8 inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold transition-all hover:opacity-90"
            style={{ background: "#D0F201", color: "#10180B" }}
          >
            Visit dashboard
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

    </div>
  );
}
