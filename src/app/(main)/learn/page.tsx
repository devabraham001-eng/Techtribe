import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ChevronRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Choose Your Learning Path — TechTribe",
  description: "Paths are collections of learnings designed to build deep skills in a particular area. Whether you're looking to earn achievements, build a collection of skill badges, or prepare for a certification, there are paths right for you.",
  openGraph: {
    title: "Choose Your Learning Path — TechTribe",
    description: "Build real-world skills with structured learning paths.",
  },
};

const demoPaths = [
  {
    id: "1",
    title: "Web Development Fundamentals",
    description: "Learn HTML, CSS, JavaScript and build your first web app from scratch. No experience needed.",
    slug: "web-development-fundamentals",
    category: "web-development",
    lessonCount: 12,
  },
  {
    id: "2",
    title: "React & Modern Frontend",
    description: "Master React, Next.js, and modern frontend tooling. Build production-ready interfaces.",
    slug: "react-modern-frontend",
    category: "web-development",
    lessonCount: 18,
  },
  {
    id: "3",
    title: "Backend Engineering with Node.js",
    description: "Build scalable APIs, work with databases, and deploy backend services to the cloud.",
    slug: "backend-engineering-nodejs",
    category: "backend-devops",
    lessonCount: 14,
  },
  {
    id: "4",
    title: "Python & Data Science",
    description: "From Python basics to data analysis, visualization, and machine learning fundamentals.",
    slug: "python-data-science",
    category: "ai-tools",
    lessonCount: 16,
  },
  {
    id: "5",
    title: "DevOps & Cloud Infrastructure",
    description: "Learn Docker, Kubernetes, CI/CD pipelines, and cloud deployment on AWS and GCP.",
    slug: "devops-cloud-infrastructure",
    category: "backend-devops",
    lessonCount: 20,
  },
  {
    id: "6",
    title: "Mobile Development with React Native",
    description: "Build cross-platform mobile apps with React Native. Deploy to iOS and Android stores.",
    slug: "mobile-react-native",
    category: "mobile",
    lessonCount: 15,
  },
];

const categoryIcons: Record<string, string> = {
  "web-development": "💻",
  "backend-devops": "⚙️",
  "ai-tools": "🤖",
  "mobile": "📱",
  "security": "🔒",
  "career-freelancing": "💼",
};

const categoryLabels: Record<string, string> = {
  "web-development": "Web Dev",
  "backend-devops": "Backend & DevOps",
  "ai-tools": "AI / ML",
  "mobile": "Mobile",
  "security": "Security",
  "career-freelancing": "Career",
};

const allCategories = [
  { slug: "web-development", label: "Web Dev", icon: "💻" },
  { slug: "backend-devops", label: "Backend & DevOps", icon: "⚙️" },
  { slug: "ai-tools", label: "AI / ML", icon: "🤖" },
  { slug: "mobile", label: "Mobile", icon: "📱" },
  { slug: "security", label: "Security", icon: "🔒" },
  { slug: "career-freelancing", label: "Career", icon: "💼" },
];

export default async function LearnPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="paths-wrapper" style={{ position: "relative" }}>
        {/* Decorative shapes - matching Google Skills style */}
        <svg
          className="paths-shape paths-shape-top-full"
          style={{ position: "absolute", top: 0, left: 0, width: "100%", pointerEvents: "none", zIndex: 0 }}
          viewBox="0 0 1440 260"
          fill="none"
          preserveAspectRatio="none"
        >
          <path d="M0 180 C 360 60, 720 220, 1080 120 S 1440 200, 1440 200 L 1440 0 L 0 0 Z" fill="#D0F201" opacity="0.04" />
        </svg>
        <svg
          className="paths-shape paths-shape-middle"
          style={{ position: "absolute", top: 140, left: 0, width: "100%", pointerEvents: "none", zIndex: 0 }}
          viewBox="0 0 1440 200"
          fill="none"
          preserveAspectRatio="none"
        >
          <path d="M0 100 C 480 200, 960 40, 1440 120 L 1440 0 L 0 0 Z" fill="#D0F201" opacity="0.025" />
        </svg>

        {/* ===== HERO / PATHS INTRO ===== */}
        <section className="paths-intro" style={{ position: "relative", zIndex: 1 }}>
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 pb-8">
            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs sm:text-sm mb-8" style={{ color: "#636366" }}>
              <Link href="/" className="hover:opacity-70 transition-opacity">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              </Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span style={{ color: "#98989d" }}>Paths</span>
            </nav>

            <h2 className="paths-headline font-heading text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.1]" style={{ maxWidth: 720 }}>
              Shape <strong className="text-primary">your future</strong> self
            </h2>
            <p className="paths-description ql-body-large mt-4 text-base sm:text-lg leading-relaxed" style={{ color: "#98989d", maxWidth: 680 }}>
              Paths are collections of learnings designed to build deep skills in a particular area.
              Whether you&apos;re looking to earn achievements, build a collection of skill badges,
              or prepare for a certification, there are paths right for you. When you&apos;re done,
              share your accomplishments on social media and hiring platforms like LinkedIn.
            </p>

            {/* Free trial banner */}
            <aside aria-label="Get started" className="mt-8" style={{ maxWidth: 680 }}>
              <div className="console-free-trial flex flex-wrap items-center gap-3 rounded-xl border p-4 sm:p-5" style={{ borderColor: "#D0F201", background: "rgba(208, 242, 1, 0.04)" }}>
                <p className="text-sm sm:text-base flex-1" style={{ color: "#f5f5f7" }}>
                  Apply your skills in real projects.
                </p>
                <div className="console-free-trial-actions flex-shrink-0">
                  <Link
                    href="/learn"
                    className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-all hover:opacity-90"
                    style={{ background: "#D0F201", color: "#10180B" }}
                  >
                    Get started
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </section>

        {/* ===== CATEGORY FILTERS ===== */}
        <section className="paths-categories" style={{ position: "relative", zIndex: 1 }}>
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pb-6">
            <div className="flex flex-wrap gap-4">
              {allCategories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/learn?category=${cat.slug}`}
                  className="category-block inline-flex items-center gap-2.5 rounded-xl border border-border px-4 py-3 text-sm font-medium transition-all hover:border-primary/40 hover:bg-primary/[0.03]"
                  style={{ color: "#98989d", minWidth: 120 }}
                >
                  <span className="category-icon text-lg" role="img" aria-label={cat.label}>{cat.icon}</span>
                  <span className="category-title" style={{ color: "#f5f5f7" }}>{cat.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ===== PATH CARDS ===== */}
        <section className="paths-list" style={{ position: "relative", zIndex: 1 }}>
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pb-12">
            <div className="learning-plans-grid grid gap-5 sm:grid-cols-2">
              {demoPaths.map((track) => (
                <Link
                  key={track.id}
                  href={`/learn/${track.slug}`}
                  className="activity-card group relative flex flex-col rounded-xl border transition-all"
                  style={{
                    borderColor: "#38383a",
                    background: "#1c1c1e",
                  }}
                >
                  <div className="p-5 sm:p-6 flex-1">
                    <h3 className="font-heading text-base sm:text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                      {track.title}
                    </h3>
                    {track.description && (
                      <p className="mt-2 text-sm leading-relaxed line-clamp-2" style={{ color: "#98989d" }}>
                        {track.description}
                      </p>
                    )}
                  </div>
                  <div className="px-5 sm:px-6 pb-4 sm:pb-5 flex items-center justify-between">
                    {track.category && (
                      <span className="text-xs" style={{ color: "#636366" }}>
                        {categoryIcons[track.category]} {categoryLabels[track.category] || track.category}
                      </span>
                    )}
                    <span className="text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity ml-auto">
                      Start path <ArrowRight className="h-3 w-3 inline" />
                    </span>
                  </div>
                  {/* Metadata bar like Google's "Managed by..." */}
                  <div className="border-t rounded-b-xl px-5 sm:px-6 py-2.5" style={{ borderColor: "#38383a", background: "rgba(255,255,255,0.02)" }}>
                    <span className="text-xs" style={{ color: "#636366" }}>
                      {track.lessonCount} lesson{track.lessonCount !== 1 ? "s" : ""}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ===== EXPLORE MORE ===== */}
        <section className="explore text-center pb-16" style={{ position: "relative", zIndex: 1 }}>
          <Link
            href="/learn"
            className="inline-flex items-center gap-2 rounded-lg border px-5 py-2.5 text-sm font-medium transition-all hover:bg-card"
            style={{ borderColor: "#38383a", color: "#f5f5f7" }}
          >
            Explore more paths
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>

        {/* ===== CREDENTIALS SECTION ===== */}
        <section className="credentials border-y" style={{ borderColor: "#38383a", background: "#141416", position: "relative", zIndex: 1 }}>
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                Which credential is right for you?
              </h2>
              <p className="mt-3 text-base" style={{ color: "#98989d" }}>
                Certifications can be a big step, and a big investment. Need to build your skills first?
                Explore our Skill Badges and Certificates.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {/* Certificates */}
              <div className="rounded-xl border p-6 sm:p-8 text-center transition-all hover:border-primary/30 hover:shadow-lg" style={{ borderColor: "#38383a", background: "#1c1c1e" }}>
                <div className="w-16 h-16 mx-auto mb-5 rounded-xl flex items-center justify-center overflow-hidden" style={{ background: "rgba(208, 242, 1, 0.08)" }}>
                  <Image src="/ttlg.png" alt="TechTribe" width={36} height={36} className="h-9 w-auto" />
                </div>
                <h3 className="font-heading text-lg font-bold text-foreground">Certificates</h3>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: "#98989d" }}>
                  Unlock new career paths and gain in-demand skills with certificates.
                  Complete a certificate learning path to earn a shareable digital credential.
                  No prerequisites required.
                </p>
                <Link href="/learn" className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                  Explore certificates <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {/* Skill Badges */}
              <div className="rounded-xl border p-6 sm:p-8 text-center transition-all hover:border-primary/30 hover:shadow-lg" style={{ borderColor: "#38383a", background: "#1c1c1e" }}>
                <div className="w-16 h-16 mx-auto mb-5 rounded-xl flex items-center justify-center overflow-hidden" style={{ background: "rgba(208, 242, 1, 0.08)" }}>
                  <Image src="/ttlg.png" alt="TechTribe" width={36} height={36} className="h-9 w-auto" />
                </div>
                <h3 className="font-heading text-lg font-bold text-foreground">Skill Badges</h3>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: "#98989d" }}>
                  Prove your practical, technical skills with skill badges. Complete a series
                  of lessons, earn a badge, then share your achievements with peers and employers.
                </p>
                <Link href="/learn" className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                  Explore skill badges <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {/* Certifications */}
              <div className="rounded-xl border p-6 sm:p-8 text-center transition-all hover:border-primary/30 hover:shadow-lg" style={{ borderColor: "#38383a", background: "#1c1c1e" }}>
                <div className="w-16 h-16 mx-auto mb-5 rounded-xl flex items-center justify-center overflow-hidden" style={{ background: "rgba(208, 242, 1, 0.08)" }}>
                  <Image src="/ttlg.png" alt="TechTribe" width={36} height={36} className="h-9 w-auto" />
                </div>
                <h3 className="font-heading text-lg font-bold text-foreground">Certifications</h3>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: "#98989d" }}>
                  Validate your knowledge and skills with industry-recognized certifications.
                  Prove your ability to solve real-world challenges. The certification process
                  involves passing a proctored exam.
                </p>
                <Link href="/learn" className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                  Explore certifications <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ===== CTA SECTION ===== */}
        <section className="continue relative overflow-hidden" style={{ position: "relative", zIndex: 1 }}>
          <svg
            className="continue-img absolute bottom-0 left-0 w-full pointer-events-none"
            viewBox="0 0 1440 140"
            fill="none"
            preserveAspectRatio="none"
          >
            <path d="M0 100 C 480 140, 960 60, 1440 100 L 1440 140 L 0 140 Z" fill="#D0F201" opacity="0.04" />
          </svg>
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center relative">
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
              Continue your learning journey
            </h2>
            <p className="continue-description mt-4 text-base sm:text-lg max-w-lg mx-auto" style={{ color: "#98989d" }}>
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
    </div>
  );
}
