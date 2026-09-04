// Shared Firestore document shapes, used by mobile-app, admin-dashboard, and functions.
// Keep this file framework-agnostic (no React/Expo/Firebase-Admin imports).

export type UserRole = "customer" | "admin" | "delivery";

export interface UserDoc {
  uid: string;
  role: UserRole;
  name: string;
  phone: string;
  email?: string;
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

// Top-level grouping a customer browses first, e.g. "Poriyal", "Kootu",
// "Rice Veggies", "Miscellaneous". Admin-managed.
export interface CategoryDoc {
  id: string;
  name: string;
  sortOrder: number;
  active: boolean;
  imageUrl?: string;
}

// A single orderable veg pack within a category, e.g. "Biryani Veggies"
// under "Rice Veggies". Was called VegCategoryDoc before categories existed.
export interface MenuItemDoc {
  id: string;
  categoryId: string;
  name: string; // "Biryani Veggies"
  description: string;
  imageUrl: string;
  items: string[]; // e.g. ["Onion", "Carrot", "Beans", "Potato"]
  price: number; // INR, per pack, ad-hoc
  active: boolean;
}

export type DeliverySlot = "morning" | "evening";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export type PaymentMethod = "cod" | "online";
export type PaymentStatus = "cod_pending" | "cod_collected" | "online_paid";

export interface OrderItem {
  menuItemId: string;
  menuItemName: string; // snapshotted at order time, in case the menu item is later renamed
  quantity: number;
  unitPrice: number; // snapshotted at order time, in case the price is later changed
}

export interface OrderDoc {
  id: string;
  uid: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  slot: DeliverySlot;
  deliveryDate: number; // epoch millis, date-only (midnight IST)
  addressId: string;
  status: OrderStatus;
  assignedDeliveryUid: string | null;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
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

export interface DeliveryFeeConfig {
  freeDeliveryThreshold: number; // orders at or above this subtotal ship free
  flatDeliveryFee: number; // charged when subtotal is below the threshold
}
