import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { useAuth } from "@/context/AuthContext";
import { colors, fonts, radii } from "@/lib/theme";
import { PrimaryButton } from "@/components/ui";

export default function CompleteProfileScreen() {
  const { completeProfile } = useAuth();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await completeProfile(name.trim());
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>What should we call you?</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Your name"
        placeholderTextColor={colors.textMuted}
      />
      <PrimaryButton onPress={handleSave} disabled={saving || !name.trim()}>
        {saving ? "Saving..." : "Continue"}
      </PrimaryButton>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24, backgroundColor: colors.bg },
  title: { fontSize: 22, fontFamily: fonts.serif, color: colors.text, marginBottom: 24 },
  input: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: 13,
    fontSize: 16,
    fontFamily: fonts.sans,
    color: colors.text,
    marginBottom: 16,
  },
});
