import React, { useRef, useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { signInWithPhoneNumber } from "firebase/auth";
import { FirebaseRecaptchaVerifierModal } from "expo-firebase-recaptcha";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { auth, app } from "@/lib/firebase";
import { AuthStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<AuthStackParamList, "PhoneLogin">;

export default function PhoneLoginScreen({ navigation }: Props) {
  const recaptchaVerifier = useRef<FirebaseRecaptchaVerifierModal>(null);
  const [phone, setPhone] = useState("+91");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSendOtp() {
    setError(null);
    if (!/^\+91\d{10}$/.test(phone)) {
      setError("Enter a valid 10-digit Indian phone number.");
      return;
    }
    if (!recaptchaVerifier.current) return;
    setSending(true);
    try {
      const confirmation = await signInWithPhoneNumber(
        auth,
        phone,
        recaptchaVerifier.current
      );
      navigation.navigate("OtpVerify", {
        verificationId: confirmation.verificationId,
        phone,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not send OTP.");
    } finally {
      setSending(false);
    }
  }

  return (
    <View style={styles.container}>
      <FirebaseRecaptchaVerifierModal
        ref={recaptchaVerifier}
        firebaseConfig={app.options}
      />
      <Text style={styles.title}>Veg Cutting App</Text>
      <Text style={styles.subtitle}>Fresh cut veggies, delivered daily.</Text>
      <Text style={styles.label}>Mobile number</Text>
      <TextInput
        style={styles.input}
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        placeholder="+91XXXXXXXXXX"
      />
      {error && <Text style={styles.error}>{error}</Text>}
      <Pressable
        style={[styles.button, sending && styles.buttonDisabled]}
        onPress={handleSendOtp}
        disabled={sending}
      >
        <Text style={styles.buttonText}>
          {sending ? "Sending..." : "Send OTP"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24 },
  title: { fontSize: 28, fontWeight: "700", color: "#2E7D32" },
  subtitle: { fontSize: 15, color: "#555", marginBottom: 32 },
  label: { fontSize: 13, color: "#333", marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  error: { color: "#C62828", marginBottom: 12 },
  button: {
    backgroundColor: "#2E7D32",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
