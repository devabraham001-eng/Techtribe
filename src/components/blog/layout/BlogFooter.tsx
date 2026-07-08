"use client";
import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export function BlogFooter() {
  return (
    <footer className="border-t" style={{ borderColor: "#38383a", background: "#1c1c1e" }}>
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-10">
          <div>
            <p className="font-heading font-bold text-2xl" style={{ color: "#f5f5f7", letterSpacing: "-0.02em" }}>
              Experience liftoff
            </p>
          </div>
          <div>
            <div className="flex flex-col gap-3">
              <Link href="/blog" className="text-sm transition-colors hover:opacity-70" style={{ color: "#98989d" }}>Blog</Link>
              <Link href="/blog/write" className="text-sm transition-colors hover:opacity-70" style={{ color: "#98989d" }}>Write</Link>
              <Link href="/blog/categories" className="text-sm transition-colors hover:opacity-70" style={{ color: "#98989d" }}>Categories</Link>
              <Link href="/blog/tags" className="text-sm transition-colors hover:opacity-70" style={{ color: "#98989d" }}>Tags</Link>
              <Link href="/blog/authors" className="text-sm transition-colors hover:opacity-70" style={{ color: "#98989d" }}>Authors</Link>
            </div>
          </div>
          <div>
            <div className="flex flex-col gap-3">
              <Link href="/blog" className="text-sm transition-colors hover:opacity-70" style={{ color: "#98989d" }}>Latest Posts</Link>
              <Link href="/blog/search" className="text-sm transition-colors hover:opacity-70" style={{ color: "#98989d" }}>Search</Link>
              <Link href="/" className="text-sm transition-colors hover:opacity-70" style={{ color: "#98989d" }}>Home</Link>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <motion.svg
            width="100%" height="264" viewBox="0 0 1297 264" fill="none"
            xmlns="http://www.w3.org/2000/svg" className="w-full"
            preserveAspectRatio="xMidYMid meet"
            style={{ opacity: 0.7 }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 0.7 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <motion.text
              x="50%" y="140" textAnchor="middle" dominantBaseline="middle"
              fill="#DBFE01" fontFamily="'Bricolage Grotesque', system-ui, sans-serif"
              fontSize="160" fontWeight="800" letterSpacing="2"
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
            >
              TechTribe
            </motion.text>
            <motion.path
              d="M0 160 Q 160 120, 320 160 T 640 160 T 960 160 T 1297 160"
              stroke="#DBFE01" strokeWidth="1" fill="none" opacity="0.3"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.8, ease: "easeInOut", delay: 0.4 }}
            />
            <motion.path
              d="M0 170 Q 160 140, 320 170 T 640 170 T 960 170 T 1297 170"
              stroke="#DBFE01" strokeWidth="0.5" fill="none" opacity="0.15"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 2.2, ease: "easeInOut", delay: 0.6 }}
            />
          </motion.svg>
        </div>
      </div>

      <motion.div
        className="border-t"
        style={{ borderColor: "#38383a" }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-2.5 font-bold text-lg" style={{ letterSpacing: "-0.02em" }}>
            <img src="/ttlg.png" alt="TechTribe" className="h-7 w-auto" />
            <span style={{ color: "#f5f5f7" }}>TechTribe</span>
          </Link>
          <nav className="flex flex-wrap items-center justify-center gap-6 text-xs" style={{ color: "#636366" }}>
            <Link href="#" className="hover:opacity-70" style={{ color: "#636366" }}>Privacy Policy</Link>
            <Link href="#" className="hover:opacity-70" style={{ color: "#636366" }}>Terms of Service</Link>
            <Link href="#" className="hover:opacity-70" style={{ color: "#636366" }}>Cookie Policy</Link>
            <span className="cursor-pointer hover:opacity-70">Manage cookies</span>
          </nav>
        </div>
      </motion.div>
    </footer>
  );
}