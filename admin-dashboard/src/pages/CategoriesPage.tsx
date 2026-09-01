import React, { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { Plus } from "lucide-react";
import { db } from "@/lib/firebase";
import { VegCategoryDoc } from "@/lib/domain";

const empty = {
  name: "",
  description: "",
  imageUrl: "",
  items: "",
  price: 0,
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<VegCategoryDoc[]>([]);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    return onSnapshot(collection(db, "vegCategories"), (snap) => {
      setCategories(snap.docs.map((d) => d.data() as VegCategoryDoc));
    });
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const ref = await addDoc(collection(db, "vegCategories"), {
        name: form.name,
        description: form.description,
        imageUrl: form.imageUrl,
        items: form.items.split(",").map((s) => s.trim()).filter(Boolean),
        price: Number(form.price),
        active: true,
      });
      await updateDoc(ref, { id: ref.id });
      setForm(empty);
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(category: VegCategoryDoc) {
    await updateDoc(doc(db, "vegCategories", category.id), { active: !category.active });
  }

  async function updatePrice(category: VegCategoryDoc, price: number) {
    if (!Number.isFinite(price) || price < 0) return;
    await updateDoc(doc(db, "vegCategories", category.id), { price });
  }

  return (
    <div>
      <h1 className="page-title">Veg categories</h1>
      <p className="page-sub">Recipe-based veggie packs customers can order ad-hoc.</p>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(280px, 380px) 1fr", gap: 28, alignItems: "flex-start" }}>
        <form onSubmit={handleCreate} className="card">
          <h3 className="section-title">Add category</h3>
          <div className="field">
            <label>Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="field">
            <label>Description</label>
            <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="field">
            <label>Image URL</label>
            <input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
          </div>
          <div className="field">
            <label>Items (comma separated)</label>
            <input value={form.items} onChange={(e) => setForm({ ...form, items: e.target.value })} placeholder="Onion, Carrot, Beans" />
          </div>
          <div className="field" style={{ maxWidth: 160 }}>
            <label>Price (₹ per pack)</label>
            <input type="number" min={0} value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
          </div>
          <button type="submit" disabled={saving} className="btn-primary" style={{ width: "100%", justifyContent: "center" }}>
            <Plus size={16} /> {saving ? "Saving..." : "Add category"}
          </button>
        </form>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Items</th>
                <th>Price</th>
                <th>Active</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 600 }}>{c.name}</td>
                  <td style={{ color: "var(--text-muted)" }}>{c.items.join(", ")}</td>
                  <td>
                    <input
                      type="number"
                      min={0}
                      defaultValue={c.price}
                      onBlur={(e) => updatePrice(c, Number(e.target.value))}
                      style={{ width: 90 }}
                    />
                  </td>
                  <td>
                    <input type="checkbox" checked={c.active} onChange={() => toggleActive(c)} />
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
