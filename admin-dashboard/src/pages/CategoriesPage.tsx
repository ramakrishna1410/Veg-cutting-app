import React, { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { VegCategoryDoc } from "@/lib/domain";

const empty = {
  name: "",
  description: "",
  imageUrl: "",
  items: "",
  priceWeekly: 0,
  priceMonthly: 0,
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
        priceWeekly: Number(form.priceWeekly),
        priceMonthly: Number(form.priceMonthly),
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

  return (
    <div>
      <h1>Veg categories</h1>

      <form onSubmit={handleCreate} style={{ maxWidth: 420, marginBottom: 32 }}>
        <h3>Add category</h3>
        <Field label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
        <Field label="Description" value={form.description} onChange={(v) => setForm({ ...form, description: v })} />
        <Field label="Image URL" value={form.imageUrl} onChange={(v) => setForm({ ...form, imageUrl: v })} />
        <Field label="Items (comma separated)" value={form.items} onChange={(v) => setForm({ ...form, items: v })} />
        <Field
          label="Weekly price (INR)"
          type="number"
          value={String(form.priceWeekly)}
          onChange={(v) => setForm({ ...form, priceWeekly: Number(v) })}
        />
        <Field
          label="Monthly price (INR)"
          type="number"
          value={String(form.priceMonthly)}
          onChange={(v) => setForm({ ...form, priceMonthly: Number(v) })}
        />
        <button type="submit" disabled={saving} style={buttonStyle}>
          {saving ? "Saving..." : "Add category"}
        </button>
      </form>

      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>Name</th>
            <th style={thStyle}>Items</th>
            <th style={thStyle}>Weekly</th>
            <th style={thStyle}>Monthly</th>
            <th style={thStyle}>Active</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((c) => (
            <tr key={c.id}>
              <td style={tdStyle}>{c.name}</td>
              <td style={tdStyle}>{c.items.join(", ")}</td>
              <td style={tdStyle}>₹{c.priceWeekly}</td>
              <td style={tdStyle}>₹{c.priceMonthly}</td>
              <td style={tdStyle}>
                <input type="checkbox" checked={c.active} onChange={() => toggleActive(c)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: "block", fontSize: 12, marginBottom: 4 }}>{label}</label>
      <input
        style={{ width: "100%", padding: 8, boxSizing: "border-box", border: "1px solid #ccc", borderRadius: 6 }}
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

const buttonStyle: React.CSSProperties = {
  padding: "10px 16px",
  backgroundColor: "#2E7D32",
  color: "#fff",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
};
const tableStyle: React.CSSProperties = { width: "100%", borderCollapse: "collapse" };
const thStyle: React.CSSProperties = { textAlign: "left", borderBottom: "1px solid #ddd", padding: 8, fontSize: 13 };
const tdStyle: React.CSSProperties = { borderBottom: "1px solid #f0f0f0", padding: 8, fontSize: 13 };
