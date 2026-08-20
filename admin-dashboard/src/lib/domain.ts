// Mirrors /shared/types.ts — duplicated to avoid cross-package build config
// for this MVP. Keep in sync with /shared if you change the data model.

export type UserRole = "customer" | "admin" | "delivery";
export type DeliverySlot = "morning" | "evening";
export type SubscriptionPlan = "weekly" | "monthly";
export type SubscriptionStatus = "active" | "paused" | "cancelled";
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export interface UserDoc {
  uid: string;
  role: UserRole;
  name: string;
  phone: string;
  createdAt: number;
}

export interface AddressDoc {
  id: string;
  uid: string;
  label: string;
  lat: number;
  lng: number;
  formattedAddress: string;
  distanceFromHubKm: number;
  isWithinServiceArea: boolean;
  createdAt: number;
}

export interface VegCategoryDoc {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  items: string[];
  priceWeekly: number;
  priceMonthly: number;
  active: boolean;
}

export interface SubscriptionDoc {
  id: string;
  uid: string;
  categoryId: string;
  plan: SubscriptionPlan;
  slot: DeliverySlot;
  addressId: string;
  startDate: number;
  status: SubscriptionStatus;
  nextDeliveryDate: number;
  createdAt: number;
}

export interface OrderDoc {
  id: string;
  subId: string | null;
  uid: string;
  categoryId: string;
  slot: DeliverySlot;
  deliveryDate: number;
  addressId: string;
  status: OrderStatus;
  assignedDeliveryUid: string | null;
  paymentStatus: string;
  createdAt: number;
}
