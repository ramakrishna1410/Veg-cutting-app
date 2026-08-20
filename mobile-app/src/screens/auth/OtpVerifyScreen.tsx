import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { PhoneAuthProvider, signInWithCredential } from "firebase/auth";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { auth } from "@/lib/firebase";
import { AuthStackParamList } from "@/navigation/types";
import { colors, fonts, radii } from "@/lib/theme";
import { PrimaryButton } from "@/components/ui";

type Props = NativeStackScreenProps<AuthStackParamList, "OtpVerify">;

export default function OtpVerifyScreen({ route }: Props) {
  const { verificationId, phone } = route.params;
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleVerify() {
    setError(null);
    setVerifying(true);
    try {
      const credential = PhoneAuthProvider.credential(verificationId, code);
      await signInWithCredential(auth, credential);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid code.");
    } finally {
      setVerifying(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify your number</Text>
      <Text style={styles.subtitle}>Enter the code sent to {phone}</Text>
      <TextInput
        style={styles.input}
        value={code}
        onChangeText={setCode}
        keyboardType="number-pad"
        placeholder="6-digit code"
        placeholderTextColor={colors.textMuted}
        maxLength={6}
      />
      {error && <Text style={styles.error}>{error}</Text>}
      <PrimaryButton onPress={handleVerify} disabled={verifying}>
        {verifying ? "Verifying..." : "Verify"}
      </PrimaryButton>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24, backgroundColor: colors.bg },
  title: { fontSize: 22, fontFamily: fonts.serif, color: colors.text, marginBottom: 8 },
  subtitle: { fontSize: 14.5, fontFamily: fonts.sans, color: colors.textMuted, marginBottom: 24 },
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
  error: { color: colors.danger, marginBottom: 12, fontFamily: fonts.sans, fontSize: 13 },
});
