import React from "react";
import { View, Text, FlatList, Pressable, StyleSheet } from "react-native";
import { ChevronRight, Leaf } from "lucide-react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { useCategories } from "@/context/CategoriesContext";
import { CategoryDoc } from "@/lib/domain";
import BookingWindowBanner from "@/components/BookingWindowBanner";
import { RootStackParamList } from "@/navigation/types";
import { colors, fonts, radii } from "@/lib/theme";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const { categories, loading } = useCategories();
  const navigation = useNavigation<Nav>();

  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>Keelkattalai · 5 km delivery zone</Text>
      <Text style={styles.title}>What are you cooking?</Text>
      <BookingWindowBanner />
      {loading && <Text style={styles.loading}>Loading categories...</Text>}
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CategoryCard
            category={item}
            onPress={() => navigation.navigate("MenuList", { categoryId: item.id })}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        contentContainerStyle={{ paddingBottom: 24 }}
      />
    </View>
  );
}

function CategoryCard({ category, onPress }: { category: CategoryDoc; onPress: () => void }) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.cardIcon}>
        <Leaf size={18} color={colors.accent} />
      </View>
      <Text style={styles.cardTitle}>{category.name}</Text>
      <ChevronRight size={18} color={colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 56, backgroundColor: colors.bg },
  eyebrow: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 1.2, textTransform: "uppercase", color: colors.textMuted, marginBottom: 6 },
  title: { fontSize: 24, fontFamily: fonts.serif, color: colors.text, marginBottom: 14 },
  loading: { fontFamily: fonts.sans, color: colors.textMuted },
  card: {
    backgroundColor: colors.panel,
    borderRadius: radii.xl,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  cardIcon: {
    width: 42, height: 42, borderRadius: radii.md, backgroundColor: colors.panel2,
    alignItems: "center", justifyContent: "center",
  },
  cardTitle: { fontSize: 17, fontFamily: fonts.serifMedium, color: colors.text, flex: 1 },
});
