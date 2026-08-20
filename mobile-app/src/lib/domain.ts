// Mirrors /shared/{types,constants,serviceArea,bookingWindow}.ts — duplicated
// here (rather than imported cross-package) to keep Metro's default,
// single-project resolution working without extra monorepo config. Keep in
// sync with /shared if you change the rules there.

export type DeliverySlot = "morning" | "evening";
export type SubscriptionPlan = "weekly" | "monthly";
export type SubscriptionStatus = "active" | "paused" | "cancelled";
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

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

/** Minutes until the given slot's booking window next opens (0 if it's open now). */
export function minutesUntilSlotOpens(
  slot: DeliverySlot,
  windows: BookingWindowsConfig = DEFAULT_BOOKING_WINDOWS,
  now: Date = new Date()
): number {
  if (getOpenBookingSlot(windows, now) === slot) return 0;
  const startHour =
    slot === "morning" ? windows.morningStartHour : windows.eveningStartHour;
  const hour = getIstHour(now);
  const minute = parseInt(
    new Intl.DateTimeFormat("en-US", {
      timeZone: IST_TIMEZONE,
      minute: "numeric",
    }).format(now),
    10
  );
  let hoursUntil = startHour - hour;
  if (hoursUntil < 0) hoursUntil += 24;
  return hoursUntil * 60 - minute;
}
