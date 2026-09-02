import React from "react";
import { View, Text, FlatList, Pressable, StyleSheet } from "react-native";
import { Bell, Leaf, MapPin, Salad, Soup, Sparkles } from "lucide-react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { useCategories } from "@/context/CategoriesContext";
import { useAddresses } from "@/context/AddressContext";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/context/NotificationsContext";
import { CategoryDoc } from "@/lib/domain";
import BookingWindowBanner from "@/components/BookingWindowBanner";
import { RootStackParamList } from "@/navigation/types";
import { colors, fonts, radii, shadow, tileColors } from "@/lib/theme";

type Nav = NativeStackNavigationProp<RootStackParamList>;

const CATEGORY_ICONS = [Leaf, Salad, Soup, Sparkles];

export default function HomeScreen() {
  const { categories, loading } = useCategories();
  const { primaryAddress } = useAddresses();
  const { appUser } = useAuth();
  const { unreadCount } = useNotifications();
  const navigation = useNavigation<Nav>();

  return (
    <View style={styles.container}>
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ gap: 12 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24, paddingTop: 12 }}
        ListHeaderComponent={
          <View style={{ marginBottom: 18 }}>
            <View style={styles.topRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.greeting}>
                  Hi{appUser?.name ? `, ${appUser.name.split(" ")[0]}` : ""} 👋
                </Text>
                <Pressable style={styles.addressChip}>
                  <MapPin size={12} color={colors.accent} />
                  <Text style={styles.addressText} numberOfLines={1}>
                    {primaryAddress?.label ?? "Set your address"} · Keelkattalai
                  </Text>
                </Pressable>
              </View>
              <Pressable
                style={styles.bellButton}
                onPress={() => navigation.navigate("Notifications")}
                hitSlop={8}
              >
                <Bell size={19} color={colors.text} />
                {unreadCount > 0 && (
                  <View style={styles.bellBadge}>
                    <Text style={styles.bellBadgeText}>{unreadCount > 9 ? "9+" : unreadCount}</Text>
                  </View>
                )}
              </Pressable>
            </View>

            <View style={styles.banner}>
              <View style={{ flex: 1 }}>
                <Text style={styles.bannerEyebrow}>FRESH · PRE-CUT · DAILY</Text>
                <Text style={styles.bannerTitle}>Veggies cut & ready{"\n"}in 2 daily slots</Text>
              </View>
              <View style={styles.bannerIcon}>
                <Leaf size={28} color="#fff" />
              </View>
            </View>

            <BookingWindowBanner />
            <Text style={styles.sectionTitle}>Shop by category</Text>
            {loading && <Text style={styles.loading}>Loading categories...</Text>}
          </View>
        }
        renderItem={({ item, index }) => (
          <CategoryCard
            category={item}
            colorIndex={index}
            onPress={() => navigation.navigate("MenuList", { categoryId: item.id })}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      />
    </View>
  );
}

function CategoryCard({
  category,
  colorIndex,
  onPress,
}: {
  category: CategoryDoc;
  colorIndex: number;
  onPress: () => void;
}) {
  const palette = tileColors[colorIndex % tileColors.length];
  const Icon = CATEGORY_ICONS[colorIndex % CATEGORY_ICONS.length];
  return (
    <Pressable style={[styles.card, { backgroundColor: palette.bg }]} onPress={onPress}>
      <View style={[styles.cardIcon, { backgroundColor: "#fff" }]}>
        <Icon size={22} color={palette.fg} />
      </View>
      <Text style={[styles.cardTitle, { color: palette.fg }]}>{category.name}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 56, backgroundColor: colors.bg },
  topRow: { flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 16 },
  greeting: { fontSize: 21, fontFamily: fonts.serif, color: colors.text },
  addressChip: {
    flexDirection: "row", alignItems: "center", gap: 5, marginTop: 6, alignSelf: "flex-start",
    backgroundColor: colors.panel, paddingHorizontal: 10, paddingVertical: 5, borderRadius: radii.pill,
  },
  addressText: { fontSize: 11.5, fontFamily: fonts.sansSemiBold, color: colors.text, maxWidth: 220 },
  bellButton: {
    width: 40, height: 40, borderRadius: radii.md, backgroundColor: colors.panel,
    alignItems: "center", justifyContent: "center",
  },
  bellBadge: {
    position: "absolute", top: -3, right: -3, minWidth: 16, height: 16, borderRadius: 8,
    backgroundColor: colors.warm, alignItems: "center", justifyContent: "center", paddingHorizontal: 3,
  },
  bellBadgeText: { color: "#fff", fontSize: 9, fontFamily: fonts.sansBold },
  banner: {
    flexDirection: "row", alignItems: "center", backgroundColor: colors.accent,
    borderRadius: radii.xl, padding: 18, marginBottom: 16, ...shadow.card,
  },
  bannerEyebrow: { fontFamily: fonts.mono, fontSize: 9.5, letterSpacing: 1, color: "#DCEBDD" },
  bannerTitle: { fontFamily: fonts.serif, fontSize: 17, color: "#fff", marginTop: 6, lineHeight: 22 },
  bannerIcon: {
    width: 52, height: 52, borderRadius: radii.lg, backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center", justifyContent: "center", marginLeft: 12,
  },
  sectionTitle: { fontSize: 16, fontFamily: fonts.sansBold, color: colors.text, marginTop: 18, marginBottom: 4 },
  loading: { fontFamily: fonts.sans, color: colors.textMuted, marginTop: 8 },
  card: {
    flex: 1, borderRadius: radii.xl, padding: 16, minHeight: 108, justifyContent: "space-between",
    ...shadow.card,
  },
  cardIcon: {
    width: 40, height: 40, borderRadius: radii.md, alignItems: "center", justifyContent: "center",
  },
  cardTitle: { fontSize: 14.5, fontFamily: fonts.sansBold, marginTop: 10 },
});
