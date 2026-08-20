import React, { useEffect, useState } from "react";
import { collection, doc, onSnapshot, query, updateDoc, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { istMidnightMillis } from "@/lib/dateUtils";
import { AddressDoc, OrderDoc, VegCategoryDoc } from "@/lib/domain";

export default function DeliveryViewPage() {
  const { appUser } = useAuth();
  const [orders, setOrders] = useState<OrderDoc[]>([]);
  const [categories, setCategories] = useState<Record<string, VegCategoryDoc>>({});
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
    return onSnapshot(collection(db, "vegCategories"), (snap) => {
      const map: Record<string, VegCategoryDoc> = {};
      snap.docs.forEach((d) => (map[d.id] = d.data() as VegCategoryDoc));
      setCategories(map);
    });
  }, []);

  useEffect(() => {
    return onSnapshot(collection(db, "addresses"), (snap) => {
      const map: Record<string, AddressDoc> = {};
      snap.docs.forEach((d) => (map[d.id] = d.data() as AddressDoc));
      setAddresses(map);
    });
  }, []);

  async function markDelivered(orderId: string) {
    await updateDoc(doc(db, "orders", orderId), { status: "delivered" });
  }

  async function markOutForDelivery(orderId: string) {
    await updateDoc(doc(db, "orders", orderId), { status: "out_for_delivery" });
  }

  return (
    <div>
      <h1>My deliveries today</h1>
      {orders.length === 0 && <p>No deliveries assigned to you for today.</p>}
      <div style={{ display: "grid", gap: 12, maxWidth: 560 }}>
        {orders.map((o) => (
          <div key={o.id} style={cardStyle}>
            <strong>{categories[o.categoryId]?.name ?? o.categoryId}</strong>
            <div style={{ fontSize: 13, color: "#555", marginTop: 4 }}>
              {addresses[o.addressId]?.formattedAddress ?? "Address unavailable"}
            </div>
            <div style={{ fontSize: 12, color: "#777", marginTop: 4 }}>
              {o.slot === "morning" ? "5–8 AM" : "5–8 PM"} · {o.status}
            </div>
            <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
              {o.status === "confirmed" && (
                <button style={btnStyle} onClick={() => markOutForDelivery(o.id)}>
                  Out for delivery
                </button>
              )}
              {o.status !== "delivered" && (
                <button style={btnStyle} onClick={() => markDelivered(o.id)}>
                  Mark delivered
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  border: "1px solid #eee",
  borderRadius: 10,
  padding: 14,
  backgroundColor: "#F1F8E9",
};
const btnStyle: React.CSSProperties = {
  padding: "6px 12px",
  fontSize: 13,
  border: "1px solid #2E7D32",
  borderRadius: 6,
  backgroundColor: "#fff",
  color: "#2E7D32",
  cursor: "pointer",
};
