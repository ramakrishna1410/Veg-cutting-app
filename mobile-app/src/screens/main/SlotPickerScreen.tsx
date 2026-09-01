import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useBookingWindow } from "@/lib/useBookingWindow";
import { BOOKING_WINDOW_ENFORCED, DeliverySlot, isSlotBookable } from "@/lib/domain";
import { useCart } from "@/context/CartContext";
import { RootStackParamList } from "@/navigation/types";
import { colors, fonts, radii } from "@/lib/theme";
import { PrimaryButton } from "@/components/ui";

type Props = NativeStackScreenProps<RootStackParamList, "SlotPicker">;

export default function SlotPickerScreen({ navigation }: Props) {
  const openSlot = useBookingWindow();
  const { total } = useCart();
  const [slot, setSlot] = useState<DeliverySlot>(openSlot ?? "morning");

  const slotIsBookable = isSlotBookable(slot);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pick your delivery slot</Text>
      <Text style={styles.subtitle}>Delivery happens within the window you choose.</Text>

      <View style={styles.row}>
        <SlotOption
          label="Morning"
          sub="5–8 AM"
          selected={slot === "morning"}
          bookable={isSlotBookable("morning")}
          onPress={() => setSlot("morning")}
        />
        <SlotOption
          label="Evening"
          sub="5–8 PM"
          selected={slot === "evening"}
          bookable={isSlotBookable("evening")}
          onPress={() => setSlot("evening")}
        />
      </View>
      {BOOKING_WINDOW_ENFORCED && !openSlot && (
        <Text style={styles.notice}>
          Booking is closed right now. It opens 5–8 AM and 5–8 PM daily — come back during
          one of those windows to place this order.
        </Text>
      )}
      {!BOOKING_WINDOW_ENFORCED && (
        <Text style={styles.testNotice}>Booking-window check is disabled for testing.</Text>
      )}

      <PrimaryButton
        style={{ marginTop: 32 }}
        disabled={!slotIsBookable}
        onPress={() => navigation.navigate("Checkout", { slot })}
      >
        {slotIsBookable ? `Continue to checkout — ₹${total}` : `${slot} booking window is closed`}
      </PrimaryButton>
    </View>
  );
}

function SlotOption({
  label,
  sub,
  selected,
  bookable,
  onPress,
}: {
  label: string;
  sub: string;
  selected: boolean;
  bookable: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={[styles.option, selected && styles.optionSelected]} onPress={onPress}>
      <Text style={selected ? styles.optionTextSelected : styles.optionText}>{label}</Text>
      <Text style={styles.optionSubtext}>{sub}</Text>
      <Text style={[styles.optionBadge, { color: bookable ? colors.accent : colors.textMuted }]}>
        {bookable ? "Open now" : "Closed now"}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 56, backgroundColor: colors.bg },
  title: { fontSize: 20, fontFamily: fonts.serif, color: colors.text, marginBottom: 4 },
  subtitle: { fontSize: 13.5, fontFamily: fonts.sans, color: colors.textMuted, marginBottom: 20 },
  row: { flexDirection: "row", gap: 12 },
  option: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: 14,
    alignItems: "center",
  },
  optionSelected: { borderColor: colors.accent, backgroundColor: colors.panel2 },
  optionText: { fontSize: 14, fontFamily: fonts.sansSemiBold, color: colors.text },
  optionTextSelected: { fontSize: 14, fontFamily: fonts.sansBold, color: colors.accent },
  optionSubtext: { fontSize: 11.5, fontFamily: fonts.sans, color: colors.textMuted, marginTop: 4 },
  optionBadge: { fontSize: 10.5, fontFamily: fonts.sansSemiBold, marginTop: 6 },
  notice: { fontSize: 12, fontFamily: fonts.sans, color: "#92650E", marginTop: 14 },
  testNotice: { fontSize: 11.5, fontFamily: fonts.sansSemiBold, color: colors.warm, marginTop: 14 },
});
