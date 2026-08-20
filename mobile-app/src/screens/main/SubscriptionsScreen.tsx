import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { collection, doc, onSnapshot, query, updateDoc, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { useCategories } from "@/context/CategoriesContext";
import { SubscriptionDoc } from "@/lib/domain";
import { colors, fonts } from "@/lib/theme";
import { Card, Chip, SecondaryButton } from "@/components/ui";

export default function SubscriptionsScreen() {
  const { appUser } = useAuth();
  const { getCategory } = useCategories();
  const [subs, setSubs] = useState<SubscriptionDoc[]>([]);

  useEffect(() => {
    if (!appUser) return;
    const q = query(collection(db, "subscriptions"), where("uid", "==", appUser.uid));
    return onSnapshot(q, (snap) => {
      setSubs(snap.docs.map((d) => d.data() as SubscriptionDoc));
    });
  }, [appUser]);

  async function togglePause(sub: SubscriptionDoc) {
    const nextStatus = sub.status === "active" ? "paused" : "active";
    await updateDoc(doc(db, "subscriptions", sub.id), { status: nextStatus });
  }

  async function cancel(sub: SubscriptionDoc) {
    await updateDoc(doc(db, "subscriptions", sub.id), { status: "cancelled" });
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My subscriptions</Text>
      {subs.length === 0 && <Text style={styles.empty}>No subscriptions yet.</Text>}
      <FlatList
        data={subs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
              <Text style={styles.cardTitle}>{getCategory(item.categoryId)?.name ?? item.categoryId}</Text>
              <Chip status={item.status} />
            </View>
            <Text style={styles.cardSub}>
              {item.plan} · {item.slot === "morning" ? "5–8 AM" : "5–8 PM"}
            </Text>
            {item.status !== "cancelled" && (
              <View style={styles.actions}>
                <SecondaryButton onPress={() => togglePause(item)}>
                  {item.status === "active" ? "Pause" : "Resume"}
                </SecondaryButton>
                <SecondaryButton onPress={() => cancel(item)} style={{ borderColor: colors.dangerBg }}>
                  Cancel
                </SecondaryButton>
              </View>
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
  cardTitle: { fontSize: 16, fontFamily: fonts.serifMedium, color: colors.text, flexShrink: 1, marginRight: 8 },
  cardSub: { fontSize: 13, fontFamily: fonts.sans, color: colors.textMuted, marginTop: 6, textTransform: "capitalize" },
  actions: { flexDirection: "row", gap: 10, marginTop: 14 },
});
