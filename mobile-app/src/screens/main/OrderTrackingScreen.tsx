import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { Bike, MapPin } from "lucide-react-native";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { db } from "@/lib/firebase";
import { AddressDoc, OrderDoc } from "@/lib/domain";
import { colors, fonts, radii } from "@/lib/theme";
import { Chip } from "@/components/ui";
import StatusTimeline from "@/components/StatusTimeline";
import { RootStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "OrderTracking">;

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function OrderTrackingScreen({ route }: Props) {
  const { orderId } = route.params;
  const [order, setOrder] = useState<OrderDoc | null>(null);
  const [address, setAddress] = useState<AddressDoc | null>(null);
  const mapRef = useRef<MapView | null>(null);

  useEffect(() => {
    return onSnapshot(doc(db, "orders", orderId), (snap) => {
      setOrder(snap.exists() ? (snap.data() as OrderDoc) : null);
    });
  }, [orderId]);

  useEffect(() => {
    if (!order) return;
    getDoc(doc(db, "addresses", order.addressId)).then((snap) => {
      setAddress(snap.exists() ? (snap.data() as AddressDoc) : null);
    });
  }, [order?.addressId]);

  useEffect(() => {
    if (!order?.liveLocation || !address || !mapRef.current) return;
    mapRef.current.fitToCoordinates(
      [
        { latitude: order.liveLocation.lat, longitude: order.liveLocation.lng },
        { latitude: address.lat, longitude: address.lng },
      ],
      { edgePadding: { top: 80, right: 80, bottom: 220, left: 80 }, animated: true }
    );
  }, [order?.liveLocation?.lat, order?.liveLocation?.lng, address?.lat, address?.lng]);

  if (!order || !address) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  const live = order.liveLocation;
  const distanceKm = live ? haversineKm(live.lat, live.lng, address.lat, address.lng) : null;

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: address.lat,
          longitude: address.lng,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
      >
        <Marker coordinate={{ latitude: address.lat, longitude: address.lng }} title="Delivery address">
          <View style={styles.destPin}>
            <MapPin size={16} color="#fff" />
          </View>
        </Marker>
        {live && (
          <Marker
            coordinate={{ latitude: live.lat, longitude: live.lng }}
            title="Delivery partner"
            rotation={live.heading ?? 0}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View style={styles.riderPin}>
              <Bike size={16} color="#fff" />
            </View>
          </Marker>
        )}
      </MapView>

      <View style={styles.sheet}>
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>
            {order.items.map((i) => `${i.menuItemName} ×${i.quantity}`).join(", ")}
          </Text>
          <Chip status={order.status} />
        </View>
        <StatusTimeline status={order.status} />
        {live ? (
          <Text style={styles.sheetSub}>
            Your delivery partner is on the way
            {distanceKm !== null ? ` · ${distanceKm.toFixed(1)} km away` : ""}
          </Text>
        ) : order.status === "out_for_delivery" ? (
          <Text style={styles.sheetSub}>Waiting for your delivery partner's location...</Text>
        ) : (
          <Text style={styles.sheetSub}>Tracking will start once your order is out for delivery.</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg },
  destPin: {
    width: 30, height: 30, borderRadius: 15, backgroundColor: colors.danger,
    alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#fff",
  },
  riderPin: {
    width: 34, height: 34, borderRadius: 17, backgroundColor: colors.accent,
    alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#fff",
  },
  sheet: {
    position: "absolute", left: 0, right: 0, bottom: 0,
    backgroundColor: "#fff", borderTopLeftRadius: radii.xl, borderTopRightRadius: radii.xl,
    padding: 20, paddingBottom: 32,
    shadowColor: "#000", shadowOpacity: 0.12, shadowRadius: 16, shadowOffset: { width: 0, height: -4 },
    elevation: 8,
  },
  sheetHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 8 },
  sheetTitle: { flex: 1, fontSize: 15, fontFamily: fonts.serifMedium, color: colors.text },
  sheetSub: { fontSize: 13, fontFamily: fonts.sans, color: colors.textMuted, marginTop: 8 },
});
