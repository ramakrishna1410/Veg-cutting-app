import React, { useEffect, useMemo, useState } from "react";
import {
  collection,
  doc,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { Sunrise, Sunset } from "lucide-react";
import { db } from "@/lib/firebase";
import { istMidnightMillis } from "@/lib/dateUtils";
import { OrderDoc, UserDoc } from "@/lib/domain";

export default function TodayOrdersPage() {
  const [orders, setOrders] = useState<OrderDoc[]>([]);
  const [deliveryPartners, setDeliveryPartners] = useState<UserDoc[]>([]);

  useEffect(() => {
    const todayMidnight = istMidnightMillis();
    const q = query(collection(db, "orders"), where("deliveryDate", "==", todayMidnight));
    return onSnapshot(q, (snap) => {
      setOrders(snap.docs.map((d) => d.data() as OrderDoc));
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
  const delivered = useMemo(() => orders.filter((o) => o.status === "delivered").length, [orders]);

  async function assign(orderId: string, deliveryUid: string) {
    await updateDoc(doc(db, "orders", orderId), {
      assignedDeliveryUid: deliveryUid || null,
      status: deliveryUid ? "confirmed" : "pending",
    });
  }

  return (
    <div>
      <h1 className="page-title">Today's orders</h1>
      <p className="page-sub">Deliveries scheduled for today, split by slot.</p>

      <div className="stat-row">
        <div className="stat-card">
          <div className="stat-num">{orders.length}</div>
          <div className="stat-label">Total orders</div>
        </div>
        <div className="stat-card">
          <div className="stat-num">{morning.length}</div>
          <div className="stat-label">Morning slot</div>
        </div>
        <div className="stat-card">
          <div className="stat-num">{evening.length}</div>
          <div className="stat-label">Evening slot</div>
        </div>
        <div className="stat-card">
          <div className="stat-num">{delivered}</div>
          <div className="stat-label">Delivered</div>
        </div>
      </div>

      <SlotBoard
        title="Morning slot"
        subtitle="5:00 – 8:00 AM"
        icon={<Sunrise size={16} />}
        orders={morning}
        deliveryPartners={deliveryPartners}
        onAssign={assign}
      />
      <SlotBoard
        title="Evening slot"
        subtitle="5:00 – 8:00 PM"
        icon={<Sunset size={16} />}
        orders={evening}
        deliveryPartners={deliveryPartners}
        onAssign={assign}
      />
    </div>
  );
}

function SlotBoard({
  title,
  subtitle,
  icon,
  orders,
  deliveryPartners,
  onAssign,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  orders: OrderDoc[];
  deliveryPartners: UserDoc[];
  onAssign: (orderId: string, deliveryUid: string) => void;
}) {
  return (
    <section style={{ marginBottom: 28 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <div
          style={{
            width: 30, height: 30, borderRadius: 9, background: "var(--panel-2)", color: "var(--accent)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          {icon}
        </div>
        <h2 className="section-title" style={{ margin: 0 }}>{title}</h2>
        <span className="eyebrow">{subtitle}</span>
        <span style={{ marginLeft: "auto", color: "var(--text-muted)", fontSize: 13 }}>{orders.length} order(s)</span>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th>Assign to</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td style={{ fontWeight: 600 }}>
                  {o.items.map((item) => `${item.categoryName} ×${item.quantity}`).join(", ")}
                </td>
                <td>
                  ₹{o.total}
                  {o.deliveryFee > 0 && (
                    <span style={{ color: "var(--text-muted)", fontSize: 12 }}> (incl. ₹{o.deliveryFee} delivery)</span>
                  )}
                </td>
                <td>
                  <span className={`chip chip-${o.status}`}>{o.status.replace(/_/g, " ")}</span>
                </td>
                <td>
                  <select value={o.assignedDeliveryUid ?? ""} onChange={(e) => onAssign(o.id, e.target.value)}>
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
                <td colSpan={4}>
                  <div className="empty-state">No orders in this slot yet.</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
