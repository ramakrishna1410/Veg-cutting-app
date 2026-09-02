import React, { useEffect } from "react";
import { View, Text, FlatList, Pressable, StyleSheet } from "react-native";
import { Bell } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNotifications, AppNotification } from "@/context/NotificationsContext";
import { colors, fonts, radii } from "@/lib/theme";
import { RootStackParamList } from "@/navigation/types";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function NotificationsScreen() {
  const { notifications, markAllRead } = useNotifications();
  const navigation = useNavigation<Nav>();

  useEffect(() => {
    markAllRead();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notifications</Text>
      {notifications.length === 0 && (
        <Text style={styles.empty}>Nothing yet — updates on your orders will show up here.</Text>
      )}
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <NotificationRow
            item={item}
            onPress={() => navigation.navigate("OrderTracking", { orderId: item.orderId })}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
      />
    </View>
  );
}

function NotificationRow({ item, onPress }: { item: AppNotification; onPress: () => void }) {
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <View style={styles.icon}>
        <Bell size={15} color={colors.accent} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowTitle}>{item.title}</Text>
        <Text style={styles.rowBody}>{item.body}</Text>
        <Text style={styles.rowTime}>{new Date(item.createdAt).toLocaleString("en-IN")}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 56, backgroundColor: colors.bg },
  title: { fontSize: 22, fontFamily: fonts.serif, color: colors.text, marginBottom: 16 },
  empty: { color: colors.textMuted, fontFamily: fonts.sans },
  row: {
    flexDirection: "row", alignItems: "flex-start", gap: 12,
    backgroundColor: colors.panel, borderRadius: radii.lg, padding: 14,
  },
  icon: {
    width: 32, height: 32, borderRadius: radii.md, backgroundColor: colors.panel2,
    alignItems: "center", justifyContent: "center",
  },
  rowTitle: { fontFamily: fonts.sansBold, fontSize: 14, color: colors.text },
  rowBody: { fontFamily: fonts.sans, fontSize: 13, color: colors.textMuted, marginTop: 2 },
  rowTime: { fontFamily: fonts.mono, fontSize: 10.5, color: colors.textMuted, marginTop: 6 },
});
