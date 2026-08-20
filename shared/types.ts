// Shared Firestore document shapes, used by mobile-app, admin-dashboard, and functions.
// Keep this file framework-agnostic (no React/Expo/Firebase-Admin imports).

export type UserRole = "customer" | "admin" | "delivery";

export interface UserDoc {
  uid: string;
  role: UserRole;
  name: string;
  phone: string;
  createdAt: number; // epoch millis
}

export interface AddressDoc {
  id: string;
  uid: string;
  label: string; // "Home", "Work", ...
  lat: number;
  lng: number;
  formattedAddress: string;
  distanceFromHubKm: number;
  isWithinServiceArea: boolean;
  createdAt: number;
}

export interface VegCategoryDoc {
  id: string;
  name: string; // "Biryani Veggies"
  description: string;
  imageUrl: string;
  items: string[]; // e.g. ["Onion", "Carrot", "Beans", "Potato"]
  priceWeekly: number; // INR
  priceMonthly: number; // INR
  active: boolean;
}

export type DeliverySlot = "morning" | "evening";
export type SubscriptionPlan = "weekly" | "monthly";
export type SubscriptionStatus = "active" | "paused" | "cancelled";

export interface SubscriptionDoc {
  id: string;
  uid: string;
  categoryId: string;
  plan: SubscriptionPlan;
  slot: DeliverySlot;
  addressId: string;
  startDate: number; // epoch millis, first delivery date
  status: SubscriptionStatus;
  nextDeliveryDate: number; // epoch millis
  createdAt: number;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export interface OrderDoc {
  id: string;
  subId: string | null; // null for a one-off order
  uid: string;
  categoryId: string;
  slot: DeliverySlot;
  deliveryDate: number; // epoch millis, date-only (midnight IST)
  addressId: string;
  status: OrderStatus;
  assignedDeliveryUid: string | null;
  paymentStatus: "cod_pending" | "cod_collected" | "manual"; // reserved for future gateway integration
  createdAt: number;
}

export interface BookingWindowsConfig {
  morningStartHour: number; // 5
  morningEndHour: number; // 8
  eveningStartHour: number; // 17
  eveningEndHour: number; // 20
}

export interface ServiceAreaConfig {
  hubLat: number;
  hubLng: number;
  radiusKm: number;
}
