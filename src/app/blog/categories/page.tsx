import * as React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DEMO_CATEGORIES, DEMO_POSTS } from "@/lib/demo-data";

export default function CategoriesPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-4xl font-bold tracking-tight">Categories</h1>
        <p className="text-muted-foreground text-lg mt-2">
          Browse articles by category to find exactly what you&apos;re looking for.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {DEMO_CATEGORIES.map((cat) => {
          const count = DEMO_POSTS.filter((post) => post.category?.slug === cat.slug).length;

          return (
            <Link
              key={cat.slug}
              href={`/blog/category/${cat.slug}`}
              className="group rounded-2xl border border-border p-6 hover:border-primary/50 hover:bg-primary/5 transition-all"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 font-heading text-lg font-bold text-primary">
                  {cat.name.slice(0, 2).toUpperCase()}
                </span>
                <div>
                  <h2 className="font-heading font-semibold text-lg group-hover:text-primary transition-colors">
                    {cat.name}
                  </h2>
                  <Badge variant="subtle" className="mt-1">
                    {count} article{count === 1 ? "" : "s"}
                  </Badge>
                </div>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">{cat.description}</p>
              <div className="flex items-center gap-1 text-sm font-medium text-primary mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                Browse articles
                <ArrowRight className="h-4 w-4" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
