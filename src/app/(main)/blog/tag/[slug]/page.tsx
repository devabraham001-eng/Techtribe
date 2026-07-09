import * as React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PostGrid } from "@/components/blog/post/PostGrid";
import { getBlogPosts, getBlogTags } from "@/lib/blog-data";

export default async function TagPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [tags, posts] = await Promise.all([
    getBlogTags(),
    getBlogPosts({ tag: slug }),
  ]);
  const tag = tags.find((item) => item.slug === slug);

  if (!tag) {
    notFound();
  }

  return (
    <div className="space-y-8 px-4 sm:px-6 lg:px-8">
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
            Articles tagged with &quot;{tag.name}&quot;
          </p>
        </div>
      </div>

      <PostGrid
        posts={posts}
        variant="vertical"
        columns={3}
      />
    </div>
  );
}
