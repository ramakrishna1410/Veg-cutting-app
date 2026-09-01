import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Home, ListOrdered, ShoppingCart, User } from "lucide-react-native";
import HomeScreen from "@/screens/main/HomeScreen";
import CartScreen from "@/screens/main/CartScreen";
import OrdersScreen from "@/screens/main/OrdersScreen";
import ProfileScreen from "@/screens/main/ProfileScreen";
import { useCart } from "@/context/CartContext";
import { MainTabParamList } from "@/navigation/types";
import { colors, fonts } from "@/lib/theme";

const Tab = createBottomTabNavigator<MainTabParamList>();

function CartTabIcon({ color, size }: { color: string; size: number }) {
  const { itemCount } = useCart();
  return (
    <View>
      <ShoppingCart color={color} size={size} />
      {itemCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{itemCount > 9 ? "9+" : itemCount}</Text>
        </View>
      )}
    </View>
  );
}

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontFamily: fonts.sansSemiBold, fontSize: 11 },
        tabBarStyle: { borderTopColor: colors.border },
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarIcon: ({ color, size }) => <Home color={color} size={size} /> }} />
      <Tab.Screen name="Cart" component={CartScreen} options={{ tabBarIcon: CartTabIcon }} />
      <Tab.Screen name="Orders" component={OrdersScreen} options={{ tabBarIcon: ({ color, size }) => <ListOrdered color={color} size={size} /> }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarIcon: ({ color, size }) => <User color={color} size={size} /> }} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: "absolute",
    top: -4,
    right: -8,
    minWidth: 15,
    height: 15,
    borderRadius: 8,
    backgroundColor: colors.warm,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 2,
  },
  badgeText: { color: "#fff", fontSize: 9, fontFamily: fonts.sansBold },
});
