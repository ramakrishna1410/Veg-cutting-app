import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Banknote, CheckCircle2, CreditCard } from "lucide-react-native";
import { AnimatePresence, MotiView } from "moti";
import * as Haptics from "expo-haptics";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useCart } from "@/context/CartContext";
import { useAddresses } from "@/context/AddressContext";
import { createOrder } from "@/lib/api";
import { PaymentMethod } from "@/lib/domain";
import { RootStackParamList } from "@/navigation/types";
import { colors, fonts, radii } from "@/lib/theme";
import { PrimaryButton, SoftCard } from "@/components/ui";

type Props = NativeStackScreenProps<RootStackParamList, "Checkout">;

export default function CheckoutScreen({ route, navigation }: Props) {
  const { slot } = route.params;
  const { lines, subtotal, deliveryFee, total, clear } = useCart();
  const { primaryAddress } = useAddresses();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [placing, setPlacing] = useState(false);
  const [placed, setPlaced] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    if (!primaryAddress || lines.length === 0) return;
    setError(null);
    setPlacing(true);
    try {
      await createOrder({
        items: lines.map((l) => ({ menuItemId: l.menuItemId, quantity: l.quantity })),
        slot,
        addressId: primaryAddress.id,
        paymentMethod: "cod",
      });
      clear();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setPlaced(true);
      setTimeout(() => navigation.getParent()?.navigate("Orders" as never), 1100);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not place order.");
    } finally {
      setPlacing(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Confirm your order</Text>

      <SoftCard>
        {lines.map((line) => (
          <View key={line.menuItemId} style={styles.itemRow}>
            <Text style={styles.itemName}>{line.name} ×{line.quantity}</Text>
            <Text style={styles.itemPrice}>₹{line.unitPrice * line.quantity}</Text>
          </View>
        ))}
        <View style={styles.divider} />
        <SummaryRow label="Subtotal" value={`₹${subtotal}`} />
        <SummaryRow label="Delivery" value={deliveryFee === 0 ? "Free" : `₹${deliveryFee}`} />
        <SummaryRow label="Slot" value={slot === "morning" ? "5–8 AM" : "5–8 PM"} />
        <SummaryRow label="Address" value={primaryAddress?.formattedAddress ?? "No address on file"} />
        <View style={styles.divider} />
        <SummaryRow label="Total" value={`₹${total}`} bold />
      </SoftCard>

      <Text style={styles.sectionLabel}>Payment method</Text>
      <View style={{ gap: 10 }}>
        <PaymentOption
          icon={<Banknote size={18} color={paymentMethod === "cod" ? colors.accent : colors.textMuted} />}
          label="Cash on delivery"
          sub="Pay the delivery partner when your order arrives"
          selected={paymentMethod === "cod"}
          disabled={false}
          onPress={() => setPaymentMethod("cod")}
        />
        <PaymentOption
          icon={<CreditCard size={18} color={colors.textMuted} />}
          label="Pay online"
          sub="Coming soon"
          selected={false}
          disabled
          onPress={() => {}}
        />
      </View>

      {!primaryAddress && (
        <Text style={styles.error}>Add a delivery address within our service area before ordering.</Text>
      )}
      {error && <Text style={styles.error}>{error}</Text>}

      <PrimaryButton
        style={{ marginTop: 24 }}
        onPress={handleConfirm}
        disabled={!primaryAddress || lines.length === 0 || placing || placed}
      >
        {placing ? "Placing order..." : `Place order — ₹${total}`}
      </PrimaryButton>

      <AnimatePresence>
        {placed && (
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={styles.successOverlay}
          >
            <MotiView
              from={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", damping: 10 }}
            >
              <CheckCircle2 size={64} color={colors.leaf} />
            </MotiView>
            <Text style={styles.successText}>Order placed!</Text>
          </MotiView>
        )}
      </AnimatePresence>
    </View>
  );
}

function SummaryRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={[styles.summaryLabel, bold && { fontFamily: fonts.sansBold, color: colors.text }]}>{label}</Text>
      <Text style={[styles.summaryValue, bold && { fontFamily: fonts.sansBold, fontSize: 15 }]}>{value}</Text>
    </View>
  );
}

function PaymentOption({
  icon,
  label,
  sub,
  selected,
  disabled,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  sub: string;
  selected: boolean;
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[styles.paymentOption, selected && styles.paymentOptionSelected, disabled && styles.paymentOptionDisabled]}
      onPress={onPress}
      disabled={disabled}
    >
      {icon}
      <View style={{ marginLeft: 10, flex: 1 }}>
        <Text style={[styles.paymentLabel, selected && { color: colors.accent }]}>{label}</Text>
        <Text style={styles.paymentSub}>{sub}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 56, backgroundColor: colors.bg },
  title: { fontSize: 20, fontFamily: fonts.serif, color: colors.text, marginBottom: 20 },
  itemRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  itemName: { fontSize: 13, fontFamily: fonts.sans, color: colors.text, flexShrink: 1 },
  itemPrice: { fontSize: 13, fontFamily: fonts.mono, color: colors.text },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 10 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  summaryLabel: { fontSize: 13, fontFamily: fonts.sans, color: colors.textMuted },
  summaryValue: { fontSize: 13, fontFamily: fonts.sansSemiBold, color: colors.text, flexShrink: 1, textAlign: "right", marginLeft: 12 },
  sectionLabel: { fontSize: 12.5, fontFamily: fonts.sansSemiBold, color: colors.textMuted, marginTop: 24, marginBottom: 10 },
  paymentOption: {
    flexDirection: "row", alignItems: "center", padding: 14,
    borderWidth: 1.5, borderColor: colors.border, borderRadius: radii.lg, backgroundColor: "#fff",
  },
  paymentOptionSelected: { borderColor: colors.accent, backgroundColor: colors.panel2 },
  paymentOptionDisabled: { opacity: 0.55 },
  paymentLabel: { fontSize: 14, fontFamily: fonts.sansSemiBold, color: colors.text },
  paymentSub: { fontSize: 11.5, fontFamily: fonts.sans, color: colors.textMuted, marginTop: 2 },
  error: { color: colors.danger, marginTop: 16, fontFamily: fonts.sans, fontSize: 13 },
  successOverlay: {
    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(255,255,255,0.96)",
    alignItems: "center", justifyContent: "center",
  },
  successText: { fontSize: 18, fontFamily: fonts.serif, color: colors.text, marginTop: 14 },
});
