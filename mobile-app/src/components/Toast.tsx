import React, { useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Bell } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNotifications } from "@/context/NotificationsContext";
import { colors, fonts, radii } from "@/lib/theme";
import { RootStackParamList } from "@/navigation/types";

type Nav = NativeStackNavigationProp<RootStackParamList & { Main: undefined }>;

export default function Toast() {
  const { toast, dismissToast } = useNotifications();
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(-120)).current;
  const navigation = useNavigation<Nav>();

  useEffect(() => {
    if (!toast) return;
    Animated.spring(translateY, { toValue: 0, useNativeDriver: true, damping: 16 }).start();
    const timer = setTimeout(() => {
      Animated.timing(translateY, { toValue: -120, duration: 200, useNativeDriver: true }).start(() =>
        dismissToast()
      );
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  if (!toast) return null;

  function handlePress() {
    dismissToast();
    if (toast?.orderId) navigation.navigate("OrderTracking", { orderId: toast.orderId });
  }

  return (
    <Animated.View style={[styles.wrap, { top: insets.top + 8, transform: [{ translateY }] }]}>
      <Pressable style={styles.card} onPress={handlePress}>
        <Bell size={16} color={colors.accent} />
        <Animated.View style={{ flex: 1 }}>
          <Text style={styles.title}>{toast.title}</Text>
          <Text style={styles.body} numberOfLines={2}>
            {toast.body}
          </Text>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: "absolute", left: 16, right: 16, zIndex: 999 },
  card: {
    flexDirection: "row", alignItems: "flex-start", gap: 10,
    backgroundColor: "#fff", borderRadius: radii.lg, padding: 14,
    borderWidth: 1, borderColor: colors.border,
    shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 12, shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  title: { fontFamily: fonts.sansBold, fontSize: 13.5, color: colors.text },
  body: { fontFamily: fonts.sans, fontSize: 12.5, color: colors.textMuted, marginTop: 2 },
});
