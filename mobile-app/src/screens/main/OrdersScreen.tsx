import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { useCategories } from "@/context/CategoriesContext";
import { OrderDoc } from "@/lib/domain";

export default function OrdersScreen() {
  const { appUser } = useAuth();
  const { getCategory } = useCategories();
  const [orders, setOrders] = useState<OrderDoc[]>([]);

  useEffect(() => {
    if (!appUser) return;
    const q = query(
      collection(db, "orders"),
      where("uid", "==", appUser.uid),
      orderBy("deliveryDate", "desc")
    );
    return onSnapshot(q, (snap) => {
      setOrders(snap.docs.map((d) => d.data() as OrderDoc));
    });
  }, [appUser]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Order history</Text>
      {orders.length === 0 && <Text style={styles.empty}>No orders yet.</Text>}
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              {getCategory(item.categoryId)?.name ?? item.categoryId}
            </Text>
            <Text style={styles.cardSub}>
              {new Date(item.deliveryDate).toLocaleDateString("en-IN")} ·{" "}
              {item.slot === "morning" ? "5–8 AM" : "5–8 PM"}
            </Text>
            <Text style={styles.status}>{item.status.replace(/_/g, " ")}</Text>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 56 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 16 },
  empty: { color: "#777" },
  card: { backgroundColor: "#F1F8E9", borderRadius: 12, padding: 16 },
  cardTitle: { fontSize: 16, fontWeight: "700", color: "#33691E" },
  cardSub: { fontSize: 13, color: "#555", marginTop: 4 },
  status: { fontSize: 12, color: "#2E7D32", marginTop: 6, textTransform: "capitalize", fontWeight: "600" },
});
