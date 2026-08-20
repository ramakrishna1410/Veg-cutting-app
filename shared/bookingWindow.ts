import type { BookingWindowsConfig, DeliverySlot } from "./types";
import { IST_TIMEZONE } from "./constants";

/** Current hour (0-23) in IST, using Intl so this works in Node and RN without extra deps. */
export function getIstHour(now: Date = new Date()): number {
  const hourStr = new Intl.DateTimeFormat("en-US", {
    timeZone: IST_TIMEZONE,
    hour: "numeric",
    hour12: false,
  }).format(now);
  // "24" can be returned for midnight in some environments; normalize to 0.
  const hour = parseInt(hourStr, 10);
  return hour === 24 ? 0 : hour;
}

/**
 * Which delivery slot's booking window is currently open, if any.
 * This is the single source of truth for "can a customer place a new
 * booking right now" — enforced again server-side in Cloud Functions,
 * this copy is for client UI only.
 */
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

export function isBookingWindowOpenForSlot(
  slot: DeliverySlot,
  windows: BookingWindowsConfig,
  now: Date = new Date()
): boolean {
  return getOpenBookingSlot(windows, now) === slot;
}
