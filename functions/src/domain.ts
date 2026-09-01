// Mirrors the logic in /shared/{types,constants,serviceArea,bookingWindow}.ts.
// Kept as a local copy (rather than a workspace import) so `firebase deploy`
// can package this function without monorepo/symlink complications. If you
// change the rules in /shared, change them here too.

export type DeliverySlot = "morning" | "evening";
export type PaymentMethod = "cod" | "online";

export interface BookingWindowsConfig {
  morningStartHour: number;
  morningEndHour: number;
  eveningStartHour: number;
  eveningEndHour: number;
}

export interface ServiceAreaConfig {
  hubLat: number;
  hubLng: number;
  radiusKm: number;
}

export interface DeliveryFeeConfig {
  freeDeliveryThreshold: number;
  flatDeliveryFee: number;
}

export const DEFAULT_SERVICE_AREA: ServiceAreaConfig = {
  hubLat: 12.9486,
  hubLng: 80.1959,
  radiusKm: 5,
};

export const DEFAULT_BOOKING_WINDOWS: BookingWindowsConfig = {
  morningStartHour: 5,
  morningEndHour: 8,
  eveningStartHour: 17,
  eveningEndHour: 20,
};

export const DEFAULT_DELIVERY_FEE: DeliveryFeeConfig = {
  freeDeliveryThreshold: 129,
  flatDeliveryFee: 25,
};

// TESTING TOGGLE — set back to true before real launch. While false, orders
// can be placed for either slot at any hour; getOpenBookingSlot below still
// reports the real open/closed status (used for display), but nothing gates
// on it. Flip this in lockstep with the same constant in
// mobile-app/src/lib/domain.ts.
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
  windows: BookingWindowsConfig,
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

/** Whether a customer may book the given slot right now — the actual gate used at creation time. */
export function isSlotBookable(
  slot: DeliverySlot,
  windows: BookingWindowsConfig,
  now: Date = new Date()
): boolean {
  if (!BOOKING_WINDOW_ENFORCED) return true;
  return getOpenBookingSlot(windows, now) === slot;
}

export function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function isWithinServiceArea(
  lat: number,
  lng: number,
  area: ServiceAreaConfig
): { withinArea: boolean; distanceKm: number } {
  const distanceKm = haversineKm(lat, lng, area.hubLat, area.hubLng);
  return { withinArea: distanceKm <= area.radiusKm, distanceKm };
}

/** Next occurrence (>= today) of the given delivery slot, as a midnight-IST epoch millis. */
export function nextDeliveryDateForSlot(
  slot: DeliverySlot,
  windows: BookingWindowsConfig,
  now: Date = new Date()
): number {
  const openSlot = getOpenBookingSlot(windows, now);
  const todayMidnightIst = istMidnight(now);
  // If we're booking the morning slot while the morning window is open,
  // or booking evening while the evening window is open, delivery starts today.
  // Otherwise (e.g. admin/back-office creating ahead of time) it starts tomorrow.
  if (openSlot === slot) {
    return todayMidnightIst;
  }
  return todayMidnightIst + 24 * 60 * 60 * 1000;
}

function istMidnight(now: Date): number {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: IST_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const y = parts.find((p) => p.type === "year")!.value;
  const m = parts.find((p) => p.type === "month")!.value;
  const d = parts.find((p) => p.type === "day")!.value;
  // IST is UTC+5:30 with no DST; midnight IST == previous day 18:30 UTC.
  return Date.parse(`${y}-${m}-${d}T00:00:00+05:30`);
}
