import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Clock } from "lucide-react-native";
import { useBookingWindow } from "@/lib/useBookingWindow";
import { colors, fonts, radii } from "@/lib/theme";

export default function BookingWindowBanner() {
  const openSlot = useBookingWindow();

  return (
    <View style={[styles.banner, { backgroundColor: openSlot ? colors.panel2 : "#FBF1E0" }]}>
      <Clock size={15} color={openSlot ? colors.accent : "#92650E"} />
      <Text style={[styles.text, { color: openSlot ? colors.accent : "#92650E" }]}>
        {openSlot
          ? `Booking is open now for the ${openSlot} slot`
          : "Booking is closed. Opens 5–8 AM and 5–8 PM daily."}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: radii.md,
    marginBottom: 16,
  },
  text: { fontSize: 12.5, fontFamily: fonts.sansSemiBold, flexShrink: 1 },
});
