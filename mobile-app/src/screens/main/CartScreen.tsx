import React from "react";
import { View, Text, FlatList, Pressable, StyleSheet } from "react-native";
import { Leaf, Minus, Plus, Trash2 } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useCart, CartLine } from "@/context/CartContext";
import { useBookingWindow } from "@/lib/useBookingWindow";
import { RootStackParamList } from "@/navigation/types";
import { colors, fonts, radii, shadow } from "@/lib/theme";
import { BOOKING_WINDOW_ENFORCED, FREE_DELIVERY_THRESHOLD } from "@/lib/domain";
import { PrimaryButton } from "@/components/ui";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function CartScreen() {
  const { lines, setQuantity, removeLine, subtotal, deliveryFee, total } = useCart();
  const openSlot = useBookingWindow();
  const canBookNow = BOOKING_WINDOW_ENFORCED ? openSlot !== null : true;
  const navigation = useNavigation<Nav>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your cart</Text>

      {lines.length === 0 && (
        <Text style={styles.empty}>Nothing here yet — add a veggie pack from Home.</Text>
      )}

      <FlatList
        data={lines}
        keyExtractor={(item) => item.menuItemId}
        renderItem={({ item }) => (
          <CartRow
            line={item}
            onQtyChange={(q) => setQuantity(item.menuItemId, q)}
            onRemove={() => removeLine(item.menuItemId)}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        contentContainerStyle={{ paddingBottom: 12 }}
      />

      {lines.length > 0 && (
        <View style={styles.summary}>
          <SummaryRow label="Subtotal" value={`₹${subtotal}`} />
          <SummaryRow
            label="Delivery"
            value={deliveryFee === 0 ? "Free" : `₹${deliveryFee}`}
            valueColor={deliveryFee === 0 ? colors.leaf : colors.text}
          />
          {deliveryFee > 0 && (
            <Text style={styles.hint}>
              Add ₹{FREE_DELIVERY_THRESHOLD - subtotal} more for free delivery
            </Text>
          )}
          <View style={styles.divider} />
          <SummaryRow label="Total" value={`₹${total}`} bold />

          <PrimaryButton
            style={{ marginTop: 16 }}
            disabled={!canBookNow}
            onPress={() => navigation.navigate("SlotPicker")}
          >
            {canBookNow ? "Choose delivery slot" : "Booking closed right now"}
          </PrimaryButton>
        </View>
      )}
    </View>
  );
}

function CartRow({
  line,
  onQtyChange,
  onRemove,
}: {
  line: CartLine;
  onQtyChange: (qty: number) => void;
  onRemove: () => void;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.rowThumb}>
        <Leaf size={18} color={colors.accent} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowName}>{line.name}</Text>
        <Text style={styles.rowPrice}>₹{line.unitPrice} each</Text>
      </View>
      <View style={styles.stepper}>
        <Pressable
          style={styles.stepperBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            line.quantity <= 1 ? onRemove() : onQtyChange(line.quantity - 1);
          }}
        >
          {line.quantity <= 1 ? <Trash2 size={14} color={colors.danger} /> : <Minus size={14} color={colors.text} />}
        </Pressable>
        <Text style={styles.stepperQty}>{line.quantity}</Text>
        <Pressable
          style={styles.stepperBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onQtyChange(line.quantity + 1);
          }}
        >
          <Plus size={14} color={colors.text} />
        </Pressable>
      </View>
      <Text style={styles.rowTotal}>₹{line.unitPrice * line.quantity}</Text>
    </View>
  );
}

function SummaryRow({
  label,
  value,
  bold,
  valueColor,
}: {
  label: string;
  value: string;
  bold?: boolean;
  valueColor?: string;
}) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
      <Text style={{ fontFamily: bold ? fonts.sansBold : fonts.sans, fontSize: bold ? 15 : 13, color: colors.text }}>
        {label}
      </Text>
      <Text
        style={{
          fontFamily: bold ? fonts.sansBold : fonts.sansSemiBold,
          fontSize: bold ? 15 : 13,
          color: valueColor ?? colors.text,
        }}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 56, backgroundColor: colors.bg },
  title: { fontSize: 22, fontFamily: fonts.serif, color: colors.text, marginBottom: 16 },
  empty: { color: colors.textMuted, fontFamily: fonts.sans },
  row: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: "#fff", borderRadius: radii.lg, padding: 14,
    borderWidth: 1, borderColor: colors.border, ...shadow.card,
  },
  rowThumb: {
    width: 40, height: 40, borderRadius: radii.md, backgroundColor: colors.panel,
    alignItems: "center", justifyContent: "center",
  },
  rowName: { fontSize: 14.5, fontFamily: fonts.serifMedium, color: colors.text },
  rowPrice: { fontSize: 12, fontFamily: fonts.sans, color: colors.textMuted, marginTop: 2 },
  stepper: { flexDirection: "row", alignItems: "center", gap: 8 },
  stepperBtn: {
    width: 28, height: 28, borderRadius: radii.sm, backgroundColor: "#fff",
    borderWidth: 1.5, borderColor: colors.border, alignItems: "center", justifyContent: "center",
  },
  stepperQty: { fontSize: 14, fontFamily: fonts.mono, color: colors.text, minWidth: 16, textAlign: "center" },
  rowTotal: { fontSize: 14, fontFamily: fonts.mono, color: colors.text, minWidth: 50, textAlign: "right" },
  summary: {
    backgroundColor: "#fff", borderRadius: radii.xl, padding: 18, marginTop: 12,
    borderWidth: 1, borderColor: colors.border, ...shadow.card,
  },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 8 },
  hint: { fontSize: 11.5, fontFamily: fonts.sans, color: colors.warm, marginBottom: 6 },
});
