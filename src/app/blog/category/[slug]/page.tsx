import * as React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PostGrid } from "@/components/blog/post/PostGrid";
import type { Post, Category } from "@/types/blog";

const CATEGORIES: Record<string, { name: string; description: string }> = {
  "web-development": { name: "Web Development", description: "Frontend, backend, and full-stack development tutorials, guides, and best practices." },
  "career-freelancing": { name: "Career & Freelancing", description: "Career advice, freelancing tips, client management, and professional growth strategies." },
  "backend-devops": { name: "Backend & DevOps", description: "Server-side development, database design, cloud infrastructure, and CI/CD pipelines." },
  "ai-tools": { name: "AI & Tools", description: "AI-powered tools, productivity resources, and emerging technologies for developers." },
  "productivity": { name: "Productivity", description: "Workflow optimization, time management, and tools to help you ship faster." },
};

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = CATEGORIES[slug];

  if (!category) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to blog
        </Link>
        <div>
          <h1 className="font-heading text-4xl font-bold tracking-tight">
            {category.name}
          </h1>
          <p className="text-muted-foreground text-lg mt-2 max-w-2xl">
            {category.description}
          </p>
        </div>
      </div>

      <PostGrid
        posts={[]}
        variant="vertical"
        columns={3}
      />
    </div>
  );
}