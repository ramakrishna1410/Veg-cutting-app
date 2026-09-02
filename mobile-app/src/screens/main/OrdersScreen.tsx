import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { MapPin } from "lucide-react-native";
import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { OrderDoc } from "@/lib/domain";
import { colors, fonts } from "@/lib/theme";
import { Card, Chip, SecondaryButton } from "@/components/ui";
import { RootStackParamList } from "@/navigation/types";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function OrdersScreen() {
  const { appUser } = useAuth();
  const [orders, setOrders] = useState<OrderDoc[]>([]);
  const navigation = useNavigation<Nav>();

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
              <Text style={styles.cardTitle}>
                {item.items.map((i) => `${i.menuItemName} ×${i.quantity}`).join(", ")}
              </Text>
              <Chip status={item.status} />
            </View>
            <Text style={styles.cardSub}>
              {new Date(item.deliveryDate).toLocaleDateString("en-IN")} ·{" "}
              {item.slot === "morning" ? "5–8 AM" : "5–8 PM"}
            </Text>
            <Text style={styles.cardTotal}>
              ₹{item.total}{item.deliveryFee > 0 ? ` (incl. ₹${item.deliveryFee} delivery)` : ""} · Cash on delivery
            </Text>
            {item.status === "out_for_delivery" && (
              <SecondaryButton
                onPress={() => navigation.navigate("OrderTracking", { orderId: item.id })}
                icon={<MapPin size={13} color={colors.accent} />}
                style={{ marginTop: 12, alignSelf: "flex-start" }}
              >
                Track order
              </SecondaryButton>
            )}
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
  cardTitle: { fontSize: 15, fontFamily: fonts.serifMedium, color: colors.text, flexShrink: 1, marginRight: 8 },
  cardSub: { fontSize: 13, fontFamily: fonts.sans, color: colors.textMuted, marginTop: 6 },
  cardTotal: { fontSize: 12.5, fontFamily: fonts.sansSemiBold, color: colors.accent, marginTop: 6 },
});
