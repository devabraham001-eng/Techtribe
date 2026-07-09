import * as React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Globe, Code2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { PostGrid } from "@/components/blog/post/PostGrid";
import { getInitials } from "@/lib/utils";
import { getBlogAuthors, getBlogPosts } from "@/lib/blog-data";

export default async function AuthorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [authors, posts] = await Promise.all([
    getBlogAuthors(),
    getBlogPosts({ author: slug }),
  ]);
  const author = authors.find((item) => item.slug === slug);

  if (!author) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 sm:px-6 lg:px-8 pt-6 lg:pt-8">
      <Link
        href="/blog"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to blog
      </Link>

      <div className="rounded-2xl border border-border bg-muted/30 p-8">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <Avatar className="h-20 w-20">
            <AvatarImage src="" alt={author.name} />
            <AvatarFallback className="text-2xl">{getInitials(author.name)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="font-heading text-3xl font-bold">{author.name}</h1>
            <p className="text-muted-foreground mt-2 max-w-2xl">{author.bio}</p>
            <div className="flex gap-3 mt-4">
              {author.twitter && (
                <Button variant="outline" size="sm" asChild>
                  <a href={`https://twitter.com/${author.twitter}`} target="_blank" rel="noopener noreferrer">
                    <Globe className="h-4 w-4 mr-2" />
                    Twitter
                  </a>
                </Button>
              )}
              {author.github && (
                <Button variant="outline" size="sm" asChild>
                  <a href={`https://github.com/${author.github}`} target="_blank" rel="noopener noreferrer">
                    <Code2 className="h-4 w-4 mr-2" />
                    GitHub
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="font-heading text-2xl font-bold mb-6">Articles by {author.name}</h2>
        <PostGrid posts={posts} variant="vertical" columns={3} />
      </div>
    </div>
  );
}
