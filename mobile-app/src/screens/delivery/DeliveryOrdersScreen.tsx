import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, Pressable } from "react-native";
import { LogOut } from "lucide-react-native";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { OrderDoc } from "@/lib/domain";
import { colors, fonts } from "@/lib/theme";
import { Card, Chip } from "@/components/ui";
import { DeliveryStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<DeliveryStackParamList, "DeliveryOrders">;

export default function DeliveryOrdersScreen({ navigation }: Props) {
  const { appUser, signOut } = useAuth();
  const [orders, setOrders] = useState<OrderDoc[]>([]);

  useEffect(() => {
    if (!appUser) return;
    // No orderBy here — combining it with the equality filter needs a
    // composite index in a specific sort direction, and a silent failure
    // there (permission/index error) leaves onSnapshot never firing with no
    // visible error. Sorting the small per-partner list client-side avoids
    // that footgun entirely.
    const q = query(collection(db, "orders"), where("assignedDeliveryUid", "==", appUser.uid));
    return onSnapshot(
      q,
      (snap) => {
        const docs = snap.docs.map((d) => d.data() as OrderDoc);
        docs.sort((a, b) => b.deliveryDate - a.deliveryDate);
        setOrders(docs);
      },
      (error) => {
        console.error("Failed to load assigned deliveries:", error);
      }
    );
  }, [appUser]);

  const active = orders.filter((o) => o.status === "confirmed" || o.status === "out_for_delivery");
  const done = orders.filter((o) => o.status === "delivered" || o.status === "cancelled");

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20, paddingTop: 56, paddingBottom: 40 }}>
      <View style={styles.header}>
        <Text style={styles.title}>Deliveries</Text>
        <Pressable onPress={signOut} hitSlop={10}>
          <LogOut size={18} color={colors.textMuted} />
        </Pressable>
      </View>

      <Text style={styles.sectionLabel}>To deliver ({active.length})</Text>
      {active.length === 0 && <Text style={styles.empty}>No deliveries assigned right now.</Text>}
      {active.map((order) => (
        <OrderRow
          key={order.id}
          order={order}
          onPress={() => navigation.navigate("DeliveryOrderDetail", { orderId: order.id })}
        />
      ))}

      {done.length > 0 && (
        <>
          <Text style={[styles.sectionLabel, { marginTop: 24 }]}>Completed ({done.length})</Text>
          {done.map((order) => (
            <OrderRow
              key={order.id}
              order={order}
              onPress={() => navigation.navigate("DeliveryOrderDetail", { orderId: order.id })}
            />
          ))}
        </>
      )}
    </ScrollView>
  );
}

function OrderRow({ order, onPress }: { order: OrderDoc; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={{ marginBottom: 10 }}>
      <Card>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={styles.cardTitle}>
              {order.items.map((i) => `${i.menuItemName} ×${i.quantity}`).join(", ")}
            </Text>
            <Text style={styles.cardSub}>
              {order.slot === "morning" ? "5–8 AM" : "5–8 PM"} · ₹{order.total} · Cash on delivery
            </Text>
          </View>
          <Chip status={order.status} />
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  title: { fontSize: 22, fontFamily: fonts.serif, color: colors.text },
  sectionLabel: {
    fontSize: 12.5, fontFamily: fonts.sansSemiBold, color: colors.textMuted,
    textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10,
  },
  empty: { color: colors.textMuted, fontFamily: fonts.sans, fontSize: 13.5, marginBottom: 8 },
  cardTitle: { fontSize: 14.5, fontFamily: fonts.serifMedium, color: colors.text },
  cardSub: { fontSize: 12.5, fontFamily: fonts.sans, color: colors.textMuted, marginTop: 6 },
});
