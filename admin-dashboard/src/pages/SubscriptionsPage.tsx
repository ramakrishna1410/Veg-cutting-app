import React, { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { SubscriptionDoc, UserDoc, VegCategoryDoc } from "@/lib/domain";

export default function SubscriptionsPage() {
  const [subs, setSubs] = useState<SubscriptionDoc[]>([]);
  const [users, setUsers] = useState<Record<string, UserDoc>>({});
  const [categories, setCategories] = useState<Record<string, VegCategoryDoc>>({});
  const [search, setSearch] = useState("");

  useEffect(() => {
    return onSnapshot(collection(db, "subscriptions"), (snap) => {
      setSubs(snap.docs.map((d) => d.data() as SubscriptionDoc));
    });
  }, []);

  useEffect(() => {
    return onSnapshot(collection(db, "users"), (snap) => {
      const map: Record<string, UserDoc> = {};
      snap.docs.forEach((d) => (map[d.id] = d.data() as UserDoc));
      setUsers(map);
    });
  }, []);

  useEffect(() => {
    return onSnapshot(collection(db, "vegCategories"), (snap) => {
      const map: Record<string, VegCategoryDoc> = {};
      snap.docs.forEach((d) => (map[d.id] = d.data() as VegCategoryDoc));
      setCategories(map);
    });
  }, []);

  const filtered = subs.filter((s) => {
    const name = users[s.uid]?.name ?? "";
    return name.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div>
      <h1>Subscriptions</h1>
      <input
        placeholder="Search by customer name..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ padding: 8, marginBottom: 16, width: 280, border: "1px solid #ccc", borderRadius: 6 }}
      />
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>Customer</th>
            <th style={thStyle}>Category</th>
            <th style={thStyle}>Plan</th>
            <th style={thStyle}>Slot</th>
            <th style={thStyle}>Status</th>
            <th style={thStyle}>Next delivery</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((s) => (
            <tr key={s.id}>
              <td style={tdStyle}>{users[s.uid]?.name ?? s.uid}</td>
              <td style={tdStyle}>{categories[s.categoryId]?.name ?? s.categoryId}</td>
              <td style={tdStyle}>{s.plan}</td>
              <td style={tdStyle}>{s.slot === "morning" ? "5–8 AM" : "5–8 PM"}</td>
              <td style={tdStyle}>{s.status}</td>
              <td style={tdStyle}>{new Date(s.nextDeliveryDate).toLocaleDateString("en-IN")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const tableStyle: React.CSSProperties = { width: "100%", borderCollapse: "collapse" };
const thStyle: React.CSSProperties = { textAlign: "left", borderBottom: "1px solid #ddd", padding: 8, fontSize: 13 };
const tdStyle: React.CSSProperties = { borderBottom: "1px solid #f0f0f0", padding: 8, fontSize: 13 };
