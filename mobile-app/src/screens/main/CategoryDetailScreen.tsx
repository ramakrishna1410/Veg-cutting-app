import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useCategories } from "@/context/CategoriesContext";
import { RootStackParamList } from "@/navigation/types";
import { colors, fonts, radii } from "@/lib/theme";
import { PrimaryButton, Card } from "@/components/ui";

type Props = NativeStackScreenProps<RootStackParamList, "CategoryDetail">;

export default function CategoryDetailScreen({ route, navigation }: Props) {
  const { getCategory } = useCategories();
  const category = getCategory(route.params.categoryId);

  if (!category) {
    return (
      <View style={styles.container}>
        <Text style={{ fontFamily: fonts.sans, color: colors.text }}>Category not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{category.name}</Text>
      <Text style={styles.description}>{category.description}</Text>

      <Text style={styles.sectionLabel}>Includes</Text>
      <Card style={{ marginBottom: 20 }}>
        {category.items.map((item, i) => (
          <Text key={item} style={[styles.item, i > 0 && { marginTop: 6 }]}>
            • {item}
          </Text>
        ))}
      </Card>

      <View style={styles.pricingBox}>
        <View>
          <Text style={styles.pricingLabel}>Weekly</Text>
          <Text style={styles.pricingValue}>₹{category.priceWeekly}</Text>
        </View>
        <View style={styles.pricingDivider} />
        <View>
          <Text style={styles.pricingLabel}>Monthly</Text>
          <Text style={styles.pricingValue}>₹{category.priceMonthly}</Text>
        </View>
      </View>

      <PrimaryButton
        style={{ marginTop: 28 }}
        onPress={() => navigation.navigate("SlotPlanPicker", { categoryId: category.id })}
      >
        Choose slot &amp; plan
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
  },
  pricingLabel: { fontSize: 11.5, fontFamily: fonts.sansSemiBold, color: colors.textMuted, textTransform: "uppercase" },
  pricingValue: { fontSize: 20, fontFamily: fonts.serif, color: colors.accent, marginTop: 2 },
  pricingDivider: { width: 1, height: 32, backgroundColor: colors.border, marginHorizontal: 24 },
});
