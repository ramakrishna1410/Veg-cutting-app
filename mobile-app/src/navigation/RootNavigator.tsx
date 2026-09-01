import React from "react";
import { View, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "@/context/AuthContext";
import { useAddresses } from "@/context/AddressContext";
import PhoneLoginScreen from "@/screens/auth/PhoneLoginScreen";
import OtpVerifyScreen from "@/screens/auth/OtpVerifyScreen";
import CompleteProfileScreen from "@/screens/auth/CompleteProfileScreen";
import AddressCaptureScreen from "@/screens/onboarding/AddressCaptureScreen";
import MainTabs from "@/navigation/MainTabs";
import CategoryDetailScreen from "@/screens/main/CategoryDetailScreen";
import SlotPickerScreen from "@/screens/main/SlotPickerScreen";
import CheckoutScreen from "@/screens/main/CheckoutScreen";
import { colors } from "@/lib/theme";
import {
  AuthStackParamList,
  OnboardingStackParamList,
  RootStackParamList,
} from "@/navigation/types";

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const OnboardingStack = createNativeStackNavigator<OnboardingStackParamList>();
const RootStack = createNativeStackNavigator<RootStackParamList & { Main: undefined }>();

function LoadingScreen() {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator size="large" color={colors.accent} />
    </View>
  );
}

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="PhoneLogin" component={PhoneLoginScreen} />
      <AuthStack.Screen name="OtpVerify" component={OtpVerifyScreen} />
      <AuthStack.Screen name="CompleteProfile" component={CompleteProfileScreen} />
    </AuthStack.Navigator>
  );
}

function OnboardingNavigator() {
  return (
    <OnboardingStack.Navigator screenOptions={{ headerShown: false }}>
      <OnboardingStack.Screen name="AddressCapture" component={AddressCaptureScreen} />
    </OnboardingStack.Navigator>
  );
}

function MainNavigator() {
  return (
    <RootStack.Navigator>
      <RootStack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
      <RootStack.Screen
        name="CategoryDetail"
        component={CategoryDetailScreen}
        options={{ title: "" }}
      />
      <RootStack.Screen
        name="SlotPicker"
        component={SlotPickerScreen}
        options={{ title: "Delivery slot" }}
      />
      <RootStack.Screen name="Checkout" component={CheckoutScreen} options={{ title: "Checkout" }} />
    </RootStack.Navigator>
  );
}

export default function RootNavigator() {
  const { firebaseUser, appUser, loading } = useAuth();

  if (loading) {
    return (
      <NavigationContainer>
        <LoadingScreen />
      </NavigationContainer>
    );
  }

  if (!firebaseUser || !appUser) {
    return (
      <NavigationContainer>
        <AuthNavigator />
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer>
      <AddressGate />
    </NavigationContainer>
  );
}

/** Requires at least one in-service-area address before entering the main app. */
function AddressGate() {
  const { addresses, loading, primaryAddress } = useAddresses();

  if (loading) return <LoadingScreen />;
  if (!primaryAddress || addresses.length === 0) return <OnboardingNavigator />;

  return <MainNavigator />;
}
