"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronRight, Mail, ArrowRight, Tag, User, Calendar, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn, formatDate, getInitials } from "@/lib/utils";
import type { Category, Tag as TagType, Author, Post } from "@/types/blog";

interface BlogSidebarProps {
  categories: Category[];
  tags: TagType[];
  popularPosts: Post[];
  recentPosts: Post[];
  authors: Author[];
  newsletterAction?: string;
}

export function BlogSidebar({
  categories,
  tags,
  popularPosts,
  recentPosts,
  authors,
  newsletterAction = "/api/newsletter",
}: BlogSidebarProps) {
  const [activeTab, setActiveTab] = React.useState<"popular" | "recent">("popular");

  return (
    <aside className="hidden lg:block w-80 flex-shrink-0">
      <ScrollArea className="h-[calc(100vh-6rem)]">
        <div className="space-y-8 p-4">
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl font-bold text-primary-foreground bg-primary px-3 py-1 rounded-lg">TT</span>
                <h3 className="font-semibold text-lg">Newsletter</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Get the latest articles delivered to your inbox. No spam, unsubscribe anytime.
              </p>
              <form action={newsletterAction} method="POST" className="space-y-2">
                <Input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  className="h-10"
                  required
                  aria-label="Email address"
                />
                <Button type="submit" className="w-full" size="lg">
                  <Mail className="mr-2 h-4 w-4" />
                  Subscribe
                </Button>
              </form>
              <p className="text-xs text-muted-foreground text-center mt-2">
                By subscribing, you agree to our Privacy Policy.
              </p>
            </CardContent>
          </Card>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Categories</h3>
              <span className="text-xs text-muted-foreground">{categories.length}</span>
            </div>
            <div className="space-y-2">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/blog/category/${category.slug}`}
                  className={cn(
                    "flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    "hover:bg-muted hover:text-foreground"
                  )}
                >
                  <span className="flex items-center gap-2">
                    {category.icon && (
                      <span className="text-primary" style={{ fontSize: "1.1rem" }}>
                        {category.icon}
                      </span>
                    )}
                    {category.name}
                  </span>
                  <Badge variant="subtle" className="text-xs">
                    {category.postCount}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold mb-4">Popular Tags</h3>
            <div className="flex flex-wrap gap-2">
              {tags.slice(0, 20).map((tag) => (
                <Link
                  key={tag.id}
                  href={`/blog/tag/${tag.slug}`}
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium transition-colors",
                    "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary"
                  )}
                >
                  {tag.name}
                  <span className="ml-1 text-xs opacity-60">({tag.postCount})</span>
                </Link>
              ))}
            </div>
          </div>

          <Separator />

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Trending Now</h3>
              <div className="flex gap-1 bg-muted p-1 rounded-lg" role="tablist">
                <button
                  role="tab"
                  aria-selected={activeTab === "popular"}
                  onClick={() => setActiveTab("popular")}
                  className={cn(
                    "px-3 py-1 rounded-md text-xs font-medium transition-colors",
                    activeTab === "popular"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <TrendingUp className="mr-1 h-3 w-3 inline" />
                  Popular
                </button>
                <button
                  role="tab"
                  aria-selected={activeTab === "recent"}
                  onClick={() => setActiveTab("recent")}
                  className={cn(
                    "px-3 py-1 rounded-md text-xs font-medium transition-colors",
                    activeTab === "recent"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Calendar className="mr-1 h-3 w-3 inline" />
                  Recent
                </button>
              </div>
            </div>
            <div className="space-y-3" role="tabpanel">
              {(activeTab === "popular" ? popularPosts : recentPosts).map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group flex gap-3"
                >
                  <div className="relative h-16 w-16 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                    {post.coverImageUrl ? (
                      <img
                        src={post.coverImageUrl}
                        alt={post.coverImageAlt || post.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                        <ChevronRight className="h-6 w-6" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
                      {post.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <time dateTime={post.publishedAt || post.createdAt}>
                        {formatDate(post.publishedAt || post.createdAt)}
                      </time>
                      <span>·</span>
                      <span>{post.readingTime} min read</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold mb-4">Top Authors</h3>
            <div className="space-y-3">
              {authors.slice(0, 5).map((author) => (
                <Link
                  key={author.id}
                  href={`/blog/author/${author.slug}`}
                  className="group flex items-center gap-3"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={author.avatarUrl || ""} alt={author.name} />
                    <AvatarFallback>{getInitials(author.name)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                      {author.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{author.bio?.slice(0, 60)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
    </aside>
  );
}