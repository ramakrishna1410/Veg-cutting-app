import React from "react";
import { View, Text, FlatList, Pressable, StyleSheet } from "react-native";
import { ChevronRight, Leaf } from "lucide-react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useCategories } from "@/context/CategoriesContext";
import { useMenuItems } from "@/context/MenuItemsContext";
import { MenuItemDoc } from "@/lib/domain";
import { RootStackParamList } from "@/navigation/types";
import { colors, fonts, radii } from "@/lib/theme";

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
        renderItem={({ item }) => (
          <MenuItemCard
            item={item}
            onPress={() => navigation.navigate("MenuItemDetail", { menuItemId: item.id })}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        contentContainerStyle={{ paddingBottom: 24 }}
      />
    </View>
  );
}

function MenuItemCard({ item, onPress }: { item: MenuItemDoc; onPress: () => void }) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.cardIcon}>
        <Leaf size={18} color={colors.accent} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={styles.cardDesc}>{item.description}</Text>
        <Text style={styles.cardPrice}>₹{item.price} / pack</Text>
      </View>
      <ChevronRight size={18} color={colors.textMuted} />
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
    backgroundColor: colors.panel,
    borderRadius: radii.xl,
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  cardIcon: {
    width: 38, height: 38, borderRadius: radii.md, backgroundColor: colors.panel2,
    alignItems: "center", justifyContent: "center",
  },
  cardTitle: { fontSize: 16.5, fontFamily: fonts.serifMedium, color: colors.text },
  cardDesc: { fontSize: 13, fontFamily: fonts.sans, color: colors.textMuted, marginTop: 4 },
  cardPrice: { fontSize: 13, fontFamily: fonts.sansSemiBold, color: colors.accent, marginTop: 8 },
});
