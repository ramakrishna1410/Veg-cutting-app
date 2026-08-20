import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { MapPin } from "lucide-react-native";
import * as Location from "expo-location";
import { saveAddress } from "@/lib/api";
import { colors, fonts, radii } from "@/lib/theme";
import { PrimaryButton, SecondaryButton } from "@/components/ui";

export default function AddressCaptureScreen() {
  const [label, setLabel] = useState("Home");
  const [formattedAddress, setFormattedAddress] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [status, setStatus] = useState<
    { kind: "idle" }
    | { kind: "locating" }
    | { kind: "saving" }
    | { kind: "outside"; distanceKm: number }
    | { kind: "saved" }
    | { kind: "error"; message: string }
  >({ kind: "idle" });

  async function handleUseCurrentLocation() {
    setStatus({ kind: "locating" });
    const { status: permStatus } = await Location.requestForegroundPermissionsAsync();
    if (permStatus !== "granted") {
      setStatus({ kind: "error", message: "Location permission is required." });
      return;
    }
    const position = await Location.getCurrentPositionAsync({});
    const [place] = await Location.reverseGeocodeAsync({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    });
    setCoords({ lat: position.coords.latitude, lng: position.coords.longitude });
    if (place) {
      setFormattedAddress(
        [place.name, place.street, place.city, place.postalCode].filter(Boolean).join(", ")
      );
    }
    setStatus({ kind: "idle" });
  }

  async function handleSave() {
    if (!coords || !formattedAddress.trim()) return;
    setStatus({ kind: "saving" });
    try {
      const result = await saveAddress({
        label,
        lat: coords.lat,
        lng: coords.lng,
        formattedAddress: formattedAddress.trim(),
      });
      if (!result.isWithinServiceArea) {
        setStatus({ kind: "outside", distanceKm: result.distanceFromHubKm });
        return;
      }
      setStatus({ kind: "saved" });
    } catch (e) {
      setStatus({
        kind: "error",
        message: e instanceof Error ? e.message : "Could not save address.",
      });
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.crest}>
        <MapPin size={24} color="#fff" />
      </View>
      <Text style={styles.title}>Where should we deliver?</Text>
      <Text style={styles.subtitle}>We currently deliver within 5 km of Keelkattalai.</Text>

      <SecondaryButton
        onPress={handleUseCurrentLocation}
        icon={<MapPin size={14} color={colors.accent} />}
        style={{ marginBottom: 20, alignSelf: "flex-start" }}
      >
        {status.kind === "locating" ? "Locating..." : "Use my current location"}
      </SecondaryButton>

      <Text style={styles.label}>Label</Text>
      <TextInput style={styles.input} value={label} onChangeText={setLabel} />

      <Text style={styles.label}>Address</Text>
      <TextInput
        style={[styles.input, styles.multiline]}
        value={formattedAddress}
        onChangeText={setFormattedAddress}
        multiline
        placeholder="House no, street, area, city, pincode"
        placeholderTextColor={colors.textMuted}
      />

      {status.kind === "outside" && (
        <Text style={styles.error}>
          This address is about {status.distanceKm} km from our Keelkattalai hub —
          outside our 5 km delivery area. Try a closer address.
        </Text>
      )}
      {status.kind === "error" && <Text style={styles.error}>{status.message}</Text>}
      {status.kind === "saved" && (
        <Text style={styles.success}>Address saved — you're in our delivery area!</Text>
      )}

      <PrimaryButton
        onPress={handleSave}
        disabled={!coords || status.kind === "saving"}
        style={{ marginTop: 24 }}
      >
        {status.kind === "saving" ? "Saving..." : "Save address"}
      </PrimaryButton>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 64, backgroundColor: colors.bg },
  crest: {
    width: 52, height: 52, borderRadius: 16, backgroundColor: colors.accent,
    alignItems: "center", justifyContent: "center", marginBottom: 16,
  },
  title: { fontSize: 22, fontFamily: fonts.serif, color: colors.text, marginBottom: 4 },
  subtitle: { fontSize: 14, fontFamily: fonts.sans, color: colors.textMuted, marginBottom: 20 },
  label: { fontSize: 12.5, fontFamily: fonts.sansSemiBold, color: colors.textMuted, marginBottom: 6, marginTop: 8 },
  input: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: 12,
    fontSize: 15,
    fontFamily: fonts.sans,
    color: colors.text,
  },
  multiline: { minHeight: 72, textAlignVertical: "top" },
  error: { color: colors.danger, marginTop: 16, fontFamily: fonts.sans, fontSize: 13 },
  success: { color: colors.accent, marginTop: 16, fontFamily: fonts.sans, fontSize: 13 },
});
