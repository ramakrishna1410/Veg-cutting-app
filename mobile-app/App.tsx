import React from "react";
import { View, ActivityIndicator } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useFonts as useInter, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from "@expo-google-fonts/inter";
import { useFonts as useNewsreader, Newsreader_600SemiBold, Newsreader_700Bold } from "@expo-google-fonts/newsreader";
import { useFonts as useMono, IBMPlexMono_600SemiBold } from "@expo-google-fonts/ibm-plex-mono";
import { AuthProvider } from "@/context/AuthContext";
import { AddressProvider } from "@/context/AddressContext";
import { CategoriesProvider } from "@/context/CategoriesContext";
import { CartProvider } from "@/context/CartContext";
import RootNavigator from "@/navigation/RootNavigator";
import { colors } from "@/lib/theme";

export default function App() {
  const [interLoaded] = useInter({ Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold });
  const [newsreaderLoaded] = useNewsreader({ Newsreader_600SemiBold, Newsreader_700Bold });
  const [monoLoaded] = useMono({ IBMPlexMono_600SemiBold });

  if (!interLoaded || !newsreaderLoaded || !monoLoaded) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg }}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AddressProvider>
          <CategoriesProvider>
            <CartProvider>
              <StatusBar style="dark" />
              <RootNavigator />
            </CartProvider>
          </CategoriesProvider>
        </AddressProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
