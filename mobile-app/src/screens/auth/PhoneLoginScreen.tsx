import React, { useRef, useState } from "react";
import { Platform, View, Text, TextInput, StyleSheet } from "react-native";
import { Leaf, Smartphone } from "lucide-react-native";
import { signInWithPhoneNumber } from "firebase/auth";
import { FirebaseRecaptchaVerifierModal } from "expo-firebase-recaptcha";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { auth, app } from "@/lib/firebase";
import { AuthStackParamList } from "@/navigation/types";
import { colors, fonts, radii } from "@/lib/theme";
import { PrimaryButton } from "@/components/ui";

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
      const confirmation = await signInWithPhoneNumber(auth, phone, recaptchaVerifier.current);
      navigation.navigate("OtpVerify", { verificationId: confirmation.verificationId, phone });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not send OTP.");
    } finally {
      setSending(false);
    }
  }

  // expo-firebase-recaptcha's web build depends on Firebase's older "compat"
  // SDK being separately initialized, which this app doesn't do (it uses the
  // modern modular SDK everywhere else) — so phone OTP login isn't supported
  // in the browser. Point testers at Expo Go instead of crashing.
  if (Platform.OS === "web") {
    return (
      <View style={styles.container}>
        <View style={styles.crest}>
          <Smartphone size={26} color="#fff" />
        </View>
        <Text style={styles.title}>Veg Cutting App</Text>
        <Text style={styles.subtitle}>
          Phone sign-in isn't available in the browser yet. Open this app in Expo Go on
          your phone to sign in and test the full flow.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FirebaseRecaptchaVerifierModal ref={recaptchaVerifier} firebaseConfig={app.options} />
      <View style={styles.crest}>
        <Leaf size={26} color="#fff" />
      </View>
      <Text style={styles.title}>Veg Cutting App</Text>
      <Text style={styles.subtitle}>Fresh cut veggies, delivered daily.</Text>

      <Text style={styles.label}>Mobile number</Text>
      <TextInput
        style={styles.input}
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        placeholder="+91XXXXXXXXXX"
        placeholderTextColor={colors.textMuted}
      />
      {error && <Text style={styles.error}>{error}</Text>}
      <PrimaryButton onPress={handleSendOtp} disabled={sending}>
        {sending ? "Sending..." : "Send OTP"}
      </PrimaryButton>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24, backgroundColor: colors.bg },
  crest: {
    width: 60, height: 60, borderRadius: 18, backgroundColor: colors.accent,
    alignItems: "center", justifyContent: "center", marginBottom: 18,
  },
  title: { fontSize: 26, fontFamily: fonts.serif, color: colors.text },
  subtitle: { fontSize: 14.5, fontFamily: fonts.sans, color: colors.textMuted, marginBottom: 32, marginTop: 4 },
  label: { fontSize: 12.5, fontFamily: fonts.sansSemiBold, color: colors.textMuted, marginBottom: 6 },
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
