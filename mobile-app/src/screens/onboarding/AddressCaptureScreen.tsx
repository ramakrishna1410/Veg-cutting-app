import React, { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import * as Location from "expo-location";
import { saveAddress } from "@/lib/api";

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
        [place.name, place.street, place.city, place.postalCode]
          .filter(Boolean)
          .join(", ")
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
      // AddressContext's onSnapshot listener picks this up automatically;
      // RootNavigator moves on once primaryAddress is set.
    } catch (e) {
      setStatus({
        kind: "error",
        message: e instanceof Error ? e.message : "Could not save address.",
      });
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Where should we deliver?</Text>
      <Text style={styles.subtitle}>
        We currently deliver within 5 km of Keelkattalai.
      </Text>

      <Pressable style={styles.linkButton} onPress={handleUseCurrentLocation}>
        <Text style={styles.linkButtonText}>
          {status.kind === "locating" ? "Locating..." : "Use my current location"}
        </Text>
      </Pressable>

      <Text style={styles.label}>Label</Text>
      <TextInput style={styles.input} value={label} onChangeText={setLabel} />

      <Text style={styles.label}>Address</Text>
      <TextInput
        style={[styles.input, styles.multiline]}
        value={formattedAddress}
        onChangeText={setFormattedAddress}
        multiline
        placeholder="House no, street, area, city, pincode"
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

      <Pressable
        style={[styles.button, (!coords || status.kind === "saving") && styles.buttonDisabled]}
        onPress={handleSave}
        disabled={!coords || status.kind === "saving"}
      >
        <Text style={styles.buttonText}>
          {status.kind === "saving" ? "Saving..." : "Save address"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 64 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 4 },
  subtitle: { fontSize: 14, color: "#555", marginBottom: 20 },
  linkButton: { marginBottom: 20 },
  linkButtonText: { color: "#2E7D32", fontWeight: "600", fontSize: 15 },
  label: { fontSize: 13, color: "#333", marginBottom: 6, marginTop: 8 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
  },
  multiline: { minHeight: 72, textAlignVertical: "top" },
  error: { color: "#C62828", marginTop: 16 },
  success: { color: "#2E7D32", marginTop: 16 },
  button: {
    backgroundColor: "#2E7D32",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    marginTop: 24,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
