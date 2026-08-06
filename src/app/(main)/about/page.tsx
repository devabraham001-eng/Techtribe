import * as React from "react";
import Link from "next/link";
import { BookOpen, Code2, Users, ArrowRight } from "lucide-react";

export const metadata = {
  title: "About — TechTribe",
  description:
    "TechTribe is the social platform for tech talent. Master any skill, publish technical articles, build real projects, and collaborate with a thriving community.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen" style={{ background: "#0a0a0a" }}>
      {/* ── Hero ── */}
      <section className="mx-auto max-w-7xl px-6 pt-16 md:pt-24 pb-20 md:pb-32">
        <div className="max-w-4xl">
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-6"
            style={{ color: "#D0F201" }}
          >
            (01) Discover our community
          </p>
          <h1
            className="font-heading font-bold leading-none mb-6"
            style={{
              fontSize: "clamp(3rem, 6vw, 6rem)",
              letterSpacing: "-0.04em",
              color: "#f5f5f7",
            }}
          >
            Welcome to
            <br />
            TechTribe!
          </h1>
          <p
            className="italic max-w-2xl"
            style={{
              fontSize: "clamp(1.1rem, 2vw, 1.5rem)",
              lineHeight: 1.5,
              color: "#98989d",
            }}
          >
            The social platform to learn, build, and collaborate in tech.
          </p>
        </div>
      </section>

      {/* ── Two-Column Copy ── */}
      <section className="mx-auto max-w-7xl px-6 pb-20 md:pb-32">
        <div className="grid md:grid-cols-2 gap-12 md:gap-16">
          <div className="space-y-6">
            <p style={{ color: "#98989d", fontSize: 16, lineHeight: 1.7 }}>
              As a community-driven ecosystem, we bring together passionate
              builders, creators, and mentors from across every technical
              discipline.
            </p>
            <p style={{ color: "#98989d", fontSize: 16, lineHeight: 1.7 }}>
              We believe that true mastery comes through active creation.
              TechTribe provides the space to publish technical articles,
              document your learning journey, and share your ongoing project
              builds with an engaged network of peers.
            </p>
          </div>
          <div className="space-y-6">
            <p style={{ color: "#98989d", fontSize: 16, lineHeight: 1.7 }}>
              Whether you are mastering a new skill from scratch, seeking
              collaborative project partners, or building your personal brand in
              tech, our platform provides structured support at every stage.
            </p>
            <p style={{ color: "#98989d", fontSize: 16, lineHeight: 1.7 }}>
              Every build is an opportunity to connect. Share your progress,
              exchange real feedback, and elevate your work within an open,
              collaborative community.
            </p>
          </div>
        </div>
      </section>

      {/* ── Values ── */}
      <section className="mx-auto max-w-7xl px-6 pb-20 md:pb-32">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: BookOpen,
              title: "Learn",
              description:
                "Master any skill with structured paths, expert-led curriculum, and a library of technical articles written by practitioners.",
            },
            {
              icon: Code2,
              title: "Build",
              description:
                "Turn knowledge into real projects. Document your journey, publish builds, and showcase your work to the community and recruiters.",
            },
            {
              icon: Users,
              title: "Collaborate",
              description:
                "Connect with peers, mentors, and hiring managers. Review code together, share feedback, and grow as a collective.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl p-6 sm:p-8"
              style={{
                background: "#1c1c1e",
                border: "1px solid rgba(245,245,247,0.08)",
              }}
            >
              <div
                className="flex h-12 w-12 items-center justify-center rounded-xl mb-5"
                style={{ background: "rgba(208,242,1,0.1)" }}
              >
                <item.icon
                  className="h-5 w-5"
                  style={{ color: "#D0F201" }}
                />
              </div>
              <h3
                className="font-heading text-xl font-semibold mb-3"
                style={{ color: "#f5f5f7" }}
              >
                {item.title}
              </h3>
              <p style={{ color: "#98989d", fontSize: 15, lineHeight: 1.7 }}>
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Quote + CTA ── */}
      <section className="mx-auto max-w-7xl px-6 pb-20 md:pb-32">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Quote card */}
          <div
            className="rounded-2xl p-8 sm:p-10 flex items-end"
            style={{
              background: "#1c1c1e",
              border: "1px solid rgba(245,245,247,0.08)",
              minHeight: 320,
            }}
          >
            <p
              className="font-heading italic"
              style={{
                fontSize: "clamp(1.1rem, 2vw, 1.4rem)",
                lineHeight: 1.6,
                color: "#f5f5f7",
              }}
            >
              &ldquo;We believe that learning should be collaborative and open,
              where every project reflects real skill and shared
              growth.&rdquo;
            </p>
          </div>

          {/* CTA card */}
          <div
            className="rounded-2xl p-8 sm:p-10 flex flex-col justify-between"
            style={{
              background: "#1c1c1e",
              border: "1px solid rgba(245,245,247,0.08)",
              minHeight: 320,
            }}
          >
            <p
              className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: "#D0F201" }}
            >
              (02) Ready to start building?
            </p>
            <div>
              <h2
                className="font-heading font-bold mb-6"
                style={{
                  fontSize: "clamp(2rem, 4vw, 3.5rem)",
                  letterSpacing: "-0.03em",
                  lineHeight: 1.1,
                  color: "#f5f5f7",
                }}
              >
                Join TechTribe
              </h2>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-full font-semibold transition-all"
                style={{
                  background: "#D0F201",
                  color: "#10180B",
                  padding: "14px 28px",
                  fontSize: 15,
                }}
              >
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
