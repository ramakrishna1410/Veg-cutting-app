import React, { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import { Plus, Trash2 } from "lucide-react";
import { db } from "@/lib/firebase";
import { CategoryDoc } from "@/lib/domain";

const empty = { name: "", sortOrder: 0 };

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryDoc[]>([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "categories"), orderBy("sortOrder", "asc"));
    return onSnapshot(q, (snap) => {
      setCategories(snap.docs.map((d) => d.data() as CategoryDoc));
    });
  }, []);

  function startEdit(category: CategoryDoc) {
    setEditingId(category.id);
    setForm({ name: category.name, sortOrder: category.sortOrder });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(empty);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await updateDoc(doc(db, "categories", editingId), {
          name: form.name,
          sortOrder: Number(form.sortOrder),
        });
      } else {
        const ref = await addDoc(collection(db, "categories"), {
          name: form.name,
          sortOrder: Number(form.sortOrder) || categories.length + 1,
          active: true,
        });
        await updateDoc(ref, { id: ref.id });
      }
      cancelEdit();
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(category: CategoryDoc) {
    await updateDoc(doc(db, "categories", category.id), { active: !category.active });
  }

  async function handleDelete(category: CategoryDoc) {
    if (!confirm(`Delete "${category.name}"? Menu items inside it won't be deleted, but will become orphaned — move or delete them first.`)) return;
    await deleteDoc(doc(db, "categories", category.id));
  }

  return (
    <div>
      <h1 className="page-title">Categories</h1>
      <p className="page-sub">Top-level groups customers browse first — Poriyal, Kootu, Rice Veggies, etc.</p>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(260px, 340px) 1fr", gap: 28, alignItems: "flex-start" }}>
        <form onSubmit={handleSubmit} className="card">
          <h3 className="section-title">{editingId ? "Edit category" : "Add category"}</h3>
          <div className="field">
            <label>Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="field" style={{ maxWidth: 140 }}>
            <label>Sort order</label>
            <input
              type="number"
              value={form.sortOrder}
              onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
            />
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button type="submit" disabled={saving} className="btn-primary" style={{ flex: 1, justifyContent: "center" }}>
              <Plus size={16} /> {saving ? "Saving..." : editingId ? "Save changes" : "Add category"}
            </button>
            {editingId && (
              <button type="button" className="btn-secondary" onClick={cancelEdit}>
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Sort</th>
                <th>Active</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 600, cursor: "pointer" }} onClick={() => startEdit(c)}>
                    {c.name}
                  </td>
                  <td>{c.sortOrder}</td>
                  <td>
                    <input type="checkbox" checked={c.active} onChange={() => toggleActive(c)} />
                  </td>
                  <td>
                    <button className="btn-secondary" onClick={() => handleDelete(c)} style={{ padding: "6px 10px" }}>
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan={4}>
                    <div className="empty-state">No categories yet — add your first one.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
