import React from "react";
import { View, Text, FlatList, Pressable, StyleSheet } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { useCategories } from "@/context/CategoriesContext";
import { VegCategoryDoc } from "@/lib/domain";
import BookingWindowBanner from "@/components/BookingWindowBanner";
import { RootStackParamList } from "@/navigation/types";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const { categories, loading } = useCategories();
  const navigation = useNavigation<Nav>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose your veggie mix</Text>
      <BookingWindowBanner />
      {loading && <Text>Loading categories...</Text>}
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CategoryCard
            category={item}
            onPress={() =>
              navigation.navigate("CategoryDetail", { categoryId: item.id })
            }
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      />
    </View>
  );
}

function CategoryCard({
  category,
  onPress,
}: {
  category: VegCategoryDoc;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <Text style={styles.cardTitle}>{category.name}</Text>
      <Text style={styles.cardDesc}>{category.description}</Text>
      <Text style={styles.cardPrice}>
        From ₹{category.priceWeekly}/week · ₹{category.priceMonthly}/month
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 56 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 12 },
  card: {
    backgroundColor: "#F1F8E9",
    borderRadius: 12,
    padding: 16,
  },
  cardTitle: { fontSize: 17, fontWeight: "700", color: "#33691E" },
  cardDesc: { fontSize: 13, color: "#555", marginTop: 4 },
  cardPrice: { fontSize: 13, color: "#2E7D32", marginTop: 8, fontWeight: "600" },
});
