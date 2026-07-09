"use client";

import * as React from "react";
import { X, Loader2 } from "lucide-react";
import { useWriteModal } from "./WriteModalContext";
import { PostEditor } from "../editor/PostEditor";
import type { Category, Tag } from "@/types/blog";

export function WriteModal() {
  const { open, closeWriteModal, editId } = useWriteModal();
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [tags, setTags] = React.useState<Tag[]>([]);
  const [canPublish, setCanPublish] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    setLoading(true);
    setCategories([]);
    setTags([]);
    Promise.all([
      fetch("/api/categories").then((r) => r.json()),
      fetch("/api/tags").then((r) => r.json()),
      fetch("/api/author/profile").then((r) => r.json()),
    ])
      .then(([cats, tgs, profile]) => {
        setCategories((cats as { categories?: Category[] }).categories ?? (cats as Category[]) ?? []);
        setTags((tgs as { tags?: Tag[] }).tags ?? (tgs as Tag[]) ?? []);
        setCanPublish((profile as { is_staff?: boolean }).is_staff ?? false);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center lg:items-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60"
        onClick={closeWriteModal}
        aria-hidden="true"
      />

      {/* Modal panel */}
      <div className="relative flex h-full w-full flex-col bg-background lg:h-auto lg:max-h-[90vh] lg:w-full lg:max-w-3xl lg:rounded-2xl lg:border lg:border-border lg:shadow-overlay lg:mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3 flex-shrink-0">
          <h2 className="font-heading text-lg font-bold">
            {editId ? "Edit article" : "Write an article"}
          </h2>
          <button
            type="button"
            onClick={closeWriteModal}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-card transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-4 lg:px-6 lg:py-6">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <PostEditor
              key={open ? (editId ?? "new") : "closed"}
              categories={categories}
              tags={tags}
              canPublish={canPublish}
            />
          )}
        </div>
      </div>
    </div>
  );
}
