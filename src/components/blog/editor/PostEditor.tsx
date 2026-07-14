"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, Save, Loader2, Cloud, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Category, Tag } from "@/types/blog";

const AUTOSAVE_KEY = "techtribe_editor_draft";
const AUTOSAVE_DELAY = 5000;

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
  const [autosaveIndicator, setAutosaveIndicator] = React.useState<string | null>(null);
  const [hasUnsaved, setHasUnsaved] = React.useState(false);
  const [restoreData, setRestoreData] = React.useState<Record<string, string> | null>(null);
  const autosaveRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const debounceAutosave = React.useCallback(() => {
    if (autosaveRef.current) clearTimeout(autosaveRef.current);
    autosaveRef.current = setTimeout(() => {
      const form = formRef.current;
      if (!form) return;
      const title = (form.elements.namedItem("title") as HTMLInputElement)?.value ?? "";
      const excerpt = (form.elements.namedItem("excerpt") as HTMLTextAreaElement)?.value ?? "";
      const contentMdx = (form.elements.namedItem("contentMdx") as HTMLTextAreaElement)?.value ?? "";
      const categoryId = (form.elements.namedItem("categoryId") as HTMLSelectElement)?.value ?? "";
      if (!title && !contentMdx) return;
      const data = { title, excerpt, contentMdx, categoryId, tags: JSON.stringify(selectedTags), savedAt: Date.now().toString() };
      localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(data));
      setAutosaveIndicator("Auto-saved");
      setTimeout(() => setAutosaveIndicator(null), 2000);
    }, AUTOSAVE_DELAY);
  }, [selectedTags]);

  React.useEffect(() => {
    const restoreTimer = window.setTimeout(() => {
      const saved = localStorage.getItem(AUTOSAVE_KEY);
      if (!saved || editId) return;
      try {
        const parsed = JSON.parse(saved) as Record<string, string>;
        const savedAt = Number(parsed.savedAt) || 0;
        if (Date.now() - savedAt < 60000 && (parsed.title || parsed.contentMdx)) {
          setRestoreData(parsed);
        }
      } catch { /* ignore */ }
    }, 0);

    return () => window.clearTimeout(restoreTimer);
  }, [editId]);

  function restoreFromLocal() {
    if (!restoreData || !formRef.current) return;
    const form = formRef.current;
    (form.elements.namedItem("title") as HTMLInputElement).value = restoreData.title ?? "";
    (form.elements.namedItem("excerpt") as HTMLTextAreaElement).value = restoreData.excerpt ?? "";
    (form.elements.namedItem("contentMdx") as HTMLTextAreaElement).value = restoreData.contentMdx ?? "";
    const catEl = form.elements.namedItem("categoryId") as HTMLSelectElement;
    if (catEl && restoreData.categoryId) catEl.value = restoreData.categoryId;
    if (restoreData.tags) {
      try { setSelectedTags(JSON.parse(restoreData.tags)); } catch { /* ignore */ }
    }
    localStorage.removeItem(AUTOSAVE_KEY);
    setRestoreData(null);
    setAutosaveIndicator("Restored from local draft");
    setTimeout(() => setAutosaveIndicator(null), 3000);
  }

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
        (form.elements.namedItem("title") as HTMLInputElement).value = post.title;
        (form.elements.namedItem("excerpt") as HTMLTextAreaElement).value = post.excerpt ?? "";
        (form.elements.namedItem("contentMdx") as HTMLTextAreaElement).value = post.content_mdx ?? "";
        const catEl = form.elements.namedItem("categoryId") as HTMLSelectElement;
        if (catEl && post.category_id) catEl.value = post.category_id;
        if (post.tags) setSelectedTags(post.tags);
      } catch {
        // Silent fail
      } finally {
        setInitialLoading(false);
      }
    })();
  }, [editId]);

  React.useEffect(() => {
    if (!hasUnsaved) return;
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [hasUnsaved]);

  function toggleTag(tagId: string) {
    setSelectedTags((current) =>
      current.includes(tagId)
        ? current.filter((id) => id !== tagId)
        : [...current, tagId]
    );
    setHasUnsaved(true);
  }

  function handleFieldChange() {
    setHasUnsaved(true);
    debounceAutosave();
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

      setHasUnsaved(false);
      setMessage(isEditing ? "Article updated." : status === "published" ? "Article published." : "Draft saved.");
      localStorage.removeItem(AUTOSAVE_KEY);
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
    <>
      {restoreData && (
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm">
          <RotateCcw className="h-4 w-4 text-primary" />
          <span className="flex-1 text-muted-foreground">
            You have unsaved content from a previous session.
          </span>
          <button
            type="button"
            onClick={restoreFromLocal}
            className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
          >
            Restore
          </button>
          <button
            type="button"
            onClick={() => { localStorage.removeItem(AUTOSAVE_KEY); setRestoreData(null); }}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Dismiss
          </button>
        </div>
      )}

      {(autosaveIndicator || hasUnsaved) && (
        <div className="mb-4 flex items-center gap-2 text-xs text-muted-foreground">
          {autosaveIndicator && (
            <span className="flex items-center gap-1">
              <Cloud className="h-3 w-3" />
              {autosaveIndicator}
            </span>
          )}
          {hasUnsaved && !autosaveIndicator && (
            <span>Unsaved changes</span>
          )}
        </div>
      )}

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
          <Input id="title" name="title" minLength={5} maxLength={160} required onChange={handleFieldChange} />
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
            onChange={handleFieldChange}
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
            onChange={handleFieldChange}
          />
        </div>

        <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="categoryId">Category</Label>
            <select
              id="categoryId"
              name="categoryId"
              className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              defaultValue=""
              onChange={handleFieldChange}
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
    </>
  );
}
