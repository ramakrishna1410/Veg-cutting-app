import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { useCategories } from "@/context/CategoriesContext";
import { OrderDoc } from "@/lib/domain";
import { colors, fonts } from "@/lib/theme";
import { Card, Chip } from "@/components/ui";

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
          <Card>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
              <Text style={styles.cardTitle}>{getCategory(item.categoryId)?.name ?? item.categoryId}</Text>
              <Chip status={item.status} />
            </View>
            <Text style={styles.cardSub}>
              {new Date(item.deliveryDate).toLocaleDateString("en-IN")} ·{" "}
              {item.slot === "morning" ? "5–8 AM" : "5–8 PM"}
            </Text>
          </Card>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 56, backgroundColor: colors.bg },
  title: { fontSize: 22, fontFamily: fonts.serif, color: colors.text, marginBottom: 16 },
  empty: { color: colors.textMuted, fontFamily: fonts.sans },
  cardTitle: { fontSize: 16, fontFamily: fonts.serifMedium, color: colors.text, flexShrink: 1, marginRight: 8 },
  cardSub: { fontSize: 13, fontFamily: fonts.sans, color: colors.textMuted, marginTop: 6 },
});
