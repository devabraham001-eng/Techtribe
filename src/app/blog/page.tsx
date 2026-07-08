"use client";

import * as React from "react";
import Link from "next/link";
import { Search, BookOpen, Code2, Shield, Wrench, GraduationCap, GitCompare, Terminal } from "lucide-react";
import { PostGrid } from "@/components/blog/post/PostGrid";
import { PostGridSkeleton } from "@/components/ui/skeleton";
import { LiveIndicator } from "@/components/blog/live/LiveIndicator";
import { Reveal } from "@/components/motion/Reveal";
import { useLivePosts } from "@/hooks/useLivePosts";

const categoryFilters = [
  { name: "All", slug: null, icon: null },
  { name: "Product", slug: "product", icon: BookOpen },
  { name: "Tutorial", slug: "tutorial", icon: Terminal },
  { name: "Engineering", slug: "engineering", icon: Code2 },
  { name: "Security", slug: "security", icon: Shield },
  { name: "Tools", slug: "tools", icon: Wrench },
  { name: "Education", slug: "education", icon: GraduationCap },
  { name: "Comparison", slug: "comparison", icon: GitCompare },
  { name: "Development", slug: "development", icon: Terminal },
];

export default function BlogPage() {
  const { posts, loading } = useLivePosts();
  const [activeFilter, setActiveFilter] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");

  const filtered = React.useMemo(() => {
    let result = posts;
    if (activeFilter) {
      result = result.filter((p) => p.category?.slug === activeFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.excerpt?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [posts, activeFilter, searchQuery]);

  return (
    <div>
      {/* ───── Blog Hero ───── */}
      <Reveal direction="none" duration={0.4}>
      <header className="text-center max-w-2xl mx-auto mb-10">
        <span className="inline-block text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "#98989d", opacity: 1, transform: "none" }}>
          Insights &amp; Tutorials
        </span>
        <div className="flex items-center justify-center gap-3 mb-4">
          <h1 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight" style={{ color: "#f5f5f7" }}>
            TechTribe Blog
          </h1>
          <LiveIndicator label="Live updates" />
        </div>
        <p className="text-sm md:text-base max-w-lg mx-auto" style={{ color: "#98989d" }}>
          Web development tutorials, career insights, and community stories — built by the TechTribe team.
        </p>
      </header>
      </Reveal>

      {/* ───── Promo ───── */}
      <Reveal delay={0.1}>
      <div className="mb-10">
        <div className="bg-card border border-border rounded-2xl p-6 flex items-start gap-4">
          <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(208,242,1,0.1)" }}>
            <Search className="w-5 h-5" style={{ color: "#D0F201" }} />
          </div>
          <div>
            <h3 className="font-heading font-semibold text-base mb-1" style={{ color: "#f5f5f7" }}>
              Instant answers from your address bar
            </h3>
            <p className="text-sm leading-relaxed mb-3" style={{ color: "#98989d" }}>
              Add TechTribe as a browser search engine, type <code className="px-1 py-0.5 rounded text-xs font-mono" style={{ background: "rgba(208,242,1,0.1)", color: "#D0F201" }}>tt</code> + Tab, search any topic, and jump straight to tutorials. Works across Chrome, Firefox, and Edge.
            </p>
            <Link href="/blog" className="text-xs font-medium" style={{ color: "#D0F201" }}>
              Set it up now &rarr;
            </Link>
          </div>
        </div>
      </div>
      </Reveal>

      {/* ───── Filters ───── */}
      <Reveal delay={0.15}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-2 flex-wrap">
          {categoryFilters.map((cat) => {
            const isActive = cat.slug === activeFilter || (!cat.slug && !activeFilter);
            const Icon = cat.icon;
            return (
              <button
                key={cat.name}
                onClick={() => setActiveFilter(cat.slug === activeFilter ? null : cat.slug)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-foreground/20"
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                {cat.name}
              </button>
            );
          })}
        </div>
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "#636366" }} />
          <input
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-56 pl-8 pr-3 py-1.5 rounded-full text-xs border bg-card"
            style={{ borderColor: "#38383a", color: "#f5f5f7" }}
          />
        </div>
      </div>
      </Reveal>

      {/* ───── Posts ───── */}
      {loading ? (
        <div className="space-y-8">
          <PostGridSkeleton variant="featured" count={1} />
          <PostGridSkeleton count={6} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-5xl mb-4 opacity-20">📝</div>
          <p className="text-sm" style={{ color: "#98989d" }}>No articles found.</p>
        </div>
      ) : (
        <PostGrid
          posts={filtered}
          variant="featured"
          columns={3}
          featuredIndex={0}
        />
      )}
    </div>
  );
}
