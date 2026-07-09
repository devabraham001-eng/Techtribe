import * as React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { getBlogPosts, getBlogTags } from "@/lib/blog-data";

export default async function TagsPage() {
  const [tags, posts] = await Promise.all([
    getBlogTags(),
    getBlogPosts(),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-4xl font-bold tracking-tight">Tags</h1>
        <p className="text-muted-foreground text-lg mt-2">
          Browse articles by topic tags.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        {tags.map((tag) => {
          const count = posts.filter((post) =>
            post.tags.some((item) => item.slug === tag.slug)
          ).length;

          return (
            <Link key={tag.slug} href={`/blog/tag/${tag.slug}`} className="group">
              <Badge
                variant="outline"
                className="px-4 py-2 text-sm rounded-full hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all cursor-pointer"
              >
                #{tag.name}
                <span className="ml-1.5 text-xs opacity-60">({count})</span>
              </Badge>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
