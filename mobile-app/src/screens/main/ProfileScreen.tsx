import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LogOut, MapPin } from "lucide-react-native";
import { useAuth } from "@/context/AuthContext";
import { useAddresses } from "@/context/AddressContext";
import { colors, fonts, radii } from "@/lib/theme";
import { SoftCard, SecondaryButton } from "@/components/ui";

export default function ProfileScreen() {
  const { appUser, signOut } = useAuth();
  const { addresses } = useAddresses();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>

      <View style={styles.avatarRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{appUser?.name?.slice(0, 2).toUpperCase() ?? "?"}</Text>
        </View>
        <View>
          <Text style={styles.name}>{appUser?.name}</Text>
          <Text style={styles.phone}>{appUser?.phone}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Addresses</Text>
      {addresses.map((a) => (
        <SoftCard key={a.id} style={{ marginBottom: 10 }}>
          <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 8 }}>
            <MapPin size={14} color={colors.textMuted} style={{ marginTop: 2 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.addressLabel}>{a.label}</Text>
              <Text style={styles.addressValue}>{a.formattedAddress}</Text>
              <Text style={styles.addressMeta}>
                {a.distanceFromHubKm} km from hub · {a.isWithinServiceArea ? "In service area" : "Outside service area"}
              </Text>
            </View>
          </View>
        </SoftCard>
      ))}

      <SecondaryButton
        onPress={signOut}
        icon={<LogOut size={14} color={colors.danger} />}
        style={{ marginTop: 16, alignSelf: "flex-start", borderColor: colors.dangerBg }}
      >
        <Text style={{ color: colors.danger, fontFamily: fonts.sansSemiBold, fontSize: 13.5 }}>Sign out</Text>
      </SecondaryButton>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 56, backgroundColor: colors.bg },
  title: { fontSize: 22, fontFamily: fonts.serif, color: colors.text, marginBottom: 20 },
  avatarRow: { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 28 },
  avatar: {
    width: 52, height: 52, borderRadius: 26, backgroundColor: colors.accent,
    alignItems: "center", justifyContent: "center",
  },
  avatarText: { color: "#fff", fontFamily: fonts.serif, fontSize: 17 },
  name: { fontSize: 16, fontFamily: fonts.sansBold, color: colors.text },
  phone: { fontSize: 13, fontFamily: fonts.sans, color: colors.textMuted, marginTop: 2 },
  sectionTitle: { fontSize: 14, fontFamily: fonts.sansBold, color: colors.text, marginBottom: 10 },
  addressLabel: { fontFamily: fonts.sansBold, fontSize: 13, color: colors.text },
  addressValue: { fontSize: 13, fontFamily: fonts.sans, color: colors.text, marginTop: 2 },
  addressMeta: { fontSize: 11, fontFamily: fonts.sans, color: colors.textMuted, marginTop: 4 },
});
