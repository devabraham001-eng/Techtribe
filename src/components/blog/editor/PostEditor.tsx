"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Category, Tag } from "@/types/blog";

interface PostEditorProps {
  categories: Category[];
  tags: Tag[];
  canPublish: boolean;
}

export function PostEditor({ categories, tags, canPublish }: PostEditorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");
  const formRef = React.useRef<HTMLFormElement>(null);
  const [loading, setLoading] = React.useState(false);
  const [initialLoading, setInitialLoading] = React.useState(!!editId);
  const [message, setMessage] = React.useState<string | null>(null);
  const [selectedTags, setSelectedTags] = React.useState<string[]>([]);

  React.useEffect(() => {
    if (!editId) return;
    (async () => {
      try {
        const res = await fetch(`/api/author/posts?limit=1`);
        if (!res.ok) return;
        const data = await res.json();
        const post = (data.posts ?? []).find((p: { id: string }) => p.id === editId);
        if (!post) return;
        const form = formRef.current;
        if (!form) return;
        const titleEl = form.elements.namedItem("title") as HTMLInputElement;
        const excerptEl = form.elements.namedItem("excerpt") as HTMLTextAreaElement;
        const contentEl = form.elements.namedItem("contentMdx") as HTMLTextAreaElement;
        const categoryEl = form.elements.namedItem("categoryId") as HTMLSelectElement;
        if (titleEl) titleEl.value = post.title;
        if (excerptEl) excerptEl.value = post.excerpt ?? "";
        if (contentEl) contentEl.value = post.content_mdx ?? "";
        if (categoryEl && post.category_id) categoryEl.value = post.category_id;
        if (post.tags) setSelectedTags(post.tags);
      } catch {
        // Silent fail
      } finally {
        setInitialLoading(false);
      }
    })();
  }, [editId]);

  function toggleTag(tagId: string) {
    setSelectedTags((current) =>
      current.includes(tagId)
        ? current.filter((id) => id !== tagId)
        : [...current, tagId]
    );
  }

  async function submit(form: HTMLFormElement, status: "draft" | "published") {
    const formData = new FormData(form);

    setLoading(true);
    setMessage(null);

    try {
      const isEditing = !!editId;
      const url = isEditing ? `/api/author/posts/${editId}` : "/api/author/posts";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.get("title"),
          excerpt: formData.get("excerpt"),
          contentMdx: formData.get("contentMdx"),
          categoryId: formData.get("categoryId") || null,
          tagIds: selectedTags,
          status,
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Could not save the article.");
      }

      setMessage(isEditing ? "Article updated." : status === "published" ? "Article published." : "Draft saved.");
      if (status === "published" && !isEditing) {
        router.push(`/blog/${result.post.slug}`);
        router.refresh();
      } else {
        router.refresh();
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save the article.");
    } finally {
      setLoading(false);
    }
  }

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      className="space-y-7"
      onSubmit={(event) => {
        event.preventDefault();
        void submit(event.currentTarget, "draft");
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" minLength={5} maxLength={160} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="excerpt">Excerpt</Label>
        <textarea
          id="excerpt"
          name="excerpt"
          rows={3}
          maxLength={320}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="A short summary shown on article cards."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="contentMdx">Article content</Label>
        <textarea
          id="contentMdx"
          name="contentMdx"
          rows={18}
          required
          className="w-full rounded-md border border-border bg-background px-3 py-3 font-mono text-sm leading-relaxed placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="Write in Markdown..."
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="categoryId">Category</Label>
          <select
            id="categoryId"
            name="categoryId"
            className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            defaultValue=""
          >
            <option value="">No category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label>Tags</Label>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => {
              const selected = selectedTags.includes(tag.id);
              return (
                <button
                  key={tag.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => toggleTag(tag.id)}
                  className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                    selected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tag.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {message && (
        <p className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
          {message}
        </p>
      )}

      <div className="flex flex-wrap gap-3 border-t border-border pt-5">
        <Button type="submit" loading={loading}>
          <Save className="mr-2 h-4 w-4" />
          {editId ? "Update draft" : "Save draft"}
        </Button>
        {canPublish && (
          <Button
            type="button"
            variant="outline"
            disabled={loading}
            onClick={() => {
              const form = formRef.current;
              if (form?.reportValidity()) {
                void submit(form, "published");
              }
            }}
          >
            <Eye className="mr-2 h-4 w-4" />
            Publish
          </Button>
        )}
      </div>
    </form>
  );
}
