import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useAuth } from "@/context/AuthContext";
import { useAddresses } from "@/context/AddressContext";

export default function ProfileScreen() {
  const { appUser, signOut } = useAuth();
  const { addresses } = useAddresses();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Name</Text>
        <Text style={styles.value}>{appUser?.name}</Text>
        <Text style={styles.label}>Phone</Text>
        <Text style={styles.value}>{appUser?.phone}</Text>
      </View>

      <Text style={styles.sectionTitle}>Addresses</Text>
      {addresses.map((a) => (
        <View key={a.id} style={styles.addressCard}>
          <Text style={styles.addressLabel}>{a.label}</Text>
          <Text style={styles.addressValue}>{a.formattedAddress}</Text>
          <Text style={styles.addressMeta}>
            {a.distanceFromHubKm} km from hub ·{" "}
            {a.isWithinServiceArea ? "In service area" : "Outside service area"}
          </Text>
        </View>
      ))}

      <Pressable style={styles.signOutButton} onPress={signOut}>
        <Text style={styles.signOutText}>Sign out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 56 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 16 },
  card: { backgroundColor: "#F1F8E9", borderRadius: 12, padding: 16, marginBottom: 20 },
  label: { fontSize: 11, color: "#777", marginTop: 8 },
  value: { fontSize: 15, color: "#222", fontWeight: "600" },
  sectionTitle: { fontSize: 15, fontWeight: "700", marginBottom: 10 },
  addressCard: { borderWidth: 1, borderColor: "#eee", borderRadius: 10, padding: 12, marginBottom: 10 },
  addressLabel: { fontWeight: "700", fontSize: 13 },
  addressValue: { fontSize: 13, color: "#444", marginTop: 2 },
  addressMeta: { fontSize: 11, color: "#777", marginTop: 4 },
  signOutButton: { marginTop: 24, alignItems: "center", padding: 12 },
  signOutText: { color: "#C62828", fontWeight: "600" },
});
