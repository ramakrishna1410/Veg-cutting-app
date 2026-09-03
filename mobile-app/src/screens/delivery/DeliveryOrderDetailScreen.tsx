import React, { useEffect, useRef, useState } from "react";
import { View, Text, ScrollView, StyleSheet, Linking, ActivityIndicator } from "react-native";
import { MapPin, Navigation, Radio } from "lucide-react-native";
import { MotiView } from "moti";
import * as Location from "expo-location";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { db } from "@/lib/firebase";
import { AddressDoc, OrderDoc, OrderStatus } from "@/lib/domain";
import { colors, fonts } from "@/lib/theme";
import { Card, Chip, PrimaryButton, SecondaryButton } from "@/components/ui";
import { DeliveryStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<DeliveryStackParamList, "DeliveryOrderDetail">;

export default function DeliveryOrderDetailScreen({ route }: Props) {
  const { orderId } = route.params;
  const [order, setOrder] = useState<OrderDoc | null>(null);
  const [address, setAddress] = useState<AddressDoc | null>(null);
  const [updating, setUpdating] = useState(false);
  const [sharingLocation, setSharingLocation] = useState(false);
  const watchRef = useRef<Location.LocationSubscription | null>(null);

  useEffect(() => {
    return onSnapshot(doc(db, "orders", orderId), (snap) => {
      setOrder(snap.exists() ? (snap.data() as OrderDoc) : null);
    });
  }, [orderId]);

  // Share live location with the customer while this order is out for
  // delivery — only while this screen is open and the app is foregrounded.
  // This is not true background tracking (that needs a separate Android
  // background-location permission flow); it stops the moment the delivery
  // partner leaves this screen or the order is marked delivered.
  useEffect(() => {
    if (order?.status !== "out_for_delivery") {
      watchRef.current?.remove();
      watchRef.current = null;
      setSharingLocation(false);
      return;
    }
    let cancelled = false;
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (cancelled || status !== "granted") return;
      watchRef.current = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, timeInterval: 8000, distanceInterval: 15 },
        (loc) => {
          setSharingLocation(true);
          updateDoc(doc(db, "orders", orderId), {
            liveLocation: {
              lat: loc.coords.latitude,
              lng: loc.coords.longitude,
              heading: loc.coords.heading ?? null,
              updatedAt: Date.now(),
            },
          }).catch(() => {});
        }
      );
    })();
    return () => {
      cancelled = true;
      watchRef.current?.remove();
      watchRef.current = null;
    };
  }, [order?.status, orderId]);

  useEffect(() => {
    if (!order) return;
    getDoc(doc(db, "addresses", order.addressId)).then((snap) => {
      setAddress(snap.exists() ? (snap.data() as AddressDoc) : null);
    });
  }, [order?.addressId]);

  async function updateStatus(status: OrderStatus) {
    setUpdating(true);
    try {
      await updateDoc(doc(db, "orders", orderId), {
        status,
        ...(status === "delivered" ? { liveLocation: null } : {}),
      });
    } finally {
      setUpdating(false);
    }
  }

  function openInMaps() {
    if (!address) return;
    Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${address.lat},${address.lng}`);
  }

  if (!order) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Order details</Text>
        <Chip status={order.status} />
      </View>

      <Card style={{ marginBottom: 16 }}>
        <Text style={styles.sectionLabel}>Items</Text>
        {order.items.map((item) => (
          <View key={item.menuItemId} style={styles.itemRow}>
            <Text style={styles.itemName}>
              {item.menuItemName} ×{item.quantity}
            </Text>
            <Text style={styles.itemPrice}>₹{item.unitPrice * item.quantity}</Text>
          </View>
        ))}
        <View style={styles.divider} />
        <View style={styles.itemRow}>
          <Text style={styles.totalLabel}>Total (collect via COD)</Text>
          <Text style={styles.totalValue}>₹{order.total}</Text>
        </View>
        <Text style={styles.cardSub}>{order.slot === "morning" ? "5–8 AM" : "5–8 PM"} slot</Text>
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <Text style={styles.sectionLabel}>Delivery address</Text>
        {address ? (
          <>
            <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 8, marginTop: 4 }}>
              <MapPin size={14} color={colors.textMuted} style={{ marginTop: 2 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.addressLabel}>{address.label}</Text>
                <Text style={styles.addressValue}>{address.formattedAddress}</Text>
              </View>
            </View>
            <SecondaryButton
              onPress={openInMaps}
              icon={<Navigation size={14} color={colors.accent} />}
              style={{ marginTop: 12, alignSelf: "flex-start" }}
            >
              Open in Maps
            </SecondaryButton>
          </>
        ) : (
          <Text style={styles.cardSub}>Loading address...</Text>
        )}
      </Card>

      {order.status === "out_for_delivery" && (
        <View style={styles.liveRow}>
          <MotiView
            animate={{ opacity: sharingLocation ? [1, 0.35, 1] : 1 }}
            transition={{ type: "timing", duration: 1200, loop: sharingLocation, repeatReverse: false }}
          >
            <Radio size={13} color={sharingLocation ? colors.leaf : colors.textMuted} />
          </MotiView>
          <Text style={[styles.liveText, sharingLocation && { color: colors.leaf }]}>
            {sharingLocation ? "Sharing live location with customer" : "Getting your location..."}
          </Text>
        </View>
      )}

      {order.status === "confirmed" && (
        <PrimaryButton onPress={() => updateStatus("out_for_delivery")} disabled={updating}>
          {updating ? "Please wait..." : "Start delivery"}
        </PrimaryButton>
      )}
      {order.status === "out_for_delivery" && (
        <PrimaryButton onPress={() => updateStatus("delivered")} disabled={updating}>
          {updating ? "Please wait..." : "Mark delivered"}
        </PrimaryButton>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  title: { fontSize: 20, fontFamily: fonts.serif, color: colors.text },
  sectionLabel: {
    fontSize: 12.5, fontFamily: fonts.sansSemiBold, color: colors.textMuted,
    textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8,
  },
  itemRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6 },
  itemName: { fontFamily: fonts.sans, fontSize: 14, color: colors.text, flex: 1, marginRight: 8 },
  itemPrice: { fontFamily: fonts.sansSemiBold, fontSize: 14, color: colors.text },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 8 },
  totalLabel: { fontFamily: fonts.sansBold, fontSize: 14, color: colors.text },
  totalValue: { fontFamily: fonts.sansBold, fontSize: 14, color: colors.accent },
  cardSub: { fontSize: 12.5, fontFamily: fonts.sans, color: colors.textMuted, marginTop: 8 },
  addressLabel: { fontFamily: fonts.sansBold, fontSize: 13, color: colors.text },
  addressValue: { fontSize: 13, fontFamily: fonts.sans, color: colors.text, marginTop: 2 },
  liveRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 12, alignSelf: "center" },
  liveText: { fontSize: 12, fontFamily: fonts.sansSemiBold, color: colors.textMuted },
});
