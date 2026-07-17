"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, Save, Loader2, Cloud, RotateCcw, Upload, Image as ImageIcon, FileText, Rocket, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MdxRenderer } from "@/components/markdown/MdxRenderer";
import type { Category, Tag } from "@/types/blog";

const AUTOSAVE_KEY = "techtribe_editor_draft";
const AUTOSAVE_DELAY = 5000;

interface PostEditorProps {
  categories: Category[];
  tags: Tag[];
  canPublish: boolean;
  editId?: string | null;
  onSaved?: (newId?: string) => void;
}

interface EditablePost {
  title: string;
  excerpt: string | null;
  content_mdx: string;
  cover_image_url: string | null;
  cover_image_alt: string | null;
  category_id: string | null;
  tags: string[] | null;
  post_type: string | null;
}

export function PostEditor({ categories, tags, canPublish, editId: providedEditId, onSaved }: PostEditorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = providedEditId ?? searchParams.get("id");
  const formRef = React.useRef<HTMLFormElement>(null);
  const [loading, setLoading] = React.useState(false);
  const [initialLoading, setInitialLoading] = React.useState(!!editId);
  const [message, setMessage] = React.useState<string | null>(null);
  const [selectedTags, setSelectedTags] = React.useState<string[]>([]);
  const [collaborators, setCollaborators] = React.useState<{ id: string; name: string; slug: string }[]>([]);
  const [collabSearch, setCollabSearch] = React.useState("");
  const [collabResults, setCollabResults] = React.useState<{ id: string; name: string; slug: string }[]>([]);
  const [collabSearching, setCollabSearching] = React.useState(false);
  const [autosaveIndicator, setAutosaveIndicator] = React.useState<string | null>(null);
  const [hasUnsaved, setHasUnsaved] = React.useState(false);
  const [restoreData, setRestoreData] = React.useState<Record<string, string> | null>(null);
  const [uploadingCover, setUploadingCover] = React.useState(false);
  const [uploadingInline, setUploadingInline] = React.useState(false);
  const [postType, setPostType] = React.useState<"article" | "project">("article");
  const [splitView, setSplitView] = React.useState(true);
  const [previewContent, setPreviewContent] = React.useState("");
  const [isDragging, setIsDragging] = React.useState(false);
  const dragCounter = React.useRef(0);
  const autosaveRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const debounceAutosave = React.useCallback(() => {
    if (autosaveRef.current) clearTimeout(autosaveRef.current);
    autosaveRef.current = setTimeout(() => {
      const form = formRef.current;
      if (!form) return;
      const title = (form.elements.namedItem("title") as HTMLInputElement)?.value ?? "";
      const excerpt = (form.elements.namedItem("excerpt") as HTMLTextAreaElement)?.value ?? "";
      const contentMdx = (form.elements.namedItem("contentMdx") as HTMLTextAreaElement)?.value ?? "";
      const coverImageUrl = (form.elements.namedItem("coverImageUrl") as HTMLInputElement)?.value ?? "";
      const coverImageAlt = (form.elements.namedItem("coverImageAlt") as HTMLInputElement)?.value ?? "";
      const categoryId = (form.elements.namedItem("categoryId") as HTMLSelectElement)?.value ?? "";
      if (!title && !contentMdx) return;
      const data = { title, excerpt, contentMdx, coverImageUrl, coverImageAlt, categoryId, tags: JSON.stringify(selectedTags), savedAt: Date.now().toString() };
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
    setPreviewContent(restoreData.contentMdx ?? "");
    (form.elements.namedItem("coverImageUrl") as HTMLInputElement).value = restoreData.coverImageUrl ?? "";
    (form.elements.namedItem("coverImageAlt") as HTMLInputElement).value = restoreData.coverImageAlt ?? "";
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
    if (!collabSearch.trim()) {
      setCollabResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setCollabSearching(true);
      try {
        const authorId = collaborators[0]?.id ?? "";
        const res = await fetch(`/api/authors/search?q=${encodeURIComponent(collabSearch)}&exclude=${authorId}`);
        if (res.ok) setCollabResults(await res.json());
      } catch { /* ignore */ }
      setCollabSearching(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [collabSearch, collaborators]);

  React.useEffect(() => {
    if (!editId) return;
    let active = true;
    (async () => {
      try {
        const res = await fetch(`/api/author/posts/${editId}`, { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Could not load the article.");
        }
        if (!active) return;
        const post = data.post as EditablePost | null;
        if (!post) throw new Error("Could not load the article.");
        const form = formRef.current;
        if (!form) return;
        (form.elements.namedItem("title") as HTMLInputElement).value = post.title;
        (form.elements.namedItem("excerpt") as HTMLTextAreaElement).value = post.excerpt ?? "";
        setPreviewContent(post.content_mdx ?? "");
        (form.elements.namedItem("coverImageUrl") as HTMLInputElement).value = post.cover_image_url ?? "";
        (form.elements.namedItem("coverImageAlt") as HTMLInputElement).value = post.cover_image_alt ?? "";
        const catEl = form.elements.namedItem("categoryId") as HTMLSelectElement;
        if (catEl && post.category_id) catEl.value = post.category_id;
        setSelectedTags(post.tags ?? []);
        setPostType((post.post_type as "article" | "project") ?? "article");
      } catch (error) {
        if (active) {
          setMessage(error instanceof Error ? error.message : "Could not load the article.");
        }
      } finally {
        if (active) setInitialLoading(false);
      }
    })();

    return () => {
      active = false;
    };
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

  async function handleCoverUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !formRef.current) return;

    setUploadingCover(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.set("file", file);
      formData.set("bucket", "post-covers");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Could not upload the cover image.");
      }

      const coverInput = formRef.current.elements.namedItem("coverImageUrl") as HTMLInputElement | null;
      if (coverInput) {
        coverInput.value = result.url;
      }
      setHasUnsaved(true);
      setAutosaveIndicator("Cover uploaded");
      window.setTimeout(() => setAutosaveIndicator(null), 3000);
      debounceAutosave();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not upload the cover image.");
    } finally {
      setUploadingCover(false);
    }
  }

  async function handleInlineImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !formRef.current) return;

    setUploadingInline(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.set("file", file);
      formData.set("bucket", "post-covers");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Could not upload the image.");
      }

      const textarea = formRef.current.elements.namedItem("contentMdx") as HTMLTextAreaElement | null;
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const altText = file.name.replace(/\.[^/.]+$/, "");
        const markdown = `\n![${altText}](${result.url})\n`;
        const newContent = textarea.value.slice(0, start) + markdown + textarea.value.slice(end);
        textarea.value = newContent;
        textarea.dispatchEvent(new Event("input", { bubbles: true }));
        textarea.focus();
        textarea.setSelectionRange(start + markdown.length, start + markdown.length);
      }

      setHasUnsaved(true);
      setAutosaveIndicator("Image inserted");
      window.setTimeout(() => setAutosaveIndicator(null), 2000);
      debounceAutosave();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not upload the image.");
    } finally {
      setUploadingInline(false);
    }
  }

  async function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    dragCounter.current = 0;

    const files = Array.from(event.dataTransfer.files);
    for (const file of files) {
      if (file.type.startsWith("image/")) {
        await uploadDroppedFile(file, "image");
      } else if (file.type.startsWith("video/")) {
        await uploadDroppedFile(file, "video");
      }
    }
  }

  async function uploadDroppedFile(file: File, type: "image" | "video") {
    if (!formRef.current) return;
    setMessage(null);

    try {
      const formData = new FormData();
      formData.set("file", file);
      formData.set("bucket", "post-covers");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Upload failed");

      const markdown = type === "image"
        ? `\n![${file.name.replace(/\.[^/.]+$/, "")}](${result.url})\n`
        : `\n<video src="${result.url}" controls></video>\n`;

      setPreviewContent((prev) => prev + markdown);
      setHasUnsaved(true);
      debounceAutosave();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Upload failed");
    }
  }

  function handleDragEnter(e: React.DragEvent) {
    e.preventDefault();
    dragCounter.current++;
    if (e.dataTransfer.types?.includes("Files")) {
      setIsDragging(true);
    }
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
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
          coverImageUrl: formData.get("coverImageUrl"),
          coverImageAlt: formData.get("coverImageAlt"),
          categoryId: formData.get("categoryId") || null,
          tagIds: selectedTags,
          collaboratorIds: collaborators.map((c) => c.id),
          status,
          postType,
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Could not save the article.");
      }

      setHasUnsaved(false);
      localStorage.removeItem(AUTOSAVE_KEY);
      window.dispatchEvent(new CustomEvent("techtribe:author-posts-changed"));
      onSaved?.(result.post.id);
      if (status === "published" && !isEditing) {
        router.push(`/blog/${result.post.slug}`);
      } else {
        router.refresh();
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save the article.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative">
      {initialLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 rounded-lg min-h-[300px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}
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
          <Label>Post Type</Label>
          <div className="flex items-center gap-3">
            <label className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted cursor-pointer">
              <input
                type="radio"
                name="postType"
                value="article"
                className="sr-only"
                defaultChecked={!editId || !postType}
                onChange={(e) => {
                  setPostType(e.target.value as "article" | "project");
                  setHasUnsaved(true);
                }}
              />
              <span className="flex items-center gap-1.5">
                <span className="h-5 w-5 rounded-full border-2 border-primary bg-primary/10 flex items-center justify-center">
                  <FileText className="h-3 w-3 text-primary" />
                </span>
                Article
              </span>
            </label>
            <label className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted cursor-pointer">
              <input
                type="radio"
                name="postType"
                value="project"
                className="sr-only"
                defaultChecked={postType === "project"}
                onChange={(e) => {
                  setPostType(e.target.value as "article" | "project");
                  setHasUnsaved(true);
                }}
              />
              <span className="flex items-center gap-1.5">
                <span className="h-5 w-5 rounded-full border-2 border-primary bg-primary/10 flex items-center justify-center">
                  <Rocket className="h-3 w-3 text-primary" />
                </span>
                Project
              </span>
            </label>
          </div>
          <p className="text-xs text-muted-foreground">
            Articles are standard posts. Projects showcase live work with a "Project" badge.
          </p>
        </div>

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
          <div className="flex items-center gap-1">
            <Label htmlFor="contentMdx">Article content</Label>
            <div className="ml-auto flex items-center gap-1">
              <button
                type="button"
                onClick={() => setSplitView((v) => !v)}
                className={`inline-flex items-center justify-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
                  splitView
                    ? "border-primary/50 bg-primary/5 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                }`}
              >
                {splitView ? (
                  <><Minimize2 className="h-3.5 w-3.5" />Split</>
                ) : (
                  <><Maximize2 className="h-3.5 w-3.5" />Full</>
                )}
              </button>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="sr-only"
                id="inlineImageUpload"
                onChange={handleInlineImageUpload}
                disabled={uploadingInline}
              />
              <label
                htmlFor="inlineImageUpload"
                className={`inline-flex items-center justify-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
                  uploadingInline
                    ? "bg-muted border-border text-muted-foreground cursor-wait"
                    : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                }`}
              >
                {uploadingInline ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-3.5 w-3.5" />
                    Add image
                  </>
                )}
              </label>
            </div>
          </div>
          <div
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="relative"
          >
            {isDragging && (
              <div className="absolute inset-0 z-20 flex items-center justify-center rounded-md border-2 border-dashed border-primary bg-primary/5">
                <div className="text-center">
                  <Upload className="mx-auto h-8 w-8 text-primary" />
                  <p className="mt-2 text-sm font-medium text-primary">Drop files here</p>
                  <p className="text-xs text-muted-foreground">Images and videos</p>
                </div>
              </div>
            )}
            <div className={`grid gap-4 ${splitView ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"}`}>
              <textarea
                id="contentMdx"
                name="contentMdx"
                rows={18}
                required
                value={previewContent}
                onChange={(e) => {
                  setPreviewContent(e.target.value);
                  handleFieldChange();
                }}
                className="w-full rounded-md border border-border bg-background px-3 py-3 font-mono text-sm leading-relaxed placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-y min-h-[400px]"
                placeholder="Write in Markdown..."
              />
              {splitView && (
                <div className="min-h-[400px] max-h-[600px] rounded-md border border-border bg-background px-4 py-3 overflow-y-auto">
                  <div className="text-xs text-muted-foreground mb-2 pb-2 border-b border-border font-medium">Preview</div>
                  <MdxRenderer content={previewContent} />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="coverImageUrl">Cover image URL</Label>
            <Input
              id="coverImageUrl"
              name="coverImageUrl"
              type="url"
              placeholder="https://..."
              onChange={handleFieldChange}
            />
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">
              {uploadingCover ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Upload className="h-3.5 w-3.5" />
              )}
              {uploadingCover ? "Uploading cover..." : "Upload cover image"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="sr-only"
                disabled={uploadingCover}
                onChange={(event) => void handleCoverUpload(event)}
              />
            </label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="coverImageAlt">Cover image alt text</Label>
            <Input
              id="coverImageAlt"
              name="coverImageAlt"
              maxLength={160}
              placeholder="Describe the cover image"
              onChange={handleFieldChange}
            />
          </div>
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
            <Label>Tech Stack Tags</Label>
            <div className="flex flex-wrap gap-2">
              {tags.filter((t) => t.type === "tech").map((tag) => {
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

        <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label>General Tags</Label>
            <div className="flex flex-wrap gap-2">
              {tags.filter((t) => t.type === "general").map((tag) => {
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

          <div className="space-y-2">
            <Label>Collaborators</Label>
            <p className="text-xs text-muted-foreground">Tag co-creators so the post appears on their profile too.</p>
            <div className="flex flex-wrap gap-2 mb-2">
              {collaborators.map((collab) => (
                <span
                  key={collab.id}
                  className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-medium text-primary"
                >
                  {collab.name}
                  <button
                    type="button"
                    onClick={() => setCollaborators((prev) => prev.filter((c) => c.id !== collab.id))}
                    className="ml-0.5 text-primary/60 hover:text-primary"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
            <div className="relative">
              <Input
                type="text"
                value={collabSearch}
                onChange={(e) => setCollabSearch(e.target.value)}
                placeholder="Search authors to tag..."
                className="text-sm"
              />
              {collabResults.length > 0 && (
                <div className="absolute z-10 mt-1 w-full rounded-md border border-border bg-card shadow-lg max-h-40 overflow-y-auto">
                  {collabResults.map((author) => (
                    <button
                      key={author.id}
                      type="button"
                      onClick={() => {
                        setCollaborators((prev) => [...prev, author]);
                        setCollabSearch("");
                        setCollabResults([]);
                        setHasUnsaved(true);
                      }}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-muted transition-colors"
                    >
                      {author.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {message && (
          <p className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
            {message}
          </p>
        )}

        <div className="flex flex-wrap gap-3 border-t border-border pt-5">
          {canPublish && (
            <Button
              type="button"
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
          <Button type="submit" variant="outline" loading={loading}>
            <Save className="mr-2 h-4 w-4" />
            {editId ? "Update draft" : "Save draft"}
          </Button>
        </div>
      </form>
    </div>
  );
}
