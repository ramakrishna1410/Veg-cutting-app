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
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { db } from "@/lib/firebase";
import { CategoryDoc, MenuItemDoc } from "@/lib/domain";
import ImageUploader from "@/components/ImageUploader";

const empty = {
  categoryId: "",
  name: "",
  description: "",
  imageUrl: "",
  items: "",
  price: 0,
};

export default function MenuItemsPage() {
  const [menuItems, setMenuItems] = useState<MenuItemDoc[]>([]);
  const [categories, setCategories] = useState<CategoryDoc[]>([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  useEffect(() => {
    return onSnapshot(collection(db, "menuItems"), (snap) => {
      setMenuItems(snap.docs.map((d) => d.data() as MenuItemDoc));
    });
  }, []);

  useEffect(() => {
    const q = query(collection(db, "categories"), orderBy("sortOrder", "asc"));
    return onSnapshot(q, (snap) => {
      setCategories(snap.docs.map((d) => d.data() as CategoryDoc));
    });
  }, []);

  function startEdit(item: MenuItemDoc) {
    setEditingId(item.id);
    setForm({
      categoryId: item.categoryId,
      name: item.name,
      description: item.description,
      imageUrl: item.imageUrl,
      items: item.items.join(", "),
      price: item.price,
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(empty);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.categoryId) return;
    setSaving(true);
    try {
      const payload = {
        categoryId: form.categoryId,
        name: form.name,
        description: form.description,
        imageUrl: form.imageUrl,
        items: form.items.split(",").map((s) => s.trim()).filter(Boolean),
        price: Number(form.price),
      };
      if (editingId) {
        await updateDoc(doc(db, "menuItems", editingId), payload);
      } else {
        const ref = await addDoc(collection(db, "menuItems"), { ...payload, active: true });
        await updateDoc(ref, { id: ref.id });
      }
      cancelEdit();
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(item: MenuItemDoc) {
    await updateDoc(doc(db, "menuItems", item.id), { active: !item.active });
  }

  async function handleDelete(item: MenuItemDoc) {
    if (!confirm(`Delete "${item.name}"? This can't be undone.`)) return;
    await deleteDoc(doc(db, "menuItems", item.id));
  }

  const categoryName = (id: string) => categories.find((c) => c.id === id)?.name ?? "—";
  const visibleItems = categoryFilter === "all" ? menuItems : menuItems.filter((m) => m.categoryId === categoryFilter);

  return (
    <div>
      <h1 className="page-title">Menu items</h1>
      <p className="page-sub">The individual veg packs customers order, grouped under a category.</p>

      {categories.length === 0 && (
        <div className="callout" style={{ marginBottom: 20 }}>
          Add a category first (Categories page) — a menu item needs one to belong to.
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "minmax(300px, 400px) 1fr", gap: 28, alignItems: "flex-start" }}>
        <form onSubmit={handleSubmit} className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
            <h3 className="section-title" style={{ marginBottom: 0 }}>
              {editingId ? "Edit menu item" : "Add menu item"}
            </h3>
            {editingId && (
              <button type="button" onClick={cancelEdit} className="icon-btn" style={{ width: 26, height: 26 }}>
                <X size={14} />
              </button>
            )}
          </div>
          <div className="field">
            <label>Category</label>
            <select
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              required
            >
              <option value="" disabled>Choose a category…</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="field">
            <label>Description</label>
            <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="field">
            <label>Photo</label>
            <ImageUploader
              folder="menuItems"
              value={form.imageUrl}
              onChange={(url) => setForm({ ...form, imageUrl: url })}
            />
          </div>
          <div className="field">
            <label>Items (comma separated)</label>
            <input value={form.items} onChange={(e) => setForm({ ...form, items: e.target.value })} placeholder="Onion, Carrot, Beans" />
          </div>
          <div className="field" style={{ maxWidth: 160 }}>
            <label>Price (₹ per pack)</label>
            <input type="number" min={0} value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
          </div>
          <button type="submit" disabled={saving || !form.categoryId} className="btn-primary" style={{ width: "100%", justifyContent: "center" }}>
            <Plus size={16} /> {saving ? "Saving..." : editingId ? "Save changes" : "Add menu item"}
          </button>
        </form>

        <div>
          <div className="field" style={{ maxWidth: 240, marginBottom: 14 }}>
            <label>Filter by category</label>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="all">All categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Items</th>
                  <th>Price</th>
                  <th>Active</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {visibleItems.map((item) => (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 600, display: "flex", alignItems: "center", gap: 10 }}>
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt="" style={{ width: 30, height: 30, borderRadius: 8, objectFit: "cover" }} />
                      ) : (
                        <div style={{ width: 30, height: 30, borderRadius: 8, background: "var(--panel-2)" }} />
                      )}
                      {item.name}
                    </td>
                    <td style={{ color: "var(--text-muted)" }}>{categoryName(item.categoryId)}</td>
                    <td style={{ color: "var(--text-muted)" }}>{item.items.join(", ")}</td>
                    <td>₹{item.price}</td>
                    <td>
                      <input type="checkbox" checked={item.active} onChange={() => toggleActive(item)} />
                    </td>
                    <td style={{ display: "flex", gap: 6 }}>
                      <button className="btn-secondary" onClick={() => startEdit(item)} style={{ padding: "6px 10px" }}>
                        <Pencil size={14} />
                      </button>
                      <button className="btn-secondary" onClick={() => handleDelete(item)} style={{ padding: "6px 10px" }}>
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
                {visibleItems.length === 0 && (
                  <tr>
                    <td colSpan={6}>
                      <div className="empty-state">No menu items yet.</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
