"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { X, Loader2 } from "lucide-react";
import { useWriteModal } from "./WriteModalContext";
import type { Category, Tag } from "@/types/blog";

const PostEditor = dynamic(() => import("../editor/PostEditor").then((mod) => mod.PostEditor), {
  loading: () => (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  ),
});

export function WriteModal() {
  const { open, closeWriteModal, editId, setEditId } = useWriteModal();
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [tags, setTags] = React.useState<Tag[]>([]);
  const [canPublish, setCanPublish] = React.useState(true);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    let active = true;
    const loadTimer = window.setTimeout(() => {
      setLoading(true);
      setCategories([]);
      setTags([]);
      Promise.all([
        fetch("/api/categories").then((r) => r.json()),
        fetch("/api/tags").then((r) => r.json()),
      ])
        .then(([cats, tgs]) => {
          if (!active) return;
          setCategories((cats as { categories?: Category[] }).categories ?? (cats as Category[]) ?? []);
          setTags((tgs as { tags?: Tag[] }).tags ?? (tgs as Tag[]) ?? []);
        })
        .catch(() => {})
        .finally(() => {
          if (active) setLoading(false);
        });
    }, 0);

    return () => {
      active = false;
      window.clearTimeout(loadTimer);
    };
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
              editId={editId}
              onSaved={(newId) => { if (newId) setEditId(newId); }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
