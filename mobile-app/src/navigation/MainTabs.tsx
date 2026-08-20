import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Home, ListOrdered, User, Users } from "lucide-react-native";
import HomeScreen from "@/screens/main/HomeScreen";
import SubscriptionsScreen from "@/screens/main/SubscriptionsScreen";
import OrdersScreen from "@/screens/main/OrdersScreen";
import ProfileScreen from "@/screens/main/ProfileScreen";
import { MainTabParamList } from "@/navigation/types";
import { colors, fonts } from "@/lib/theme";

const Tab = createBottomTabNavigator<MainTabParamList>();

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
      <Tab.Screen name="Subscriptions" component={SubscriptionsScreen} options={{ tabBarIcon: ({ color, size }) => <Users color={color} size={size} /> }} />
      <Tab.Screen name="Orders" component={OrdersScreen} options={{ tabBarIcon: ({ color, size }) => <ListOrdered color={color} size={size} /> }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarIcon: ({ color, size }) => <User color={color} size={size} /> }} />
    </Tab.Navigator>
  );
}
