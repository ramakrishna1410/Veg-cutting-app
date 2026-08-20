import React from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "@/context/AuthContext";
import { AddressProvider } from "@/context/AddressContext";
import { CategoriesProvider } from "@/context/CategoriesContext";
import RootNavigator from "@/navigation/RootNavigator";

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AddressProvider>
          <CategoriesProvider>
            <StatusBar style="dark" />
            <RootNavigator />
          </CategoriesProvider>
        </AddressProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
