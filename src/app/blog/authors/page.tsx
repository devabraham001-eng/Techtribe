import * as React from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

const AUTHORS = [
  { name: "Alex Johnson", slug: "alex-johnson", bio: "Senior frontend developer and tech writer.", articles: 24, twitter: "@alexjohnson", github: "alexjohnson" },
  { name: "Sarah Chen", slug: "sarah-chen", bio: "Full-stack developer and freelancing coach.", articles: 18, twitter: "@sarahchen", github: "sarahchen" },
  { name: "Marcus Williams", slug: "marcus-williams", bio: "DevOps engineer and cloud infrastructure specialist.", articles: 15, twitter: "@marcusw", github: "marcuswilliams" },
];

export default function AuthorsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-4xl font-bold tracking-tight">Authors</h1>
        <p className="text-muted-foreground text-lg mt-2">
          Meet our team of writers and contributors.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {AUTHORS.map((author) => (
          <Link
            key={author.slug}
            href={`/blog/author/${author.slug}`}
            className="group rounded-2xl border border-border p-6 hover:border-primary/50 hover:bg-primary/5 transition-all"
          >
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-20 w-20 mb-4">
                <AvatarImage src="" alt={author.name} />
                <AvatarFallback className="text-xl">{getInitials(author.name)}</AvatarFallback>
              </Avatar>
              <h2 className="font-heading font-semibold text-lg group-hover:text-primary transition-colors">
                {author.name}
              </h2>
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{author.bio}</p>
              <p className="text-xs text-muted-foreground mt-3">{author.articles} articles</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}