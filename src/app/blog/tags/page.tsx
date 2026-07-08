import * as React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

const TAGS = [
  { name: "React", slug: "react", count: 15 },
  { name: "TypeScript", slug: "typescript", count: 20 },
  { name: "Next.js", slug: "nextjs", count: 18 },
  { name: "Freelancing", slug: "freelancing", count: 12 },
  { name: "Career", slug: "career", count: 25 },
  { name: "Docker", slug: "docker", count: 11 },
  { name: "PostgreSQL", slug: "postgresql", count: 8 },
  { name: "AI", slug: "ai", count: 16 },
  { name: "Tailwind CSS", slug: "tailwind-css", count: 10 },
  { name: "Performance", slug: "performance", count: 8 },
  { name: "CSS", slug: "css", count: 14 },
  { name: "Supabase", slug: "supabase", count: 7 },
  { name: "DevOps", slug: "devops", count: 14 },
  { name: "Productivity", slug: "productivity", count: 22 },
  { name: "Tools", slug: "tools", count: 19 },
  { name: "Database", slug: "database", count: 13 },
  { name: "Portfolio", slug: "portfolio", count: 5 },
  { name: "Design", slug: "design", count: 12 },
  { name: "Firebase", slug: "firebase", count: 5 },
  { name: "Remix", slug: "remix", count: 6 },
];

export default function TagsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-4xl font-bold tracking-tight">Tags</h1>
        <p className="text-muted-foreground text-lg mt-2">
          Browse articles by topic tags.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        {TAGS.map((tag) => (
          <Link
            key={tag.slug}
            href={`/blog/tag/${tag.slug}`}
            className="group"
          >
            <Badge
              variant="outline"
              className="px-4 py-2 text-sm rounded-full hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all cursor-pointer"
            >
              #{tag.name}
              <span className="ml-1.5 text-xs opacity-60">({tag.count})</span>
            </Badge>
          </Link>
        ))}
      </div>
    </div>
  );
}