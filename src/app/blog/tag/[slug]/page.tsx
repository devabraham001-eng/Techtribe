import * as React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PostGrid } from "@/components/blog/post/PostGrid";

const TAGS: Record<string, { name: string }> = {
  react: { name: "React" },
  typescript: { name: "TypeScript" },
  nextjs: { name: "Next.js" },
  freelancing: { name: "Freelancing" },
  career: { name: "Career" },
  docker: { name: "Docker" },
  postgresql: { name: "PostgreSQL" },
  ai: { name: "AI" },
  tailwind: { name: "Tailwind CSS" },
};

export default async function TagPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tag = TAGS[slug];

  if (!tag) {
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
            #{tag.name}
          </h1>
          <p className="text-muted-foreground text-lg mt-2">
            Articles tagged with "{tag.name}"
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