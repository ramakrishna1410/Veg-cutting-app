import React, { useRef, useState } from "react";
import { Platform, View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { Leaf } from "lucide-react-native";
import {
  signInWithPhoneNumber,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { FirebaseRecaptchaVerifierModal } from "expo-firebase-recaptcha";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { auth, app } from "@/lib/firebase";
import { AuthStackParamList } from "@/navigation/types";
import { colors, fonts, radii } from "@/lib/theme";
import { PrimaryButton } from "@/components/ui";

type Props = NativeStackScreenProps<AuthStackParamList, "PhoneLogin">;

export default function PhoneLoginScreen(props: Props) {
  if (Platform.OS === "web") {
    return <EmailLoginForm {...props} />;
  }
  return <PhoneLoginForm {...props} />;
}

// Native (iOS/Android): phone number + OTP via expo-firebase-recaptcha,
// which only has a working implementation on native.
function PhoneLoginForm({ navigation }: Props) {
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

// Web: email + password. Phone-OTP's recaptcha dependency doesn't work
// reliably in a browser, so the web build uses Firebase's standard
// email/password auth instead — same provider the admin dashboard uses.
function EmailLoginForm({ navigation }: Props) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setError(null);
    if (!email.trim() || !password.trim()) {
      setError("Enter your email and password.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setSubmitting(true);
    try {
      if (mode === "signup") {
        await createUserWithEmailAndPassword(auth, email.trim(), password);
        // Brand-new account — no Firestore profile yet, so collect a name.
        navigation.replace("CompleteProfile");
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
        // Existing account: AuthContext resolves the Firestore profile and
        // RootNavigator swaps away from this stack automatically. If this
        // account somehow has no profile yet, send them to complete one.
        navigation.replace("CompleteProfile");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not sign in.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.crest}>
        <Leaf size={26} color="#fff" />
      </View>
      <Text style={styles.title}>Veg Cutting App</Text>
      <Text style={styles.subtitle}>Fresh cut veggies, delivered daily.</Text>

      <View style={styles.modeRow}>
        <Pressable
          style={[styles.modeButton, mode === "signin" && styles.modeButtonActive]}
          onPress={() => setMode("signin")}
        >
          <Text style={mode === "signin" ? styles.modeTextActive : styles.modeText}>Sign in</Text>
        </Pressable>
        <Pressable
          style={[styles.modeButton, mode === "signup" && styles.modeButtonActive]}
          onPress={() => setMode("signup")}
        >
          <Text style={mode === "signup" ? styles.modeTextActive : styles.modeText}>Sign up</Text>
        </Pressable>
      </View>

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholder="you@example.com"
        placeholderTextColor={colors.textMuted}
      />

      <Text style={styles.label}>Password</Text>
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder="At least 6 characters"
        placeholderTextColor={colors.textMuted}
      />
      {error && <Text style={styles.error}>{error}</Text>}
      <PrimaryButton onPress={handleSubmit} disabled={submitting}>
        {submitting ? "Please wait..." : mode === "signin" ? "Sign in" : "Create account"}
      </PrimaryButton>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24, backgroundColor: colors.bg, maxWidth: 420, width: "100%", alignSelf: "center" },
  crest: {
    width: 60, height: 60, borderRadius: 18, backgroundColor: colors.accent,
    alignItems: "center", justifyContent: "center", marginBottom: 18,
  },
  title: { fontSize: 26, fontFamily: fonts.serif, color: colors.text },
  subtitle: { fontSize: 14.5, fontFamily: fonts.sans, color: colors.textMuted, marginBottom: 24, marginTop: 4 },
  modeRow: { flexDirection: "row", gap: 8, marginBottom: 20 },
  modeButton: {
    flex: 1, paddingVertical: 10, borderRadius: radii.md, alignItems: "center",
    borderWidth: 1.5, borderColor: colors.border,
  },
  modeButtonActive: { backgroundColor: colors.panel2, borderColor: colors.accent },
  modeText: { fontFamily: fonts.sansSemiBold, fontSize: 13.5, color: colors.textMuted },
  modeTextActive: { fontFamily: fonts.sansBold, fontSize: 13.5, color: colors.accent },
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
