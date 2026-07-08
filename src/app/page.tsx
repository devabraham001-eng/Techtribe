"use client";

import * as React from "react";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { Reveal } from "@/components/motion/Reveal";
import { ArrowRight, BookOpen, Users, Code2, Sparkles, Globe, Shield, ChevronRight } from "lucide-react";

const metrics = [
  { value: "1,000+", label: "Active Learners" },
  { value: "50+", label: "Free Courses" },
  { value: "500+", label: "Projects Built" },
  { value: "95%", label: "Job Placement Rate" },
];

const features = [
  {
    icon: BookOpen,
    title: "Expert-Led Curriculum",
    description: "Learn from industry professionals who have built at top tech companies. Every course is project-based and updated for 2026.",
  },
  {
    icon: Users,
    title: "Peer-to-Peer Community",
    description: "Join a tribe of 1,000+ developers. Collaborate on projects, review each other's code, and grow together in real-time.",
  },
  {
    icon: Code2,
    title: "Build-in-Public Engine",
    description: "Showcase your work directly to recruiters. Your projects, contributions, and learning journey are your new resume.",
  },
];

const paths = [
  {
    icon: Globe,
    title: "Web Development",
    description: "Master the modern web stack — React, Next.js, Node.js, and more. Build and deploy full-stack apps.",
    modules: "24 modules",
    duration: "12 weeks",
    outcome: "Full-Stack Developer",
  },
  {
    icon: Sparkles,
    title: "UI/UX Design",
    description: "Design beautiful, functional interfaces. Learn Figma, prototyping, design systems, and user research.",
    modules: "18 modules",
    duration: "10 weeks",
    outcome: "Product Designer",
  },
  {
    icon: Shield,
    title: "Blockchain & Web3",
    description: "Build smart contracts, dApps, and decentralized apps. Work with Solidity, Rust, and Move.",
    modules: "20 modules",
    duration: "14 weeks",
    outcome: "Blockchain Developer",
  },
];

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Frontend Engineer at Vercel",
    content: "TechTribe changed my career trajectory. The community support and project-based learning helped me land my dream job in just 4 months.",
    initials: "SC",
  },
  {
    name: "Marcus Williams",
    role: "Full-Stack Developer (Freelance)",
    content: "After years of trying to learn on my own, TechTribe's structured paths and mentorship finally made everything click.",
    initials: "MW",
  },
  {
    name: "Priya Patel",
    role: "Software Engineer at Shopify",
    content: "The build-in-public approach is genius. My TechTribe portfolio got me noticed by recruiters without even applying.",
    initials: "PP",
  },
  {
    name: "Alex Johnson",
    role: "DevOps Engineer at DigitalOcean",
    content: "Working on real projects with peers taught me more than any tutorial ever could. The collaboration is unmatched.",
    initials: "AJ",
  },
];

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: "easeOut" },
  }),
};

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen" style={{ background: "#0a0a0a" }}>
        {/* ───── Hero ───── */}
        <Reveal direction="none" duration={0.4}>
        <section className="relative overflow-hidden pb-24 md:pb-32" style={{ background: "#0a0a0a" }}>
          <div
            className="absolute top-1/2 left-[50%] w-[600px] h-[600px] md:w-[800px] md:h-[800px] pointer-events-none"
            style={{
              background: "linear-gradient(135deg, #D0F201 0%, #C4E402 40%, #10180B 70%, #D0F201 100%)",
              transform: "translate(-20%, -40%) rotate(-15deg)",
              zIndex: 0,
              opacity: 0.15,
              maskImage: "linear-gradient(to bottom right, black, transparent)",
              WebkitMaskImage: "linear-gradient(to bottom right, black, transparent)",
            }}
          >
            <div
              className="absolute inset-0 opacity-50"
              style={{
                mixBlendMode: "overlay",
                backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')",
              }}
            />
          </div>

          <div className="mx-auto max-w-7xl px-6 relative z-10 flex flex-col lg:flex-row items-center gap-12">
            <motion.div
              className="flex-1 max-w-4xl text-left"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.h1
                className="font-bold mb-6"
                variants={itemVariants}
                style={{
                  fontSize: "clamp(3rem, 5vw, 5.2rem)",
                  lineHeight: 1.05,
                  letterSpacing: "-0.04em",
                  color: "#f5f5f7",
                }}
              >
                Learn web development for free with your tribe.
              </motion.h1>

              <motion.p
                className="mb-10"
                variants={itemVariants}
                style={{
                  maxWidth: 700,
                  color: "#98989d",
                  fontSize: 19,
                  lineHeight: 1.4,
                  fontWeight: 400,
                }}
              >
                No paywalls. No corporate jargon. Just real projects, real feedback, and a community of
                developers building in public. Zero to hired — completely free.
              </motion.p>

              <motion.div
                className="flex flex-col sm:flex-row gap-4 mb-16"
                variants={itemVariants}
              >
                <motion.div
                  className="w-full sm:w-auto"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    href="/blog"
                    className="flex sm:inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors w-full"
                    style={{
                      background: "#D0F201",
                      color: "#10180B",
                      padding: "16px 32px",
                      fontSize: 16,
                    }}
                  >
                    Start Learning Free
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </motion.div>
                <motion.div
                  className="w-full sm:w-auto"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    href="#paths"
                    className="flex sm:inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors w-full"
                    style={{
                      background: "transparent",
                      color: "#f5f5f7",
                      border: "1px solid rgba(245,245,247,0.15)",
                      padding: "16px 32px",
                      fontSize: 16,
                    }}
                  >
                    Explore Paths
                  </Link>
                </motion.div>
              </motion.div>

              <motion.div
                className="flex items-center gap-8 text-xs"
                variants={itemVariants}
                style={{ color: "#636366" }}
              >
                {["No credit card", "Lifetime access", "Community support"].map((text) => (
                  <motion.span
                    key={text}
                    className="flex items-center gap-2"
                    whileHover={{ scale: 1.05 }}
                  >
                    <motion.span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ background: "#30d158" }}
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
                    />
                    {text}
                  </motion.span>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </section>
        </Reveal>

        {/* ───── Metrics ───── */}
        <Reveal delay={0.1}>
        <section className="border-y py-14 md:py-16" style={{ borderColor: "#38383a", background: "#0a0a0a" }}>
          <div className="mx-auto max-w-7xl px-6">
            <motion.div
              className="grid grid-cols-2 gap-10 md:grid-cols-4"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
            >
              {metrics.map((m) => (
                <motion.div
                  key={m.label}
                  className="text-center"
                  variants={itemVariants}
                  whileHover={{ scale: 1.08, transition: { duration: 0.2 } }}
                >
                  <motion.div
                    className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold"
                    style={{ color: "#f5f5f7" }}
                    initial={{ opacity: 0, scale: 0.5 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
                  >
                    {m.value}
                  </motion.div>
                  <div className="mt-1.5 text-xs uppercase tracking-widest" style={{ color: "#636366" }}>
                    {m.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
        </Reveal>

        {/* ───── Features (lyqn.app style) ───── */}
        <Reveal delay={0.1}>
        <section style={{ background: "#0a0a0a" }}>
          <div className="mx-auto max-w-[1400px] px-6 py-20 md:py-32">
            <motion.div
              className="text-center mb-20 max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <h2
                className="font-heading font-bold mb-6"
                style={{
                  fontSize: "clamp(36px,5vw,52px)",
                  letterSpacing: "-0.03em",
                  lineHeight: 1.1,
                  color: "#f5f5f7",
                }}
              >
                Everything you need to launch your career
              </h2>
              <p
                style={{
                  color: "#98989d",
                  fontSize: 20,
                  lineHeight: 1.5,
                  maxWidth: "700px",
                  margin: "0 auto",
                }}
              >
                Three pillars that make TechTribe the most effective way to learn development.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((f, i) => {
                return (
                  <motion.div
                    key={f.title}
                    className="relative rounded-[32px] overflow-hidden flex flex-col justify-between p-10 min-h-[380px]"
                    custom={i}
                    variants={cardVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-60px" }}
                    whileHover={{ y: -4, transition: { duration: 0.3 } }}
                  >
                    <div className="absolute inset-0 z-0" style={{ background: "#1c1c1e" }} />
                    <div
                      className="absolute inset-0 z-0 opacity-60"
                      style={{
                        background: "radial-gradient(ellipse at bottom, rgba(208,242,1,0.25) 0%, rgba(16,24,11,0.6) 60%, transparent 100%)",
                      }}
                    />
                    <div className="relative z-10 flex justify-between items-start">
                      <h3
                        className="text-2xl font-bold pr-4 leading-tight"
                        style={{ color: "#f5f5f7", letterSpacing: "-0.02em" }}
                      >
                        {f.title}
                      </h3>
                    </div>
                    <div className="relative z-10 flex items-end justify-between gap-4 mt-12">
                      <p
                        className="text-base leading-snug font-medium max-w-[80%]"
                        style={{ color: "#98989d" }}
                      >
                        {f.description}
                      </p>
                      <motion.div
                        className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{
                          background: "rgba(208,242,1,0.15)",
                          backdropFilter: "blur(8px)",
                          boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
                        }}
                        whileHover={{ scale: 1.15, rotate: 5 }}
                      >
                        <f.icon className="w-5 h-5" style={{ color: "#D0F201" }} />
                      </motion.div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
        </Reveal>

        {/* ───── Learning Paths ───── */}
        <Reveal delay={0.1}>
        <section id="paths" className="py-20 md:py-32" style={{ background: "#141416" }}>
          <div className="mx-auto max-w-7xl px-6">
            <motion.div
              className="mx-auto max-w-2xl text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <motion.div
                className="text-xs font-semibold uppercase tracking-widest mb-4"
                style={{ color: "#D0F201" }}
                initial={{ opacity: 0, y: -8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                Learning Paths
              </motion.div>
              <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight" style={{ color: "#f5f5f7" }}>
                Choose your track
              </h2>
              <p className="mt-4 text-sm md:text-base max-w-lg mx-auto" style={{ color: "#98989d" }}>
                Structured paths designed to take you from beginner to job-ready.
              </p>
            </motion.div>

            <motion.div
              className="grid gap-6 md:grid-cols-3"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
            >
              {paths.map((p) => (
                <motion.div
                  key={p.title}
                  className="rounded-[24px] p-8 md:p-10"
                  variants={itemVariants}
                  style={{
                    background: "#1c1c1e",
                    border: "1px solid rgba(245,245,247,0.08)",
                  }}
                  whileHover={{
                    y: -4,
                    borderColor: "rgba(208,242,1,0.2)",
                    boxShadow: "0 16px 40px rgba(0,0,0,0.3)",
                    transition: { duration: 0.25 },
                  }}
                >
                  <motion.div
                    className="flex h-12 w-12 items-center justify-center rounded-xl mb-6"
                    style={{ background: "rgba(208,242,1,0.1)" }}
                    whileHover={{ rotate: 10, scale: 1.1 }}
                  >
                    <p.icon className="h-5 w-5" style={{ color: "#D0F201" }} />
                  </motion.div>
                  <h3 className="font-heading text-xl font-semibold mb-3" style={{ color: "#f5f5f7" }}>
                    {p.title}
                  </h3>
                  <p className="text-sm leading-relaxed mb-8" style={{ color: "#98989d" }}>
                    {p.description}
                  </p>
                  <div className="space-y-3 mb-8">
                    {[
                      { label: "Modules", value: p.modules },
                      { label: "Duration", value: p.duration },
                      { label: "Outcome", value: p.outcome },
                    ].map((row) => (
                      <motion.div
                        key={row.label}
                        className="flex items-center justify-between text-sm"
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                      >
                        <span style={{ color: "#636366" }}>{row.label}</span>
                        <span className="font-medium" style={{ color: row.label === "Outcome" ? "#D0F201" : "#f5f5f7" }}>
                          {row.value}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                  <motion.div whileHover={{ x: 3 }} transition={{ duration: 0.2 }}>
                    <Link href="/blog" className="inline-flex items-center gap-1 text-sm font-medium" style={{ color: "#D0F201" }}>
                      View curriculum
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
        </Reveal>

        {/* ───── Testimonials ───── */}
        <Reveal delay={0.1}>
        <section className="py-20 md:py-32" style={{ background: "#0a0a0a" }}>
          <div className="mx-auto max-w-7xl px-6">
            <motion.div
              className="mx-auto max-w-2xl text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <motion.div
                className="text-xs font-semibold uppercase tracking-widest mb-4"
                style={{ color: "#D0F201" }}
                initial={{ opacity: 0, y: -8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                Community
              </motion.div>
              <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight" style={{ color: "#f5f5f7" }}>
                Learn with mentors who&apos;ve been there
              </h2>
              <p className="mt-4 text-sm md:text-base max-w-lg mx-auto" style={{ color: "#98989d" }}>
                Our mentors are active engineers at top companies. They review your code, answer questions,
                and guide your learning journey.
              </p>
            </motion.div>

            <motion.div
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-16"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
            >
              {testimonials.map((t) => (
                <motion.div
                  key={t.name}
                  className="rounded-[24px] p-6"
                  variants={itemVariants}
                  style={{
                    background: "#1c1c1e",
                    border: "1px solid rgba(245,245,247,0.08)",
                  }}
                  whileHover={{
                    y: -2,
                    boxShadow: "0 16px 40px rgba(0,0,0,0.3)",
                    transition: { duration: 0.25 },
                  }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <motion.div
                      className="flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold"
                      style={{ background: "rgba(208,242,1,0.2)", color: "#D0F201" }}
                      whileHover={{ scale: 1.15, rotate: -5 }}
                    >
                      {t.initials}
                    </motion.div>
                    <div>
                      <div className="text-sm font-medium" style={{ color: "#f5f5f7" }}>{t.name}</div>
                      <div className="text-xs" style={{ color: "#636366" }}>{t.role}</div>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: "#98989d" }}>
                    &ldquo;{t.content}&rdquo;
                  </p>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              className="rounded-[24px] p-10 md:p-16 text-center max-w-3xl mx-auto"
              style={{
                background: "#1c1c1e",
                border: "1px solid rgba(245,245,247,0.08)",
              }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
            >
              <motion.div
                className="flex -space-x-2 justify-center mb-6"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="flex h-12 w-12 items-center justify-center rounded-full border-2 text-sm font-bold"
                    style={{
                      background: "#141416",
                      borderColor: "#0a0a0a",
                      color: "#636366",
                    }}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: 0.5 + i * 0.08 }}
                  >
                    {String.fromCharCode(65 + i)}
                  </motion.div>
                ))}
              </motion.div>
              <motion.blockquote
                className="font-heading text-2xl sm:text-3xl md:text-4xl font-semibold leading-snug"
                style={{ color: "#f5f5f7" }}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                &ldquo;The best decision I&rsquo;ve made was joining TechTribe. 
                I went from knowing nothing about code to shipping production apps in 3 months.&rdquo;
              </motion.blockquote>
              <motion.div
                className="mt-6"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.8 }}
              >
                <div className="text-base font-medium" style={{ color: "#f5f5f7" }}>David Kim</div>
                <div className="text-sm" style={{ color: "#636366" }}>Software Engineer at Stripe</div>
              </motion.div>
            </motion.div>
          </div>
        </section>
        </Reveal>

        {/* ───── Final CTA ───── */}
        <Reveal delay={0.1}>
        <section className="relative overflow-hidden border-t py-20 md:py-32" style={{ borderColor: "#38383a", background: "#0a0a0a" }}>
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full pointer-events-none"
            style={{
              background: "radial-gradient(circle, rgba(208,242,1,0.08) 0%, transparent 70%)",
              zIndex: 0,
            }}
            initial={{ scale: 0, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: "easeOut" }}
          />

          <div className="mx-auto max-w-7xl px-6 relative z-10">
            <motion.div
              className="mx-auto max-w-2xl text-center"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <motion.div
                className="text-xs font-semibold uppercase tracking-widest mb-4"
                style={{ color: "#D0F201" }}
                initial={{ opacity: 0, y: -8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                Get Started
              </motion.div>
              <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight" style={{ color: "#f5f5f7" }}>
                Start building your future today
              </h2>
              <p className="mt-4 text-sm md:text-base max-w-md mx-auto" style={{ color: "#98989d" }}>
                Join 1,000+ developers who are learning, building, and getting hired. 
                No credit card required. Free forever.
              </p>

              <motion.div
                className="mt-10 flex items-center justify-center gap-4"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    href="/blog"
                    className="inline-flex items-center justify-center gap-2 rounded-full font-semibold"
                    style={{
                      background: "#D0F201",
                      color: "#10180B",
                      padding: "14px 28px",
                      fontSize: 15,
                    }}
                  >
                    Start Learning Free
                    <motion.div
                      animate={{ x: [0, 3, 0] }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                    >
                      <ArrowRight className="h-4 w-4" />
                    </motion.div>
                  </Link>
                </motion.div>
              </motion.div>

              <motion.div
                className="mt-8 flex items-center justify-center gap-8 text-xs"
                style={{ color: "#636366" }}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.4 }}
              >
                {["Free forever", "No credit card", "Cancel anytime"].map((text) => (
                  <motion.span
                    key={text}
                    className="flex items-center gap-2"
                    whileHover={{ scale: 1.05 }}
                  >
                    <motion.span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ background: "#30d158" }}
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
                    />
                    {text}
                  </motion.span>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </section>
        </Reveal>
    </div>
  );
}
