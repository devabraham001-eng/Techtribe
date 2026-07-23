"use client";

import * as React from "react";
import {
  Plus,
  Loader2,
  AlertCircle,
  Save,
  X,
  Edit,
  Trash2,
  ChevronRight,
  ChevronDown,
  GripVertical,
  BookOpen,
  FileText,
  FolderOpen,
} from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";

interface Lesson {
  id: string;
  module_id: string;
  title: string;
  content: string | null;
  is_project: boolean;
  project_prompt: string | null;
  sort_order: number;
  created_at: string;
}

interface Module {
  id: string;
  track_id: string;
  title: string;
  description: string | null;
  sort_order: number;
  created_at: string;
  lessons: Lesson[];
}

interface Track {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  cover_image_url: string | null;
  category: string | null;
  lesson_count: number;
  created_at: string;
  modules: Module[];
}

type EditingTarget =
  | { type: "track"; id: string }
  | { type: "module"; id: string }
  | { type: "lesson"; id: string }
  | null;

export default function LearningAdmin() {
  const [tracks, setTracks] = React.useState<Track[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [expandedTracks, setExpandedTracks] = React.useState<Set<string>>(new Set());
  const [expandedModules, setExpandedModules] = React.useState<Set<string>>(new Set());
  const [editing, setEditing] = React.useState<EditingTarget>(null);
  const [addingTo, setAddingTo] = React.useState<"track" | { type: "module"; trackId: string } | { type: "lesson"; moduleId: string }>("track");
  const [savingId, setSavingId] = React.useState<string | null>(null);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [movingId, setMovingId] = React.useState<string | null>(null);

  async function loadTracks() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/learning/tracks");
      if (!res.ok) throw new Error("Failed to load");
      setTracks(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    const timer = window.setTimeout(() => void loadTracks(), 0);
    return () => window.clearTimeout(timer);
  }, []);

  function toggleTrack(id: string) {
    setExpandedTracks((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function toggleModule(id: string) {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  async function saveItem(endpoint: string, body: Record<string, unknown>, isNew = false) {
    const res = await fetch(endpoint, {
      method: isNew ? "POST" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error((data as Record<string, unknown>).error as string || "Failed to save");
    }
  }

  async function deleteItem(endpoint: string) {
    const res = await fetch(endpoint, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error((data as Record<string, unknown>).error as string || "Failed to delete");
    }
  }

  async function handleReorder(type: "module" | "lesson", items: { id: string; sort_order: number }[]) {
    setMovingId("reorder");
    try {
      const res = await fetch("/api/admin/learning/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, items }),
      });
      if (!res.ok) throw new Error("Reorder failed");
      void loadTracks();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reorder failed");
    } finally {
      setMovingId(null);
    }
  }

  async function moveItem(type: "module" | "lesson", id: string, direction: "up" | "down") {
    let list: ({ id: string; sort_order: number }[]) = [];
    if (type === "module") {
      for (const track of tracks) {
        const idx = track.modules.findIndex((m) => m.id === id);
        if (idx !== -1) {
          list = track.modules.map((m) => ({ id: m.id, sort_order: m.sort_order }));
          const swapIdx = direction === "up" ? idx - 1 : idx + 1;
          if (swapIdx < 0 || swapIdx >= list.length) return;
          [list[idx].sort_order, list[swapIdx].sort_order] = [list[swapIdx].sort_order, list[idx].sort_order];
          break;
        }
      }
    } else {
      for (const track of tracks) {
        for (const mod of track.modules) {
          const idx = mod.lessons.findIndex((l) => l.id === id);
          if (idx !== -1) {
            list = mod.lessons.map((l) => ({ id: l.id, sort_order: l.sort_order }));
            const swapIdx = direction === "up" ? idx - 1 : idx + 1;
            if (swapIdx < 0 || swapIdx >= list.length) return;
            [list[idx].sort_order, list[swapIdx].sort_order] = [list[swapIdx].sort_order, list[idx].sort_order];
            break;
          }
        }
      }
    }
    if (list.length > 0) {
      await handleReorder(type, list);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error && tracks.length === 0) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        <AlertCircle className="h-4 w-4 flex-shrink-0" />
        {error}
        <button type="button" onClick={() => void loadTracks()} className="ml-auto text-sm underline hover:no-underline">Retry</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
          <button type="button" onClick={() => setError(null)} className="ml-auto text-sm underline hover:no-underline">Dismiss</button>
        </div>
      )}

      <Reveal direction="up" duration={0.35} delay={0}>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-semibold text-sm text-muted-foreground">
              Tracks ({tracks.length})
            </h3>
            <button
              type="button"
              onClick={() => setAddingTo("track")}
              className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Track
            </button>
          </div>

          {addingTo === "track" && (
            <TrackForm
              onSave={async (vals) => {
                await saveItem("/api/admin/learning/tracks", vals, true);
                setAddingTo("track");
                void loadTracks();
              }}
              onCancel={() => setAddingTo("track")}
            />
          )}

          {tracks.length === 0 && !loading && (
            <p className="py-8 text-center text-sm text-muted-foreground">No tracks yet. Click &quot;Add Track&quot; to create one.</p>
          )}

          <div className="space-y-2">
            {tracks.map((track) => (
              <React.Fragment key={track.id}>
                <div className="group flex items-center gap-2 rounded-lg border border-border px-3 py-2 hover:bg-muted/20 transition-colors">
                  <button
                    type="button"
                    onClick={() => toggleTrack(track.id)}
                    className="flex items-center gap-2 flex-1 min-w-0 text-left"
                  >
                    {expandedTracks.has(track.id) ? (
                      <ChevronDown className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                    )}
                    <BookOpen className="h-4 w-4 flex-shrink-0 text-primary" />
                    <span className="font-medium text-sm truncate">{track.title}</span>
                    <span className="text-xs text-muted-foreground ml-auto shrink-0">
                      {track.modules.length} modules
                    </span>
                  </button>
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => setEditing({ type: "track", id: track.id })}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
                      title="Edit track"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!confirm(`Delete track "${track.title}" and all its modules/lessons?`)) return;
                        setDeletingId(track.id);
                        void deleteItem(`/api/admin/learning/tracks/${track.id}`).then(() => {
                          setDeletingId(null);
                          void loadTracks();
                        }).catch((e) => {
                          setDeletingId(null);
                          setError(e.message);
                        });
                      }}
                      disabled={deletingId === track.id}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 disabled:opacity-50"
                      title="Delete track"
                    >
                      {deletingId === track.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                {expandedTracks.has(track.id) && (
                  <div className="ml-6 space-y-1 border-l border-border pl-4">
                    <div className="flex items-center justify-between py-1">
                      <span className="text-xs text-muted-foreground font-medium">Modules</span>
                      <button
                        type="button"
                        onClick={() => setAddingTo({ type: "module", trackId: track.id })}
                        className="inline-flex items-center gap-1 rounded text-xs text-primary hover:underline"
                      >
                        <Plus className="h-3 w-3" />
                        Add Module
                      </button>
                    </div>

                    {addingTo && typeof addingTo === "object" && "trackId" in addingTo && addingTo.trackId === track.id && (
                      <ModuleForm
                        trackId={track.id}
                        onSave={async (vals) => {
                          await saveItem("/api/admin/learning/modules", { ...vals, track_id: track.id }, true);
                          setAddingTo({ type: "module", trackId: track.id });
                          void loadTracks();
                        }}
                        onCancel={() => setAddingTo({ type: "module", trackId: track.id })}
                      />
                    )}

                    {track.modules.length === 0 && (
                      <p className="py-2 text-xs text-muted-foreground text-center">No modules yet.</p>
                    )}

                    {track.modules.map((mod) => (
                      <React.Fragment key={mod.id}>
                        <div className="group flex items-center gap-2 rounded-md border border-border/60 px-2.5 py-1.5 hover:bg-muted/20 transition-colors">
                          <button
                            type="button"
                            onClick={() => toggleModule(mod.id)}
                            className="flex items-center gap-2 flex-1 min-w-0 text-left"
                          >
                            {expandedModules.has(mod.id) ? (
                              <ChevronDown className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
                            )}
                            <FolderOpen className="h-3.5 w-3.5 flex-shrink-0 text-blue-500" />
                            <span className="text-sm truncate">{mod.title}</span>
                            <span className="text-xs text-muted-foreground ml-auto shrink-0">
                              {mod.lessons.length} lessons
                            </span>
                          </button>
                          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => void moveItem("module", mod.id, "up")}
                              disabled={movingId === "reorder" || mod.sort_order === 0}
                              className="inline-flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30"
                              title="Move up"
                            >
                              <ChevronRight className="h-3 w-3 -rotate-90" />
                            </button>
                            <button
                              type="button"
                              onClick={() => void moveItem("module", mod.id, "down")}
                              disabled={movingId === "reorder" || mod.sort_order === track.modules.length - 1}
                              className="inline-flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30"
                              title="Move down"
                            >
                              <ChevronRight className="h-3 w-3 rotate-90" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditing({ type: "module", id: mod.id })}
                              className="inline-flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
                              title="Edit module"
                            >
                              <Edit className="h-3 w-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (!confirm(`Delete module "${mod.title}" and all its lessons?`)) return;
                                setDeletingId(mod.id);
                                void deleteItem(`/api/admin/learning/modules/${mod.id}`).then(() => {
                                  setDeletingId(null);
                                  void loadTracks();
                                }).catch((e) => {
                                  setDeletingId(null);
                                  setError(e.message);
                                });
                              }}
                              disabled={deletingId === mod.id}
                              className="inline-flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 disabled:opacity-50"
                              title="Delete module"
                            >
                              {deletingId === mod.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                            </button>
                          </div>
                        </div>

                        {editing && editing.type === "module" && editing.id === mod.id && (
                          <div className="ml-6 mt-1 mb-1">
                            <ModuleForm
                              trackId={track.id}
                              initial={{ title: mod.title, description: mod.description ?? "" }}
                              onSave={async (vals) => {
                                await saveItem(`/api/admin/learning/modules/${mod.id}`, vals);
                                setEditing(null);
                                void loadTracks();
                              }}
                              onCancel={() => setEditing(null)}
                            />
                          </div>
                        )}

                        {expandedModules.has(mod.id) && (
                          <div className="ml-6 space-y-1">
                            {editing && editing.type === "track" && editing.id === track.id && (
                              <div className="mb-2">
                                <TrackForm
                                  initial={{ title: track.title, slug: track.slug, description: track.description ?? "", category: track.category ?? "" }}
                                  onSave={async (vals) => {
                                    await saveItem(`/api/admin/learning/tracks/${track.id}`, vals);
                                    setEditing(null);
                                    void loadTracks();
                                  }}
                                  onCancel={() => setEditing(null)}
                                />
                              </div>
                            )}
                            <div className="flex items-center justify-between py-1">
                              <span className="text-xs text-muted-foreground font-medium">Lessons</span>
                              <button
                                type="button"
                                onClick={() => setAddingTo({ type: "lesson", moduleId: mod.id })}
                                className="inline-flex items-center gap-1 rounded text-xs text-primary hover:underline"
                              >
                                <Plus className="h-3 w-3" />
                                Add Lesson
                              </button>
                            </div>

                            {addingTo && typeof addingTo === "object" && "moduleId" in addingTo && addingTo.moduleId === mod.id && (
                              <LessonForm
                                moduleId={mod.id}
                                onSave={async (vals) => {
                                  await saveItem("/api/admin/learning/lessons", { ...vals, module_id: mod.id }, true);
                                  setAddingTo({ type: "lesson", moduleId: mod.id });
                                  void loadTracks();
                                }}
                                onCancel={() => setAddingTo({ type: "lesson", moduleId: mod.id })}
                              />
                            )}

                            {mod.lessons.length === 0 && (
                              <p className="py-1.5 text-xs text-muted-foreground text-center">No lessons yet.</p>
                            )}

                            {mod.lessons.map((lesson) => (
                              <React.Fragment key={lesson.id}>
                                <div className="group flex items-center gap-2 rounded-md border border-border/40 px-2.5 py-1.5 hover:bg-muted/20 transition-colors">
                                  <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <FileText className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
                                    <span className="text-xs truncate">{lesson.title}</span>
                                    {lesson.is_project && (
                                      <span className="shrink-0 rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-500">Project</span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                      type="button"
                                      onClick={() => void moveItem("lesson", lesson.id, "up")}
                                      disabled={movingId === "reorder" || lesson.sort_order === 0}
                                      className="inline-flex h-5 w-5 items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30"
                                      title="Move up"
                                    >
                                      <ChevronRight className="h-2.5 w-2.5 -rotate-90" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => void moveItem("lesson", lesson.id, "down")}
                                      disabled={movingId === "reorder" || lesson.sort_order === mod.lessons.length - 1}
                                      className="inline-flex h-5 w-5 items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30"
                                      title="Move down"
                                    >
                                      <ChevronRight className="h-2.5 w-2.5 rotate-90" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setEditing({ type: "lesson", id: lesson.id })}
                                      className="inline-flex h-5 w-5 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
                                      title="Edit lesson"
                                    >
                                      <Edit className="h-3 w-3" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (!confirm(`Delete lesson "${lesson.title}"?`)) return;
                                        setDeletingId(lesson.id);
                                        void deleteItem(`/api/admin/learning/lessons/${lesson.id}`).then(() => {
                                          setDeletingId(null);
                                          void loadTracks();
                                        }).catch((e) => {
                                          setDeletingId(null);
                                          setError(e.message);
                                        });
                                      }}
                                      disabled={deletingId === lesson.id}
                                      className="inline-flex h-5 w-5 items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 disabled:opacity-50"
                                      title="Delete lesson"
                                    >
                                      {deletingId === lesson.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                                    </button>
                                  </div>
                                </div>

                                {editing && editing.type === "lesson" && editing.id === lesson.id && (
                                  <div className="ml-6 mt-1 mb-1">
                                    <LessonForm
                                      moduleId={mod.id}
                                      initial={{ title: lesson.title, content: lesson.content ?? "", is_project: lesson.is_project, project_prompt: lesson.project_prompt ?? "" }}
                                      onSave={async (vals) => {
                                        await saveItem(`/api/admin/learning/lessons/${lesson.id}`, vals);
                                        setEditing(null);
                                        void loadTracks();
                                      }}
                                      onCancel={() => setEditing(null)}
                                    />
                                  </div>
                                )}
                              </React.Fragment>
                            ))}
                          </div>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </Reveal>
    </div>
  );
}

function TrackForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: { title: string; slug: string; description: string; category: string };
  onSave: (vals: Record<string, string>) => Promise<void>;
  onCancel: () => void;
}) {
  const [title, setTitle] = React.useState(initial?.title ?? "");
  const [slug, setSlug] = React.useState(initial?.slug ?? "");
  const [description, setDescription] = React.useState(initial?.description ?? "");
  const [category, setCategory] = React.useState(initial?.category ?? "");
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !slug.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const body: Record<string, string> = { title: title.trim(), slug: slug.trim() };
      if (description.trim()) body.description = description.trim();
      if (category.trim()) body.category = category.trim();
      await onSave(body);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-3 space-y-2 rounded-lg bg-muted/30 p-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div>
          <label className="block text-xs text-muted-foreground mb-0.5">Title *</label>
          <input
            className="h-8 w-full rounded-md border border-border bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-xs text-muted-foreground mb-0.5">Slug *</label>
          <input
            className="h-8 w-full rounded-md border border-border bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div>
          <label className="block text-xs text-muted-foreground mb-0.5">Description</label>
          <input
            className="h-8 w-full rounded-md border border-border bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs text-muted-foreground mb-0.5">Category</label>
          <input
            className="h-8 w-full rounded-md border border-border bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
        </div>
      </div>
      <div className="flex gap-1">
        <button type="submit" disabled={saving} className="inline-flex h-7 items-center gap-1 rounded-md bg-primary/10 px-2.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors disabled:opacity-50">
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          Save
        </button>
        <button type="button" onClick={onCancel} disabled={saving} className="inline-flex h-7 items-center gap-1 rounded-md px-2.5 text-xs text-muted-foreground hover:bg-muted transition-colors disabled:opacity-50">
          <X className="h-3.5 w-3.5" />
          Cancel
        </button>
      </div>
      {error && <p className="rounded border border-destructive/30 bg-destructive/5 px-2.5 py-1.5 text-xs text-destructive">{error}</p>}
    </form>
  );
}

function ModuleForm({
  trackId: _trackId,
  initial,
  onSave,
  onCancel,
}: {
  trackId: string;
  initial?: { title: string; description: string };
  onSave: (vals: Record<string, string>) => Promise<void>;
  onCancel: () => void;
}) {
  const [title, setTitle] = React.useState(initial?.title ?? "");
  const [description, setDescription] = React.useState(initial?.description ?? "");
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const body: Record<string, string> = { title: title.trim() };
      if (description.trim()) body.description = description.trim();
      await onSave(body);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-2 space-y-2 rounded-lg bg-muted/30 p-2.5">
      <div>
        <label className="block text-xs text-muted-foreground mb-0.5">Title *</label>
        <input
          className="h-7 w-full rounded-md border border-border bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block text-xs text-muted-foreground mb-0.5">Description</label>
        <input
          className="h-7 w-full rounded-md border border-border bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div className="flex gap-1">
        <button type="submit" disabled={saving} className="inline-flex h-7 items-center gap-1 rounded-md bg-primary/10 px-2.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors disabled:opacity-50">
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          Save
        </button>
        <button type="button" onClick={onCancel} disabled={saving} className="inline-flex h-7 items-center gap-1 rounded-md px-2.5 text-xs text-muted-foreground hover:bg-muted transition-colors disabled:opacity-50">
          <X className="h-3.5 w-3.5" />
          Cancel
        </button>
      </div>
      {error && <p className="rounded border border-destructive/30 bg-destructive/5 px-2.5 py-1.5 text-xs text-destructive">{error}</p>}
    </form>
  );
}

function LessonForm({
  moduleId: _moduleId,
  initial,
  onSave,
  onCancel,
}: {
  moduleId: string;
  initial?: { title: string; content: string; is_project: boolean; project_prompt: string };
  onSave: (vals: Record<string, unknown>) => Promise<void>;
  onCancel: () => void;
}) {
  const [title, setTitle] = React.useState(initial?.title ?? "");
  const [content, setContent] = React.useState(initial?.content ?? "");
  const [isProject, setIsProject] = React.useState(initial?.is_project ?? false);
  const [projectPrompt, setProjectPrompt] = React.useState(initial?.project_prompt ?? "");
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await onSave({
        title: title.trim(),
        content: content || null,
        is_project: isProject,
        project_prompt: isProject ? (projectPrompt || null) : null,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-2 space-y-2 rounded-lg bg-muted/30 p-2.5">
      <div>
        <label className="block text-xs text-muted-foreground mb-0.5">Title *</label>
        <input
          className="h-7 w-full rounded-md border border-border bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block text-xs text-muted-foreground mb-0.5">Content (MDX)</label>
        <textarea
          className="min-h-[120px] w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write lesson content in MDX..."
        />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={isProject}
          onChange={(e) => setIsProject(e.target.checked)}
          className="rounded border-border"
        />
        <span>This is a project-based lesson</span>
      </label>
      {isProject && (
        <div>
          <label className="block text-xs text-muted-foreground mb-0.5">Project Prompt</label>
          <textarea
            className="min-h-[80px] w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={projectPrompt}
            onChange={(e) => setProjectPrompt(e.target.value)}
            placeholder="Describe the project task..."
          />
        </div>
      )}
      <div className="flex gap-1">
        <button type="submit" disabled={saving} className="inline-flex h-7 items-center gap-1 rounded-md bg-primary/10 px-2.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors disabled:opacity-50">
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          Save
        </button>
        <button type="button" onClick={onCancel} disabled={saving} className="inline-flex h-7 items-center gap-1 rounded-md px-2.5 text-xs text-muted-foreground hover:bg-muted transition-colors disabled:opacity-50">
          <X className="h-3.5 w-3.5" />
          Cancel
        </button>
      </div>
      {error && <p className="rounded border border-destructive/30 bg-destructive/5 px-2.5 py-1.5 text-xs text-destructive">{error}</p>}
    </form>
  );
}
