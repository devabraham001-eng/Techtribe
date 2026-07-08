import * as React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

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
          defaultValue={q}
          className="h-14 pl-12 text-lg rounded-2xl"
          autoFocus
          aria-label="Search articles"
        />
      </form>

      {q && (
        <div className="py-8">
          <p className="text-muted-foreground">
            No results found for &quot;<strong>{q}</strong>&quot;. Try a different search term.
          </p>
        </div>
      )}
    </div>
  );
}