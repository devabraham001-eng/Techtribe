import * as React from "react";
import { AuthorCard } from "@/components/blog/authors/AuthorCard";
import { getBlogAuthors, getBlogPosts } from "@/lib/blog-data";

export default async function AuthorsPage() {
  const [authors, posts] = await Promise.all([
    getBlogAuthors(),
    getBlogPosts(),
  ]);

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 sm:px-6 lg:px-8 pt-6 lg:pt-8">
      <div>
        <h1 className="font-heading text-4xl font-bold tracking-tight">Authors</h1>
        <p className="text-muted-foreground text-lg mt-2">
          Meet our team of writers and contributors.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {authors.map((author) => {
          const articleCount = posts.filter((post) => post.author.slug === author.slug).length;
          return (
            <AuthorCard key={author.slug} author={author} articleCount={articleCount} />
          );
        })}
      </div>
    </div>
  );
}
