import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Pressable, StyleSheet } from "react-native";
import { collection, doc, onSnapshot, query, updateDoc, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { useCategories } from "@/context/CategoriesContext";
import { SubscriptionDoc } from "@/lib/domain";

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
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              {getCategory(item.categoryId)?.name ?? item.categoryId}
            </Text>
            <Text style={styles.cardSub}>
              {item.plan} · {item.slot === "morning" ? "5–8 AM" : "5–8 PM"} · {item.status}
            </Text>
            {item.status !== "cancelled" && (
              <View style={styles.actions}>
                <Pressable style={styles.actionButton} onPress={() => togglePause(item)}>
                  <Text style={styles.actionText}>
                    {item.status === "active" ? "Pause" : "Resume"}
                  </Text>
                </Pressable>
                <Pressable style={styles.actionButton} onPress={() => cancel(item)}>
                  <Text style={[styles.actionText, styles.cancelText]}>Cancel</Text>
                </Pressable>
              </View>
            )}
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
  cardSub: { fontSize: 13, color: "#555", marginTop: 4, textTransform: "capitalize" },
  actions: { flexDirection: "row", gap: 16, marginTop: 12 },
  actionButton: { paddingVertical: 6 },
  actionText: { color: "#2E7D32", fontWeight: "600", fontSize: 13 },
  cancelText: { color: "#C62828" },
});
