import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useCategories } from "@/context/CategoriesContext";
import { useAddresses } from "@/context/AddressContext";
import { createSubscription } from "@/lib/api";
import { RootStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "Checkout">;

export default function CheckoutScreen({ route, navigation }: Props) {
  const { categoryId, plan, slot } = route.params;
  const { getCategory } = useCategories();
  const { primaryAddress } = useAddresses();
  const category = getCategory(categoryId);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const price = category
    ? plan === "weekly"
      ? category.priceWeekly
      : category.priceMonthly
    : 0;

  async function handleConfirm() {
    if (!primaryAddress) return;
    setError(null);
    setPlacing(true);
    try {
      await createSubscription({
        categoryId,
        plan,
        slot,
        addressId: primaryAddress.id,
      });
      navigation.getParent()?.navigate("Subscriptions" as never);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not place subscription.");
    } finally {
      setPlacing(false);
    }
  }

  if (!category) {
    return (
      <View style={styles.container}>
        <Text>Category not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Confirm your subscription</Text>

      <View style={styles.summaryBox}>
        <SummaryRow label="Category" value={category.name} />
        <SummaryRow label="Plan" value={plan} />
        <SummaryRow label="Slot" value={slot === "morning" ? "5–8 AM" : "5–8 PM"} />
        <SummaryRow
          label="Address"
          value={primaryAddress?.formattedAddress ?? "No address on file"}
        />
        <SummaryRow label="Price" value={`₹${price}`} />
        <SummaryRow label="Payment" value="Cash on delivery (for now)" />
      </View>

      {!primaryAddress && (
        <Text style={styles.error}>
          Add a delivery address within our service area before subscribing.
        </Text>
      )}
      {error && <Text style={styles.error}>{error}</Text>}

      <Pressable
        style={[styles.button, (!primaryAddress || placing) && styles.buttonDisabled]}
        onPress={handleConfirm}
        disabled={!primaryAddress || placing}
      >
        <Text style={styles.buttonText}>
          {placing ? "Placing..." : "Confirm subscription"}
        </Text>
      </Pressable>
    </View>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 56 },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 20 },
  summaryBox: { backgroundColor: "#F1F8E9", borderRadius: 12, padding: 16 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  summaryLabel: { fontSize: 13, color: "#666" },
  summaryValue: { fontSize: 13, color: "#222", fontWeight: "600", flexShrink: 1, textAlign: "right" },
  error: { color: "#C62828", marginTop: 16 },
  button: {
    backgroundColor: "#2E7D32",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    marginTop: 28,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
