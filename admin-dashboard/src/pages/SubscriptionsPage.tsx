import React, { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { Search } from "lucide-react";
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
  const activeCount = subs.filter((s) => s.status === "active").length;

  return (
    <div>
      <h1 className="page-title">Subscriptions</h1>
      <p className="page-sub">Weekly and monthly veggie subscriptions across all customers.</p>

      <div className="stat-row">
        <div className="stat-card">
          <div className="stat-num">{subs.length}</div>
          <div className="stat-label">Total subscriptions</div>
        </div>
        <div className="stat-card">
          <div className="stat-num">{activeCount}</div>
          <div className="stat-label">Active</div>
        </div>
      </div>

      <div className="field" style={{ maxWidth: 320, position: "relative", marginBottom: 16 }}>
        <Search size={15} style={{ position: "absolute", left: 12, top: 13, color: "var(--text-muted)" }} />
        <input
          placeholder="Search by customer name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ paddingLeft: 36 }}
        />
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Category</th>
              <th>Plan</th>
              <th>Slot</th>
              <th>Status</th>
              <th>Next delivery</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s.id}>
                <td style={{ fontWeight: 600 }}>{users[s.uid]?.name ?? s.uid}</td>
                <td>{categories[s.categoryId]?.name ?? s.categoryId}</td>
                <td style={{ textTransform: "capitalize" }}>{s.plan}</td>
                <td>{s.slot === "morning" ? "5–8 AM" : "5–8 PM"}</td>
                <td>
                  <span className={`chip chip-${s.status}`}>{s.status}</span>
                </td>
                <td>{new Date(s.nextDeliveryDate).toLocaleDateString("en-IN")}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6}>
                  <div className="empty-state">No subscriptions match.</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
