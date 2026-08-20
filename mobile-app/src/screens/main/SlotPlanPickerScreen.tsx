import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useBookingWindow } from "@/lib/useBookingWindow";
import { DeliverySlot, SubscriptionPlan } from "@/lib/domain";
import { RootStackParamList } from "@/navigation/types";
import { colors, fonts, radii } from "@/lib/theme";
import { PrimaryButton } from "@/components/ui";

type Props = NativeStackScreenProps<RootStackParamList, "SlotPlanPicker">;

export default function SlotPlanPickerScreen({ route, navigation }: Props) {
  const openSlot = useBookingWindow();
  const [slot, setSlot] = useState<DeliverySlot>("morning");
  const [plan, setPlan] = useState<SubscriptionPlan>("weekly");

  const slotIsBookable = slot === openSlot;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pick your slot</Text>
      <View style={styles.row}>
        <SlotOption
          label="Morning"
          sub="5–8 AM"
          selected={slot === "morning"}
          bookable={openSlot === "morning"}
          onPress={() => setSlot("morning")}
        />
        <SlotOption
          label="Evening"
          sub="5–8 PM"
          selected={slot === "evening"}
          bookable={openSlot === "evening"}
          onPress={() => setSlot("evening")}
        />
      </View>
      {!openSlot && (
        <Text style={styles.notice}>
          Booking is closed right now. It opens 5–8 AM and 5–8 PM daily — you can still
          pick a slot, but you'll need to confirm during an open window.
        </Text>
      )}

      <Text style={[styles.title, { marginTop: 28 }]}>Pick your plan</Text>
      <View style={styles.row}>
        <PlanOption label="Weekly" selected={plan === "weekly"} onPress={() => setPlan("weekly")} />
        <PlanOption label="Monthly" selected={plan === "monthly"} onPress={() => setPlan("monthly")} />
      </View>

      <PrimaryButton
        style={{ marginTop: 32 }}
        disabled={!slotIsBookable}
        onPress={() =>
          navigation.navigate("Checkout", { categoryId: route.params.categoryId, plan, slot })
        }
      >
        {slotIsBookable ? "Continue to checkout" : `${slot} booking window is closed`}
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

function PlanOption({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable style={[styles.option, selected && styles.optionSelected]} onPress={onPress}>
      <Text style={selected ? styles.optionTextSelected : styles.optionText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 56, backgroundColor: colors.bg },
  title: { fontSize: 17, fontFamily: fonts.sansBold, color: colors.text, marginBottom: 12 },
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
  notice: { fontSize: 12, fontFamily: fonts.sans, color: "#92650E", marginTop: 10 },
});
