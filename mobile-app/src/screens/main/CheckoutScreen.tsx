import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useCategories } from "@/context/CategoriesContext";
import { useAddresses } from "@/context/AddressContext";
import { createSubscription } from "@/lib/api";
import { RootStackParamList } from "@/navigation/types";
import { colors, fonts, radii } from "@/lib/theme";
import { PrimaryButton, SoftCard } from "@/components/ui";

type Props = NativeStackScreenProps<RootStackParamList, "Checkout">;

export default function CheckoutScreen({ route, navigation }: Props) {
  const { categoryId, plan, slot } = route.params;
  const { getCategory } = useCategories();
  const { primaryAddress } = useAddresses();
  const category = getCategory(categoryId);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const price = category ? (plan === "weekly" ? category.priceWeekly : category.priceMonthly) : 0;

  async function handleConfirm() {
    if (!primaryAddress) return;
    setError(null);
    setPlacing(true);
    try {
      await createSubscription({ categoryId, plan, slot, addressId: primaryAddress.id });
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
        <Text style={{ fontFamily: fonts.sans }}>Category not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Confirm your subscription</Text>

      <SoftCard>
        <SummaryRow label="Category" value={category.name} />
        <SummaryRow label="Plan" value={plan} />
        <SummaryRow label="Slot" value={slot === "morning" ? "5–8 AM" : "5–8 PM"} />
        <SummaryRow label="Address" value={primaryAddress?.formattedAddress ?? "No address on file"} />
        <SummaryRow label="Price" value={`₹${price}`} />
        <SummaryRow label="Payment" value="Cash on delivery (for now)" last />
      </SoftCard>

      {!primaryAddress && (
        <Text style={styles.error}>
          Add a delivery address within our service area before subscribing.
        </Text>
      )}
      {error && <Text style={styles.error}>{error}</Text>}

      <PrimaryButton style={{ marginTop: 28 }} onPress={handleConfirm} disabled={!primaryAddress || placing}>
        {placing ? "Placing..." : "Confirm subscription"}
      </PrimaryButton>
    </View>
  );
}

function SummaryRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={[styles.summaryRow, !last && { marginBottom: 12 }]}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 56, backgroundColor: colors.bg },
  title: { fontSize: 20, fontFamily: fonts.serif, color: colors.text, marginBottom: 20 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between" },
  summaryLabel: { fontSize: 13, fontFamily: fonts.sans, color: colors.textMuted },
  summaryValue: { fontSize: 13, fontFamily: fonts.sansSemiBold, color: colors.text, flexShrink: 1, textAlign: "right", marginLeft: 12 },
  error: { color: colors.danger, marginTop: 16, fontFamily: fonts.sans, fontSize: 13 },
});
