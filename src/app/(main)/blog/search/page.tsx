import * as React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { PostGrid } from "@/components/blog/post/PostGrid";
import { searchBlogPosts } from "@/lib/blog-data";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  const results = query ? await searchBlogPosts(query) : [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-4xl font-bold tracking-tight">Search</h1>
        <p className="text-muted-foreground text-lg mt-2">
          Search articles, tutorials, and guides.
        </p>
      </div>

      <form action="/blog/search" className="relative max-w-2xl">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <Input
          type="search"
          name="q"
          placeholder="Search articles..."
          defaultValue={query}
          className="h-14 pl-12 text-lg rounded-2xl"
          autoFocus
          aria-label="Search articles"
        />
      </form>

      {query && (
        results.length > 0 ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {results.length} result{results.length === 1 ? "" : "s"} for &quot;{query}&quot;
            </p>
            <PostGrid posts={results} variant="vertical" columns={3} />
          </div>
        ) : (
          <div className="py-8">
            <p className="text-muted-foreground">
              No results found for &quot;<strong>{query}</strong>&quot;. Try a different search term.
            </p>
          </div>
        )
      )}
    </div>
  );
}
