import React from "react";
import { View, Text, FlatList, Pressable, StyleSheet } from "react-native";
import { Leaf, Minus, Plus } from "lucide-react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useCategories } from "@/context/CategoriesContext";
import { useMenuItems } from "@/context/MenuItemsContext";
import { useCart } from "@/context/CartContext";
import { MenuItemDoc } from "@/lib/domain";
import { RootStackParamList } from "@/navigation/types";
import { colors, fonts, radii, shadow, tileColors } from "@/lib/theme";

type Props = NativeStackScreenProps<RootStackParamList, "MenuList">;

export default function MenuListScreen({ route, navigation }: Props) {
  const { getCategory } = useCategories();
  const { getMenuItemsByCategory, loading } = useMenuItems();
  const category = getCategory(route.params.categoryId);
  const items = getMenuItemsByCategory(route.params.categoryId);

  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>{category?.name ?? "Menu"}</Text>
      <Text style={styles.title}>Pick a pack</Text>
      {loading && <Text style={styles.loading}>Loading...</Text>}
      {!loading && items.length === 0 && (
        <Text style={styles.empty}>No items in this category yet.</Text>
      )}
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <MenuItemCard
            item={item}
            colorIndex={index}
            onPress={() => navigation.navigate("MenuItemDetail", { menuItemId: item.id })}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        contentContainerStyle={{ paddingBottom: 24 }}
      />
    </View>
  );
}

function MenuItemCard({
  item,
  colorIndex,
  onPress,
}: {
  item: MenuItemDoc;
  colorIndex: number;
  onPress: () => void;
}) {
  const { lines, setQuantity } = useCart();
  const line = lines.find((l) => l.menuItemId === item.id);
  const palette = tileColors[colorIndex % tileColors.length];

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={[styles.thumb, { backgroundColor: palette.bg }]}>
        <Leaf size={26} color={palette.fg} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
        <View style={styles.bottomRow}>
          <Text style={styles.cardPrice}>₹{item.price}</Text>
          {line ? (
            <View style={styles.stepper}>
              <Pressable
                style={styles.stepperBtn}
                onPress={() => setQuantity(item.id, line.quantity - 1)}
                hitSlop={6}
              >
                <Minus size={13} color={colors.accent} />
              </Pressable>
              <Text style={styles.stepperQty}>{line.quantity}</Text>
              <Pressable
                style={styles.stepperBtn}
                onPress={() => setQuantity(item.id, line.quantity + 1)}
                hitSlop={6}
              >
                <Plus size={13} color={colors.accent} />
              </Pressable>
            </View>
          ) : (
            <Pressable style={styles.addBtn} onPress={() => setQuantity(item.id, 1)}>
              <Text style={styles.addBtnText}>ADD</Text>
            </Pressable>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 56, backgroundColor: colors.bg },
  eyebrow: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 1.2, textTransform: "uppercase", color: colors.textMuted, marginBottom: 6 },
  title: { fontSize: 24, fontFamily: fonts.serif, color: colors.text, marginBottom: 14 },
  loading: { fontFamily: fonts.sans, color: colors.textMuted },
  empty: { fontFamily: fonts.sans, color: colors.textMuted },
  card: {
    backgroundColor: "#fff",
    borderRadius: radii.xl,
    padding: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },
  thumb: {
    width: 64, height: 64, borderRadius: radii.lg,
    alignItems: "center", justifyContent: "center",
  },
  cardTitle: { fontSize: 15.5, fontFamily: fonts.serifMedium, color: colors.text },
  cardDesc: { fontSize: 12.5, fontFamily: fonts.sans, color: colors.textMuted, marginTop: 3 },
  bottomRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 10 },
  cardPrice: { fontSize: 15, fontFamily: fonts.sansBold, color: colors.text },
  addBtn: {
    borderWidth: 1.5, borderColor: colors.accent, borderRadius: radii.pill,
    paddingHorizontal: 18, paddingVertical: 6, backgroundColor: colors.panel,
  },
  addBtnText: { fontSize: 12.5, fontFamily: fonts.sansBold, color: colors.accent, letterSpacing: 0.5 },
  stepper: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: colors.accent, borderRadius: radii.pill, paddingHorizontal: 8, paddingVertical: 5,
  },
  stepperBtn: {
    width: 20, height: 20, borderRadius: 10, backgroundColor: "#fff",
    alignItems: "center", justifyContent: "center",
  },
  stepperQty: { fontSize: 13, fontFamily: fonts.sansBold, color: "#fff", minWidth: 14, textAlign: "center" },
});
