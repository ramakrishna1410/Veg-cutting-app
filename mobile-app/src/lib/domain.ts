// Mirrors /shared/{types,constants,serviceArea,bookingWindow}.ts — duplicated
// here (rather than imported cross-package) to keep Metro's default,
// single-project resolution working without extra monorepo config. Keep in
// sync with /shared if you change the rules there.

export type DeliverySlot = "morning" | "evening";
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";
export type PaymentMethod = "cod" | "online";
export type PaymentStatus = "cod_pending" | "cod_collected" | "online_paid";

export interface CategoryDoc {
  id: string;
  name: string;
  sortOrder: number;
  active: boolean;
  imageUrl?: string;
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

export interface OrderItem {
  menuItemId: string;
  menuItemName: string;
  quantity: number;
  unitPrice: number;
}

export interface LiveLocation {
  lat: number;
  lng: number;
  heading: number | null;
  updatedAt: number;
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
  // Written by the delivery partner's app while status is "out_for_delivery"
  // and their app is open/foregrounded — this is live-while-open tracking,
  // not true background tracking (that needs Android background-location
  // approval, which we're deliberately not taking on yet).
  liveLocation?: LiveLocation | null;
}

export interface BookingWindowsConfig {
  morningStartHour: number;
  morningEndHour: number;
  eveningStartHour: number;
  eveningEndHour: number;
}

export const DEFAULT_BOOKING_WINDOWS: BookingWindowsConfig = {
  morningStartHour: 5,
  morningEndHour: 8,
  eveningStartHour: 17,
  eveningEndHour: 20,
};

// Mirrors DEFAULT_DELIVERY_FEE in /shared/constants.ts — used only for the
// live cart preview; the real charge is always computed server-side in
// createOrder from config/deliveryFee (falling back to these same numbers).
export const FREE_DELIVERY_THRESHOLD = 129;
export const FLAT_DELIVERY_FEE = 25;

// TESTING TOGGLE — set back to true before real launch. While false, either
// slot can be picked and checked out at any hour; getOpenBookingSlot still
// reports the real open/closed status for display. Flip this in lockstep
// with the same constant in functions/src/domain.ts.
export const BOOKING_WINDOW_ENFORCED = false;

const IST_TIMEZONE = "Asia/Kolkata";

export function getIstHour(now: Date = new Date()): number {
  const hourStr = new Intl.DateTimeFormat("en-US", {
    timeZone: IST_TIMEZONE,
    hour: "numeric",
    hour12: false,
  }).format(now);
  const hour = parseInt(hourStr, 10);
  return hour === 24 ? 0 : hour;
}

export function getOpenBookingSlot(
  windows: BookingWindowsConfig = DEFAULT_BOOKING_WINDOWS,
  now: Date = new Date()
): DeliverySlot | null {
  const hour = getIstHour(now);
  if (hour >= windows.morningStartHour && hour < windows.morningEndHour) {
    return "morning";
  }
  if (hour >= windows.eveningStartHour && hour < windows.eveningEndHour) {
    return "evening";
  }
  return null;
}

/** Whether a customer may book the given slot right now — the actual gate used in the UI. */
export function isSlotBookable(
  slot: DeliverySlot,
  windows: BookingWindowsConfig = DEFAULT_BOOKING_WINDOWS,
  now: Date = new Date()
): boolean {
  if (!BOOKING_WINDOW_ENFORCED) return true;
  return getOpenBookingSlot(windows, now) === slot;
}
