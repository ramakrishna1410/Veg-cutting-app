import React, { PropsWithChildren } from "react";
import {
  Pressable,
  PressableProps,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import { colors, fonts, radii, chipColors } from "@/lib/theme";

export function Card({ children, style }: PropsWithChildren<{ style?: ViewStyle }>) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function SoftCard({ children, style }: PropsWithChildren<{ style?: ViewStyle }>) {
  return <View style={[styles.softCard, style]}>{children}</View>;
}

export function Eyebrow({ children }: PropsWithChildren) {
  return <Text style={styles.eyebrow}>{children}</Text>;
}

export function SerifTitle({ children, style }: PropsWithChildren<{ style?: object }>) {
  return <Text style={[styles.serifTitle, style]}>{children}</Text>;
}

export function PrimaryButton({
  children,
  disabled,
  style,
  ...rest
}: PropsWithChildren<PressableProps & { disabled?: boolean; style?: ViewStyle }>) {
  return (
    <Pressable
      style={[styles.primaryButton, disabled && styles.primaryButtonDisabled, style]}
      disabled={disabled}
      {...rest}
    >
      <Text style={styles.primaryButtonText}>{children}</Text>
    </Pressable>
  );
}

export function SecondaryButton({
  children,
  icon,
  style,
  ...rest
}: PropsWithChildren<PressableProps & { icon?: React.ReactNode; style?: ViewStyle }>) {
  return (
    <Pressable style={[styles.secondaryButton, style]} {...rest}>
      {icon}
      <Text style={styles.secondaryButtonText}>{children}</Text>
    </Pressable>
  );
}

export function Chip({ status }: { status: string }) {
  const c = chipColors[status] ?? { bg: colors.panel2, fg: colors.accent };
  return (
    <View style={[styles.chip, { backgroundColor: c.bg }]}>
      <Text style={[styles.chipText, { color: c.fg }]}>{status.replace(/_/g, " ")}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xl,
    padding: 18,
    backgroundColor: "#fff",
  },
  softCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xl,
    padding: 18,
    backgroundColor: colors.panel,
  },
  eyebrow: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: colors.textMuted,
  },
  serifTitle: {
    fontFamily: fonts.serif,
    fontSize: 22,
    color: colors.text,
  },
  primaryButton: {
    backgroundColor: colors.accent,
    borderRadius: radii.md,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryButtonDisabled: { opacity: 0.5 },
  primaryButtonText: {
    color: "#fff",
    fontSize: 15,
    fontFamily: fonts.sansBold,
  },
  secondaryButton: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
  },
  secondaryButtonText: {
    color: colors.text,
    fontSize: 13.5,
    fontFamily: fonts.sansSemiBold,
  },
  chip: {
    alignSelf: "flex-start",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: radii.pill,
  },
  chipText: {
    fontSize: 11.5,
    fontFamily: fonts.sansBold,
    textTransform: "capitalize",
  },
});
