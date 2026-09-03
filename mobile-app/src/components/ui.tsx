import React, { PropsWithChildren, useRef } from "react";
import {
  Animated,
  Pressable,
  PressableProps,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Skeleton as MotiSkeleton } from "moti/skeleton";
import { colors, fonts, gradients, radii, shadow, chipColors } from "@/lib/theme";

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

/** Wraps a Pressable with a subtle scale-down on press — used by both button styles below. */
function usePressScale() {
  const scale = useRef(new Animated.Value(1)).current;
  const onPressIn = () =>
    Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, speed: 40, bounciness: 4 }).start();
  const onPressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 6 }).start();
  return { scale, onPressIn, onPressOut };
}

export function PrimaryButton({
  children,
  disabled,
  style,
  onPressIn,
  onPressOut,
  ...rest
}: PropsWithChildren<PressableProps & { disabled?: boolean; style?: ViewStyle }>) {
  const { scale, onPressIn: pressIn, onPressOut: pressOut } = usePressScale();
  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        disabled={disabled}
        onPressIn={(e) => {
          pressIn();
          onPressIn?.(e);
        }}
        onPressOut={(e) => {
          pressOut();
          onPressOut?.(e);
        }}
        {...rest}
      >
        <LinearGradient
          colors={disabled ? [colors.textMuted, colors.textMuted] : gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.primaryButton, !disabled && shadow.button, style]}
        >
          <Text style={styles.primaryButtonText}>{children}</Text>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

export function SecondaryButton({
  children,
  icon,
  style,
  onPressIn,
  onPressOut,
  ...rest
}: PropsWithChildren<PressableProps & { icon?: React.ReactNode; style?: ViewStyle }>) {
  const { scale, onPressIn: pressIn, onPressOut: pressOut } = usePressScale();
  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        style={[styles.secondaryButton, style]}
        onPressIn={(e) => {
          pressIn();
          onPressIn?.(e);
        }}
        onPressOut={(e) => {
          pressOut();
          onPressOut?.(e);
        }}
        {...rest}
      >
        {icon}
        <Text style={styles.secondaryButtonText}>{children}</Text>
      </Pressable>
    </Animated.View>
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

/** Shimmering placeholder block — use while data is loading instead of a plain "Loading..." string. */
export function Skeleton({ width, height, radius }: { width: number | `${number}%`; height: number; radius?: number }) {
  return (
    <MotiSkeleton
      colorMode="light"
      width={width}
      height={height}
      radius={radius ?? radii.md}
      backgroundColor={colors.panel}
      highlightColor={colors.panel2}
    />
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
    borderRadius: radii.md,
    paddingVertical: 14,
    alignItems: "center",
  },
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
