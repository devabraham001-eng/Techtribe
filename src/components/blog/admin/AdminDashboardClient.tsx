"use client";

import * as React from "react";
import Link from "next/link";
import { Edit, Trash2, Plus, Loader2, AlertCircle, Save, X } from "lucide-react";

type Tab = "posts" | "categories" | "tags";

interface PostItem {
  id: string;
  slug: string;
  title: string;
  status: string;
  view_count: number;
  created_at: string;
}

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

interface TagItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

function EditForm({
  initial,
  onSave,
  onCancel,
  fields,
}: {
  initial: Record<string, string>;
  onSave: (values: Record<string, string>) => Promise<void>;
  onCancel: () => void;
  fields: { key: string; label: string; required?: boolean }[];
}) {
  const [values, setValues] = React.useState(initial);
  const [saving, setSaving] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(values);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-2 p-3 bg-muted/30 rounded-lg">
      {fields.map((f) => (
        <div key={f.key}>
          <label className="block text-xs text-muted-foreground mb-1">{f.label}</label>
          <input
            className="h-8 rounded-md border border-border bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={values[f.key] ?? ""}
            onChange={(e) => setValues((prev) => ({ ...prev, [f.key]: e.target.value }))}
            required={f.required}
          />
        </div>
      ))}
      <div className="flex gap-1">
        <button type="submit" disabled={saving} className="inline-flex h-8 w-8 items-center justify-center rounded-md text-green-500 hover:bg-green-500/10">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        </button>
        <button type="button" onClick={onCancel} className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted">
          <X className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
}

export function AdminDashboardClient() {
  const [tab, setTab] = React.useState<Tab>("posts");
  const [posts, setPosts] = React.useState<PostItem[]>([]);
  const [categories, setCategories] = React.useState<CategoryItem[]>([]);
  const [tags, setTags] = React.useState<TagItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [editing, setEditing] = React.useState<string | null>(null);
  const [showNewForm, setShowNewForm] = React.useState(false);

  async function loadAll() {
    setLoading(true);
    setError(null);
    try {
      const [postsRes, catsRes, tagsRes] = await Promise.all([
        fetch("/api/admin/posts"),
        fetch("/api/admin/categories"),
        fetch("/api/admin/tags"),
      ]);
      if (!postsRes.ok || !catsRes.ok || !tagsRes.ok) {
        throw new Error("Failed to load data");
      }
      const postsData = await postsRes.json();
      setPosts(postsData.posts ?? []);
      setCategories(await catsRes.json());
      setTags(await tagsRes.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => { void loadAll(); }, []);

  const tabs: { key: Tab; label: string }[] = [
    { key: "posts", label: `Posts (${posts.length})` },
    { key: "categories", label: `Categories (${categories.length})` },
    { key: "tags", label: `Tags (${tags.length})` },
  ];

  async function saveCategory(id: string, values: Record<string, string>) {
    const res = await fetch(`/api/admin/categories/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Failed to update");
    }
    setEditing(null);
    void loadAll();
  }

  async function createCategory(values: Record<string, string>) {
    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Failed to create");
    }
    setShowNewForm(false);
    void loadAll();
  }

  async function deleteCategory(id: string) {
    if (!confirm("Delete this category?")) return;
    const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error || "Failed to delete");
      return;
    }
    void loadAll();
  }

  async function saveTag(id: string, values: Record<string, string>) {
    const res = await fetch(`/api/admin/tags/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Failed to update");
    }
    setEditing(null);
    void loadAll();
  }

  async function createTag(values: Record<string, string>) {
    const res = await fetch("/api/admin/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Failed to create");
    }
    setShowNewForm(false);
    void loadAll();
  }

  async function deleteTag(id: string) {
    if (!confirm("Delete this tag?")) return;
    const res = await fetch(`/api/admin/tags/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error || "Failed to delete");
      return;
    }
    void loadAll();
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-1 rounded-lg bg-muted/50 p-1 w-fit">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => { setTab(t.key); setEditing(null); setShowNewForm(false); }}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              tab === t.key ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {!loading && tab === "posts" && (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Title</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden sm:table-cell">Status</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">Views</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">Date</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No posts yet.</td></tr>
              )}
              {posts.map((post) => (
                <tr key={post.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                  <td className="px-4 py-3 font-medium truncate max-w-[260px] sm:max-w-sm">{post.title}</td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className={`text-xs font-medium capitalize ${
                      post.status === "published" ? "text-green-500" : post.status === "draft" ? "text-yellow-500" : "text-muted-foreground"
                    }`}>{post.status}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{(post.view_count ?? 0).toLocaleString()}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{new Date(post.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/blog/write?id=${post.id}`} className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" title="Edit">
                      <Edit className="h-4 w-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && tab === "categories" && (
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => setShowNewForm(!showNewForm)}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            <Plus className="h-4 w-4" />
            Add category
          </button>

          {showNewForm && (
            <EditForm
              initial={{ name: "", slug: "", description: "" }}
              onSave={createCategory}
              onCancel={() => setShowNewForm(false)}
              fields={[
                { key: "name", label: "Name", required: true },
                { key: "slug", label: "Slug", required: true },
                { key: "description", label: "Description" },
              ]}
            />
          )}

          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Slug</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">Description</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.length === 0 && (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">No categories yet.</td></tr>
                )}
                {categories.map((cat) => (
                  <React.Fragment key={cat.id}>
                    <tr className="border-b border-border last:border-0 hover:bg-muted/20">
                      <td className="px-4 py-3 font-medium">{cat.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{cat.slug}</td>
                      <td className="px-4 py-3 text-muted-foreground hidden md:table-cell truncate max-w-[200px]">{cat.description}</td>
                      <td className="px-4 py-3 text-right">
                        <button type="button" onClick={() => setEditing(editing === cat.id ? null : cat.id)} className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" title="Edit">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button type="button" onClick={() => void deleteCategory(cat.id)} className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors" title="Delete">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                    {editing === cat.id && (
                      <tr><td colSpan={4} className="px-4 py-2">
                        <EditForm
                          initial={{ name: cat.name, slug: cat.slug, description: cat.description ?? "" }}
                          onSave={(values) => saveCategory(cat.id, values)}
                          onCancel={() => setEditing(null)}
                          fields={[
                            { key: "name", label: "Name", required: true },
                            { key: "slug", label: "Slug", required: true },
                            { key: "description", label: "Description" },
                          ]}
                        />
                      </td></tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && tab === "tags" && (
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => setShowNewForm(!showNewForm)}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            <Plus className="h-4 w-4" />
            Add tag
          </button>

          {showNewForm && (
            <EditForm
              initial={{ name: "", slug: "", description: "" }}
              onSave={createTag}
              onCancel={() => setShowNewForm(false)}
              fields={[
                { key: "name", label: "Name", required: true },
                { key: "slug", label: "Slug", required: true },
                { key: "description", label: "Description" },
              ]}
            />
          )}

          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Slug</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">Description</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tags.length === 0 && (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">No tags yet.</td></tr>
                )}
                {tags.map((tag) => (
                  <React.Fragment key={tag.id}>
                    <tr className="border-b border-border last:border-0 hover:bg-muted/20">
                      <td className="px-4 py-3 font-medium">{tag.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{tag.slug}</td>
                      <td className="px-4 py-3 text-muted-foreground hidden md:table-cell truncate max-w-[200px]">{tag.description}</td>
                      <td className="px-4 py-3 text-right">
                        <button type="button" onClick={() => setEditing(editing === tag.id ? null : tag.id)} className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" title="Edit">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button type="button" onClick={() => void deleteTag(tag.id)} className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors" title="Delete">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                    {editing === tag.id && (
                      <tr><td colSpan={4} className="px-4 py-2">
                        <EditForm
                          initial={{ name: tag.name, slug: tag.slug, description: tag.description ?? "" }}
                          onSave={(values) => saveTag(tag.id, values)}
                          onCancel={() => setEditing(null)}
                          fields={[
                            { key: "name", label: "Name", required: true },
                            { key: "slug", label: "Slug", required: true },
                            { key: "description", label: "Description" },
                          ]}
                        />
                      </td></tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
