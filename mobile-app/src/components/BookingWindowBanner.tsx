import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useBookingWindow } from "@/lib/useBookingWindow";

export default function BookingWindowBanner() {
  const openSlot = useBookingWindow();

  return (
    <View style={[styles.banner, openSlot ? styles.open : styles.closed]}>
      <Text style={styles.text}>
        {openSlot
          ? `Booking is open now for the ${openSlot} slot`
          : "Booking is closed. Open 5:00–8:00 AM and 5:00–8:00 PM daily."}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: { padding: 10, borderRadius: 8, marginBottom: 16 },
  open: { backgroundColor: "#E8F5E9" },
  closed: { backgroundColor: "#FFF3E0" },
  text: { fontSize: 13, color: "#333", textAlign: "center" },
});
