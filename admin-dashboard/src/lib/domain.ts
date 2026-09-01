// Mirrors /shared/types.ts — duplicated to avoid cross-package build config
// for this MVP. Keep in sync with /shared if you change the data model.

export type UserRole = "customer" | "admin" | "delivery";
export type DeliverySlot = "morning" | "evening";
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";
export type PaymentMethod = "cod" | "online";
export type PaymentStatus = "cod_pending" | "cod_collected" | "online_paid";

export interface UserDoc {
  uid: string;
  role: UserRole;
  name: string;
  phone: string;
  email?: string;
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

export interface CategoryDoc {
  id: string;
  name: string;
  sortOrder: number;
  active: boolean;
}

export interface MenuItemDoc {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  imageUrl: string;
  items: string[];
  price: number;
  active: boolean;
}

export interface OrderItem {
  menuItemId: string;
  menuItemName: string;
  quantity: number;
  unitPrice: number;
}

export interface OrderDoc {
  id: string;
  uid: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  slot: DeliverySlot;
  deliveryDate: number;
  addressId: string;
  status: OrderStatus;
  assignedDeliveryUid: string | null;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  createdAt: number;
}
