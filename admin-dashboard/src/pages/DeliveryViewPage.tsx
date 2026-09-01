import React, { useEffect, useState } from "react";
import { collection, doc, onSnapshot, query, updateDoc, where } from "firebase/firestore";
import { MapPin, Truck, CheckCircle2, Banknote } from "lucide-react";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { istMidnightMillis } from "@/lib/dateUtils";
import { AddressDoc, OrderDoc } from "@/lib/domain";

export default function DeliveryViewPage() {
  const { appUser } = useAuth();
  const [orders, setOrders] = useState<OrderDoc[]>([]);
  const [addresses, setAddresses] = useState<Record<string, AddressDoc>>({});

  useEffect(() => {
    if (!appUser) return;
    const todayMidnight = istMidnightMillis();
    const q = query(
      collection(db, "orders"),
      where("assignedDeliveryUid", "==", appUser.uid),
      where("deliveryDate", "==", todayMidnight)
    );
    return onSnapshot(q, (snap) => {
      setOrders(snap.docs.map((d) => d.data() as OrderDoc));
    });
  }, [appUser]);

  useEffect(() => {
    return onSnapshot(collection(db, "addresses"), (snap) => {
      const map: Record<string, AddressDoc> = {};
      snap.docs.forEach((d) => (map[d.id] = d.data() as AddressDoc));
      setAddresses(map);
    });
  }, []);

  async function markDelivered(orderId: string) {
    await updateDoc(doc(db, "orders", orderId), { status: "delivered", paymentStatus: "cod_collected" });
  }

  async function markOutForDelivery(orderId: string) {
    await updateDoc(doc(db, "orders", orderId), { status: "out_for_delivery" });
  }

  return (
    <div>
      <h1 className="page-title">My deliveries today</h1>
      <p className="page-sub">Orders assigned to you for today's slots.</p>

      {orders.length === 0 && <div className="empty-state">No deliveries assigned to you for today.</div>}

      <div style={{ display: "grid", gap: 14, maxWidth: 560 }}>
        {orders.map((o) => (
          <div key={o.id} className="card-soft">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <strong style={{ fontFamily: "'Newsreader', serif", fontSize: 16 }}>
                {o.items.map((item) => `${item.categoryName} ×${item.quantity}`).join(", ")}
              </strong>
              <span className={`chip chip-${o.status}`}>{o.status.replace(/_/g, " ")}</span>
            </div>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 6, marginTop: 10, fontSize: 13, color: "var(--text)" }}>
              <MapPin size={14} style={{ marginTop: 2, flexShrink: 0, color: "var(--text-muted)" }} />
              {addresses[o.addressId]?.formattedAddress ?? "Address unavailable"}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8, fontSize: 13, fontWeight: 600, color: "var(--accent)" }}>
              <Banknote size={14} />
              Collect ₹{o.total} (COD)
            </div>
            <div className="eyebrow" style={{ marginTop: 8 }}>
              {o.slot === "morning" ? "5–8 AM" : "5–8 PM"}
            </div>
            <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
              {o.status === "confirmed" && (
                <button className="btn-secondary" onClick={() => markOutForDelivery(o.id)}>
                  <Truck size={14} /> Out for delivery
                </button>
              )}
              {o.status !== "delivered" && (
                <button className="btn-secondary" onClick={() => markDelivered(o.id)}>
                  <CheckCircle2 size={14} /> Mark delivered
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
