import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useBookingWindow } from "@/lib/useBookingWindow";
import { DeliverySlot, SubscriptionPlan } from "@/lib/domain";
import { RootStackParamList } from "@/navigation/types";

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
          label="Morning (5–8 AM)"
          selected={slot === "morning"}
          bookable={openSlot === "morning"}
          onPress={() => setSlot("morning")}
        />
        <SlotOption
          label="Evening (5–8 PM)"
          selected={slot === "evening"}
          bookable={openSlot === "evening"}
          onPress={() => setSlot("evening")}
        />
      </View>
      {!openSlot && (
        <Text style={styles.notice}>
          Booking is closed right now. It opens 5:00–8:00 AM and 5:00–8:00 PM daily —
          you can still pick a slot, but you'll need to confirm during an open window.
        </Text>
      )}

      <Text style={[styles.title, { marginTop: 28 }]}>Pick your plan</Text>
      <View style={styles.row}>
        <PlanOption
          label="Weekly"
          selected={plan === "weekly"}
          onPress={() => setPlan("weekly")}
        />
        <PlanOption
          label="Monthly"
          selected={plan === "monthly"}
          onPress={() => setPlan("monthly")}
        />
      </View>

      <Pressable
        style={[styles.button, !slotIsBookable && styles.buttonDisabled]}
        disabled={!slotIsBookable}
        onPress={() =>
          navigation.navigate("Checkout", {
            categoryId: route.params.categoryId,
            plan,
            slot,
          })
        }
      >
        <Text style={styles.buttonText}>
          {slotIsBookable ? "Continue to checkout" : `${slot} booking window is closed`}
        </Text>
      </Pressable>
    </View>
  );
}

function SlotOption({
  label,
  selected,
  bookable,
  onPress,
}: {
  label: string;
  selected: boolean;
  bookable: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[styles.option, selected && styles.optionSelected]}
      onPress={onPress}
    >
      <Text style={selected ? styles.optionTextSelected : styles.optionText}>
        {label}
      </Text>
      <Text style={styles.optionSub}>{bookable ? "Open now" : "Closed now"}</Text>
    </Pressable>
  );
}

function PlanOption({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[styles.option, selected && styles.optionSelected]}
      onPress={onPress}
    >
      <Text style={selected ? styles.optionTextSelected : styles.optionText}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 56 },
  title: { fontSize: 18, fontWeight: "700", marginBottom: 12 },
  row: { flexDirection: "row", gap: 12 },
  option: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 14,
    alignItems: "center",
  },
  optionSelected: { borderColor: "#2E7D32", backgroundColor: "#E8F5E9" },
  optionText: { fontSize: 14, color: "#333" },
  optionTextSelected: { fontSize: 14, color: "#2E7D32", fontWeight: "700" },
  optionSub: { fontSize: 11, color: "#777", marginTop: 4 },
  notice: { fontSize: 12, color: "#E65100", marginTop: 10 },
  button: {
    backgroundColor: "#2E7D32",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    marginTop: 32,
  },
  buttonDisabled: { backgroundColor: "#aaa" },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
