"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Menu, PenLine } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const navLinks = [
  { name: "Blog", href: "/blog" },
  { name: "Learn", href: "/learn" },
  { name: "Categories", href: "/blog/categories" },
  { name: "Authors", href: "/blog/authors" },
];

export function BlogHeader() {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [authed, setAuthed] = React.useState(false);
  const [isStaff, setIsStaff] = React.useState(false);

  React.useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setAuthed(true);
        supabase.from("authors").select("is_staff").eq("user_id", data.session.user.id).single().then(({ data: author }) => {
          if (author) setIsStaff((author as { is_staff: boolean }).is_staff);
        });
      }
    });
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 pt-4 pb-4" style={{ background: "#0a0a0a" }}>
      <div className="mx-auto max-w-7xl px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 font-bold text-lg" style={{ letterSpacing: "-0.02em" }}>
          <Image src="/ttlg.png" alt="TechTribe" width={28} height={28} className="h-7 w-auto" priority />
          <span style={{ color: "#f5f5f7" }}>TechTribe</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-6" style={{ fontSize: 14, fontWeight: 500, color: "#f5f5f7" }} aria-label="Main">
          <Link href="/blog" className="hover:opacity-70">Blog</Link>
          <Link href="/learn" className="hover:opacity-70">Learn</Link>
          <Link href="/blog/categories" className="hover:opacity-70">Categories</Link>
          <Link href="/blog/authors" className="hover:opacity-70">Authors</Link>
          {authed && (
            <Link href="/blog/write" className="hover:opacity-70 flex items-center gap-1">
              <PenLine className="h-3.5 w-3.5" />
              Write
            </Link>
          )}
          {authed && <Link href="/dashboard" className="hover:opacity-70">Dashboard</Link>}
          {isStaff && <Link href="/admin" className="hover:opacity-70">Admin</Link>}
          {authed && <Link href="/settings" className="hover:opacity-70">Settings</Link>}
        </nav>

        <div className="hidden lg:flex items-center gap-4">
          {authed ? (
            <Link
              href="/learn"
              className="inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all"
              style={{ background: "#D0F201", color: "#10180B", padding: "10px 20px", fontSize: 14 }}
            >
              Continue Learning
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all"
              style={{ background: "#D0F201", color: "#10180B", padding: "10px 20px", fontSize: 14 }}
            >
              Join
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          )}
        </div>

        <button className="lg:hidden flex items-center justify-center" aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>
          <Menu className="h-5 w-5" style={{ color: "#f5f5f7" }} />
        </button>
      </div>

      <AnimatePresence>
      {menuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="lg:hidden border-t overflow-hidden"
          style={{ borderColor: "#38383a", background: "#0a0a0a" }}
        >
          <div className="mx-auto max-w-7xl px-6 py-4 space-y-2" role="navigation" aria-label="Mobile">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block py-2 text-sm font-medium"
                style={{ color: "#f5f5f7" }}
                onClick={() => setMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            {authed && (
              <Link
                href="/blog/write"
                className="block py-2 text-sm font-medium flex items-center gap-2"
                style={{ color: "#f5f5f7" }}
                onClick={() => setMenuOpen(false)}
              >
                <PenLine className="h-3.5 w-3.5" />
                Write
              </Link>
            )}
            {authed && (
              <Link
                href="/dashboard"
                className="block py-2 text-sm font-medium"
                style={{ color: "#f5f5f7" }}
                onClick={() => setMenuOpen(false)}
              >
                Dashboard
              </Link>
            )}
            {isStaff && (
              <Link
                href="/admin"
                className="block py-2 text-sm font-medium"
                style={{ color: "#f5f5f7" }}
                onClick={() => setMenuOpen(false)}
              >
                Admin
              </Link>
            )}
            {authed && (
              <Link
                href="/settings"
                className="block py-2 text-sm font-medium"
                style={{ color: "#f5f5f7" }}
                onClick={() => setMenuOpen(false)}
              >
                Settings
              </Link>
            )}
            <Link
              href={authed ? "/learn" : "/login"}
              className="inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all mt-3"
              style={{ background: "#D0F201", color: "#10180B", padding: "10px 20px", fontSize: 14 }}
              onClick={() => setMenuOpen(false)}
            >
              {authed ? "Continue Learning" : "Join"}
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          </div>
        </motion.div>
      )}
      </AnimatePresence>
    </header>
  );
}
