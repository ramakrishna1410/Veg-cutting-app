import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Minus, Plus } from "lucide-react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useMenuItems } from "@/context/MenuItemsContext";
import { useCart } from "@/context/CartContext";
import { RootStackParamList } from "@/navigation/types";
import { colors, fonts, radii } from "@/lib/theme";
import { PrimaryButton, Card } from "@/components/ui";

type Props = NativeStackScreenProps<RootStackParamList, "MenuItemDetail">;

export default function MenuItemDetailScreen({ route, navigation }: Props) {
  const { getMenuItem } = useMenuItems();
  const { lines, setQuantity } = useCart();
  const menuItem = getMenuItem(route.params.menuItemId);
  const existingLine = lines.find((l) => l.menuItemId === route.params.menuItemId);
  const [qty, setQty] = useState(existingLine?.quantity ?? 1);

  if (!menuItem) {
    return (
      <View style={styles.container}>
        <Text style={{ fontFamily: fonts.sans, color: colors.text }}>Item not found.</Text>
      </View>
    );
  }

  function handleAddToCart() {
    setQuantity(menuItem!.id, qty);
    navigation.goBack();
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{menuItem.name}</Text>
      <Text style={styles.description}>{menuItem.description}</Text>

      <Text style={styles.sectionLabel}>Includes</Text>
      <Card style={{ marginBottom: 20 }}>
        {menuItem.items.map((item, i) => (
          <Text key={item} style={[styles.item, i > 0 && { marginTop: 6 }]}>
            • {item}
          </Text>
        ))}
      </Card>

      <View style={styles.pricingBox}>
        <View>
          <Text style={styles.pricingLabel}>Price per pack</Text>
          <Text style={styles.pricingValue}>₹{menuItem.price}</Text>
        </View>
        <View style={styles.stepper}>
          <Pressable
            style={styles.stepperBtn}
            onPress={() => setQty((q) => Math.max(1, q - 1))}
          >
            <Minus size={16} color={colors.text} />
          </Pressable>
          <Text style={styles.stepperQty}>{qty}</Text>
          <Pressable style={styles.stepperBtn} onPress={() => setQty((q) => q + 1)}>
            <Plus size={16} color={colors.text} />
          </Pressable>
        </View>
      </View>

      <PrimaryButton style={{ marginTop: 28 }} onPress={handleAddToCart}>
        Add {qty} to cart — ₹{menuItem.price * qty}
      </PrimaryButton>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 56, backgroundColor: colors.bg },
  title: { fontSize: 24, fontFamily: fonts.serif, color: colors.text },
  description: { fontSize: 14, fontFamily: fonts.sans, color: colors.textMuted, marginTop: 8, marginBottom: 20 },
  sectionLabel: { fontSize: 12.5, fontFamily: fonts.sansSemiBold, color: colors.textMuted, marginBottom: 8 },
  item: { fontSize: 14, fontFamily: fonts.sans, color: colors.text },
  pricingBox: {
    backgroundColor: colors.panel,
    borderRadius: radii.lg,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pricingLabel: { fontSize: 11.5, fontFamily: fonts.sansSemiBold, color: colors.textMuted, textTransform: "uppercase" },
  pricingValue: { fontSize: 22, fontFamily: fonts.serif, color: colors.accent, marginTop: 2 },
  stepper: { flexDirection: "row", alignItems: "center", gap: 14 },
  stepperBtn: {
    width: 34, height: 34, borderRadius: radii.md, backgroundColor: "#fff",
    borderWidth: 1.5, borderColor: colors.border, alignItems: "center", justifyContent: "center",
  },
  stepperQty: { fontSize: 17, fontFamily: fonts.mono, color: colors.text, minWidth: 20, textAlign: "center" },
});
