import React, { useEffect, useMemo, useState } from "react";
import {
  collection,
  doc,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { istMidnightMillis } from "@/lib/dateUtils";
import { OrderDoc, UserDoc, VegCategoryDoc } from "@/lib/domain";

export default function TodayOrdersPage() {
  const [orders, setOrders] = useState<OrderDoc[]>([]);
  const [categories, setCategories] = useState<Record<string, VegCategoryDoc>>({});
  const [deliveryPartners, setDeliveryPartners] = useState<UserDoc[]>([]);

  useEffect(() => {
    const todayMidnight = istMidnightMillis();
    const q = query(collection(db, "orders"), where("deliveryDate", "==", todayMidnight));
    return onSnapshot(q, (snap) => {
      setOrders(snap.docs.map((d) => d.data() as OrderDoc));
    });
  }, []);

  useEffect(() => {
    return onSnapshot(collection(db, "vegCategories"), (snap) => {
      const map: Record<string, VegCategoryDoc> = {};
      snap.docs.forEach((d) => (map[d.id] = d.data() as VegCategoryDoc));
      setCategories(map);
    });
  }, []);

  useEffect(() => {
    const q = query(collection(db, "users"), where("role", "==", "delivery"));
    return onSnapshot(q, (snap) => {
      setDeliveryPartners(snap.docs.map((d) => d.data() as UserDoc));
    });
  }, []);

  const morning = useMemo(() => orders.filter((o) => o.slot === "morning"), [orders]);
  const evening = useMemo(() => orders.filter((o) => o.slot === "evening"), [orders]);

  async function assign(orderId: string, deliveryUid: string) {
    await updateDoc(doc(db, "orders", orderId), {
      assignedDeliveryUid: deliveryUid || null,
      status: deliveryUid ? "confirmed" : "pending",
    });
  }

  return (
    <div>
      <h1>Today's orders</h1>
      <SlotBoard
        title="Morning slot (5–8 AM)"
        orders={morning}
        categories={categories}
        deliveryPartners={deliveryPartners}
        onAssign={assign}
      />
      <SlotBoard
        title="Evening slot (5–8 PM)"
        orders={evening}
        categories={categories}
        deliveryPartners={deliveryPartners}
        onAssign={assign}
      />
    </div>
  );
}

function SlotBoard({
  title,
  orders,
  categories,
  deliveryPartners,
  onAssign,
}: {
  title: string;
  orders: OrderDoc[];
  categories: Record<string, VegCategoryDoc>;
  deliveryPartners: UserDoc[];
  onAssign: (orderId: string, deliveryUid: string) => void;
}) {
  return (
    <section style={{ marginTop: 24 }}>
      <h2 style={{ fontSize: 16 }}>
        {title} <span style={{ color: "#777", fontWeight: 400 }}>({orders.length})</span>
      </h2>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>Category</th>
            <th style={thStyle}>Status</th>
            <th style={thStyle}>Assign to</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id}>
              <td style={tdStyle}>{categories[o.categoryId]?.name ?? o.categoryId}</td>
              <td style={tdStyle}>{o.status}</td>
              <td style={tdStyle}>
                <select
                  value={o.assignedDeliveryUid ?? ""}
                  onChange={(e) => onAssign(o.id, e.target.value)}
                >
                  <option value="">Unassigned</option>
                  {deliveryPartners.map((p) => (
                    <option key={p.uid} value={p.uid}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
          {orders.length === 0 && (
            <tr>
              <td style={tdStyle} colSpan={3}>
                No orders in this slot yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </section>
  );
}

const tableStyle: React.CSSProperties = { width: "100%", borderCollapse: "collapse", marginTop: 8 };
const thStyle: React.CSSProperties = { textAlign: "left", borderBottom: "1px solid #ddd", padding: 8, fontSize: 13 };
const tdStyle: React.CSSProperties = { borderBottom: "1px solid #f0f0f0", padding: 8, fontSize: 13 };
