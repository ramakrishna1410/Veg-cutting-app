import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Check, Package, ShoppingBag, Truck, X } from "lucide-react-native";
import { OrderStatus } from "@/lib/domain";
import { colors, fonts } from "@/lib/theme";

const STEPS: { status: OrderStatus; label: string; icon: typeof ShoppingBag }[] = [
  { status: "pending", label: "Placed", icon: ShoppingBag },
  { status: "confirmed", label: "Confirmed", icon: Package },
  { status: "out_for_delivery", label: "On the way", icon: Truck },
  { status: "delivered", label: "Delivered", icon: Check },
];

export default function StatusTimeline({ status }: { status: OrderStatus }) {
  if (status === "cancelled") {
    return (
      <View style={styles.cancelledRow}>
        <View style={[styles.dot, { backgroundColor: colors.danger }]}>
          <X size={11} color="#fff" />
        </View>
        <Text style={styles.cancelledText}>Order cancelled</Text>
      </View>
    );
  }

  const currentIndex = STEPS.findIndex((s) => s.status === status);

  return (
    <View style={styles.row}>
      {STEPS.map((step, i) => {
        const done = i <= currentIndex;
        const isLast = i === STEPS.length - 1;
        const Icon = step.icon;
        return (
          <React.Fragment key={step.status}>
            <View style={styles.stepCol}>
              <View style={[styles.dot, done && styles.dotDone]}>
                <Icon size={11} color={done ? "#fff" : colors.textMuted} />
              </View>
              <Text style={[styles.stepLabel, done && styles.stepLabelDone]}>{step.label}</Text>
            </View>
            {!isLast && <View style={[styles.connector, i < currentIndex && styles.connectorDone]} />}
          </React.Fragment>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "flex-start", marginTop: 4 },
  stepCol: { alignItems: "center", width: 62 },
  dot: {
    width: 22, height: 22, borderRadius: 11, backgroundColor: colors.panel,
    alignItems: "center", justifyContent: "center",
  },
  dotDone: { backgroundColor: colors.leaf },
  connector: { flex: 1, height: 2, backgroundColor: colors.panel, marginTop: 10 },
  connectorDone: { backgroundColor: colors.leaf },
  stepLabel: { fontSize: 9.5, fontFamily: fonts.sansSemiBold, color: colors.textMuted, marginTop: 4, textAlign: "center" },
  stepLabelDone: { color: colors.leaf },
  cancelledRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 6 },
  cancelledText: { fontSize: 12.5, fontFamily: fonts.sansSemiBold, color: colors.danger },
});
