import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useCategories } from "@/context/CategoriesContext";
import { RootStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "CategoryDetail">;

export default function CategoryDetailScreen({ route, navigation }: Props) {
  const { getCategory } = useCategories();
  const category = getCategory(route.params.categoryId);

  if (!category) {
    return (
      <View style={styles.container}>
        <Text>Category not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{category.name}</Text>
      <Text style={styles.description}>{category.description}</Text>

      <Text style={styles.sectionLabel}>Includes</Text>
      {category.items.map((item) => (
        <Text key={item} style={styles.item}>
          • {item}
        </Text>
      ))}

      <View style={styles.pricingBox}>
        <Text style={styles.pricingRow}>Weekly: ₹{category.priceWeekly}</Text>
        <Text style={styles.pricingRow}>Monthly: ₹{category.priceMonthly}</Text>
      </View>

      <Pressable
        style={styles.button}
        onPress={() =>
          navigation.navigate("SlotPlanPicker", { categoryId: category.id })
        }
      >
        <Text style={styles.buttonText}>Choose slot & plan</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 56 },
  title: { fontSize: 24, fontWeight: "700", color: "#33691E" },
  description: { fontSize: 14, color: "#555", marginTop: 8, marginBottom: 20 },
  sectionLabel: { fontSize: 13, fontWeight: "600", color: "#333", marginBottom: 8 },
  item: { fontSize: 14, color: "#444", marginBottom: 4 },
  pricingBox: {
    backgroundColor: "#F1F8E9",
    borderRadius: 10,
    padding: 14,
    marginTop: 20,
  },
  pricingRow: { fontSize: 15, fontWeight: "600", color: "#2E7D32" },
  button: {
    backgroundColor: "#2E7D32",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    marginTop: 24,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
