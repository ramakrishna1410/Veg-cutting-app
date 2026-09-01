import * as admin from "firebase-admin";
import {
  BookingWindowsConfig,
  DEFAULT_BOOKING_WINDOWS,
  DEFAULT_DELIVERY_FEE,
  DEFAULT_SERVICE_AREA,
  DeliveryFeeConfig,
  ServiceAreaConfig,
} from "./domain";

export async function loadBookingWindows(): Promise<BookingWindowsConfig> {
  const snap = await admin.firestore().doc("config/bookingWindows").get();
  return snap.exists
    ? (snap.data() as BookingWindowsConfig)
    : DEFAULT_BOOKING_WINDOWS;
}

export async function loadServiceArea(): Promise<ServiceAreaConfig> {
  const snap = await admin.firestore().doc("config/serviceArea").get();
  return snap.exists ? (snap.data() as ServiceAreaConfig) : DEFAULT_SERVICE_AREA;
}

export async function loadDeliveryFee(): Promise<DeliveryFeeConfig> {
  const snap = await admin.firestore().doc("config/deliveryFee").get();
  return snap.exists ? (snap.data() as DeliveryFeeConfig) : DEFAULT_DELIVERY_FEE;
}
