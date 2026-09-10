"use client";

import * as React from "react";
import { Plus, Pencil, Trash2, Eye, EyeOff, Loader2 } from "lucide-react";

interface WorkloadRow {
  id: string;
  title: string;
  brief: string;
  category: string;
  difficulty: string;
  xp_reward: number;
  starter_files: { name: string; content: string }[];
  hidden_tests: { name: string; passed: boolean; output?: string }[];
  sort_order: number;
  is_active: boolean;
}

const emptyForm = {
  title: "",
  brief: "",
  category: "javascript",
  difficulty: "beginner",
  xp_reward: 100,
  starter_files: '[{"name":"main.js","content":"// Your code here\\n"}]',
  hidden_tests: '[{"name":"test 1","passed":false}]',
  sort_order: 0,
  is_active: true,
};

export function WorkloadsAdmin() {
  const [rows, setRows] = React.useState<WorkloadRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [editing, setEditing] = React.useState<string | null>(null);
  const [creating, setCreating] = React.useState(false);
  const [form, setForm] = React.useState(emptyForm);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState("");

  const load = React.useCallback(() => {
    setLoading(true);
    fetch("/api/admin/practice/workloads")
      .then((r) => r.json())
      .then((data) => setRows(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const openEdit = (row: WorkloadRow) => {
    setEditing(row.id);
    setCreating(false);
    setError("");
    setForm({
      title: row.title,
      brief: row.brief,
      category: row.category,
      difficulty: row.difficulty,
      xp_reward: row.xp_reward,
      starter_files: JSON.stringify(row.starter_files, null, 2),
      hidden_tests: JSON.stringify(row.hidden_tests, null, 2),
      sort_order: row.sort_order,
      is_active: row.is_active,
    });
  };

  const openCreate = () => {
    setCreating(true);
    setEditing(null);
    setError("");
    setForm(emptyForm);
  };

  const save = async () => {
    setSaving(true);
    setError("");
    let starterFiles, hiddenTests;
    try {
      starterFiles = JSON.parse(form.starter_files);
      hiddenTests = JSON.parse(form.hidden_tests);
    } catch {
      setError("starter_files and hidden_tests must be valid JSON");
      setSaving(false);
      return;
    }

    const payload = {
      title: form.title,
      brief: form.brief,
      category: form.category,
      difficulty: form.difficulty,
      xp_reward: Number(form.xp_reward),
      starter_files: starterFiles,
      hidden_tests: hiddenTests,
      sort_order: Number(form.sort_order),
      is_active: form.is_active,
    };

    try {
      const res = await fetch(
        editing ? `/api/admin/practice/workloads/${editing}` : "/api/admin/practice/workloads",
        {
          method: editing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) {
        const err = await res.json();
        setError(err.error || "Save failed");
        return;
      }
      setEditing(null);
      setCreating(false);
      load();
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this workload?")) return;
    await fetch(`/api/admin/practice/workloads/${id}`, { method: "DELETE" });
    load();
  };

  if (loading) {
    return <div className="text-sm" style={{ color: "#636366" }}>Loading workloads…</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm" style={{ color: "#98989d" }}>{rows.length} workloads</p>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-1.5 rounded-full text-xs font-semibold px-4 py-2"
          style={{ background: "#D0F201", color: "#10180B" }}
        >
          <Plus className="h-3.5 w-3.5" />
          New workload
        </button>
      </div>

      {(creating || editing) && (
        <div className="rounded-2xl p-5 space-y-3" style={{ background: "#1c1c1e", border: "1px solid #38383a" }}>
          <h3 className="text-sm font-semibold" style={{ color: "#f5f5f7" }}>
            {creating ? "New workload" : "Edit workload"}
          </h3>
          {error && <p className="text-xs" style={{ color: "#ff453a" }}>{error}</p>}
          <div className="grid sm:grid-cols-2 gap-3">
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Title" className="rounded-lg px-3 py-2 text-sm" style={{ background: "#0a0a0a", border: "1px solid #38383a", color: "#f5f5f7" }} />
            <div className="flex gap-2">
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="rounded-lg px-3 py-2 text-sm flex-1" style={{ background: "#0a0a0a", border: "1px solid #38383a", color: "#f5f5f7" }}>
                {["javascript", "python", "linux", "sql", "web"].map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })} className="rounded-lg px-3 py-2 text-sm flex-1" style={{ background: "#0a0a0a", border: "1px solid #38383a", color: "#f5f5f7" }}>
                {["beginner", "intermediate", "advanced"].map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <textarea value={form.brief} onChange={(e) => setForm({ ...form, brief: e.target.value })} placeholder="Brief (ticket description)" rows={3} className="w-full rounded-lg px-3 py-2 text-sm" style={{ background: "#0a0a0a", border: "1px solid #38383a", color: "#f5f5f7" }} />
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] mb-1 block" style={{ color: "#636366" }}>Starter files (JSON)</label>
              <textarea value={form.starter_files} onChange={(e) => setForm({ ...form, starter_files: e.target.value })} rows={5} className="w-full rounded-lg px-3 py-2 text-xs font-mono" style={{ background: "#0a0a0a", border: "1px solid #38383a", color: "#f5f5f7" }} />
            </div>
            <div>
              <label className="text-[11px] mb-1 block" style={{ color: "#636366" }}>Hidden tests (JSON)</label>
              <textarea value={form.hidden_tests} onChange={(e) => setForm({ ...form, hidden_tests: e.target.value })} rows={5} className="w-full rounded-lg px-3 py-2 text-xs font-mono" style={{ background: "#0a0a0a", border: "1px solid #38383a", color: "#f5f5f7" }} />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input type="number" value={form.xp_reward} onChange={(e) => setForm({ ...form, xp_reward: Number(e.target.value) })} placeholder="XP" className="rounded-lg px-3 py-2 text-sm w-24" style={{ background: "#0a0a0a", border: "1px solid #38383a", color: "#f5f5f7" }} />
            <input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} placeholder="Order" className="rounded-lg px-3 py-2 text-sm w-24" style={{ background: "#0a0a0a", border: "1px solid #38383a", color: "#f5f5f7" }} />
            <label className="flex items-center gap-1.5 text-xs" style={{ color: "#98989d" }}>
              <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
              Active
            </label>
            <div className="flex-1" />
            <button type="button" onClick={() => { setCreating(false); setEditing(null); }} className="text-xs px-4 py-2 rounded-full" style={{ color: "#98989d" }}>Cancel</button>
            <button type="button" onClick={save} disabled={saving} className="text-xs font-semibold px-4 py-2 rounded-full disabled:opacity-50" style={{ background: "#D0F201", color: "#10180B" }}>
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Save"}
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {rows.map((row) => (
          <div key={row.id} className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: "#1c1c1e", border: "1px solid rgba(245,245,247,0.08)" }}>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate" style={{ color: "#f5f5f7" }}>{row.title}</div>
              <div className="text-[10px]" style={{ color: "#636366" }}>{row.category} · {row.difficulty} · {row.xp_reward} XP · order {row.sort_order}</div>
            </div>
            {row.is_active
              ? <Eye className="h-4 w-4" style={{ color: "#30d158" }} />
              : <EyeOff className="h-4 w-4" style={{ color: "#636366" }} />}
            <button type="button" onClick={() => openEdit(row)} className="p-1.5 hover:opacity-70"><Pencil className="h-4 w-4" style={{ color: "#98989d" }} /></button>
            <button type="button" onClick={() => remove(row.id)} className="p-1.5 hover:opacity-70"><Trash2 className="h-4 w-4" style={{ color: "#ff453a" }} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
