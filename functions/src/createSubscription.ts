import * as admin from "firebase-admin";
import { HttpsError, onCall } from "firebase-functions/v2/https";
import { loadBookingWindows } from "./config";
import {
  DeliverySlot,
  SubscriptionPlan,
  getOpenBookingSlot,
  nextDeliveryDateForSlot,
} from "./domain";

interface CreateSubscriptionRequest {
  categoryId: string;
  plan: SubscriptionPlan;
  slot: DeliverySlot;
  addressId: string;
}

/**
 * Creates a new subscription. This is the ONLY way subscriptions get created
 * (Firestore rules disallow direct client writes to /subscriptions) so this
 * is the enforcement point for "booking can only be placed 5-8 AM / 5-8 PM IST".
 */
export const createSubscription = onCall<CreateSubscriptionRequest>(
  async (request) => {
    const uid = request.auth?.uid;
    if (!uid) {
      throw new HttpsError("unauthenticated", "Sign in required.");
    }

    const { categoryId, plan, slot, addressId } = request.data;
    if (!categoryId || !plan || !slot || !addressId) {
      throw new HttpsError("invalid-argument", "Missing required fields.");
    }
    if (plan !== "weekly" && plan !== "monthly") {
      throw new HttpsError("invalid-argument", "Invalid plan.");
    }
    if (slot !== "morning" && slot !== "evening") {
      throw new HttpsError("invalid-argument", "Invalid slot.");
    }

    const db = admin.firestore();

    const windows = await loadBookingWindows();
    const openSlot = getOpenBookingSlot(windows);
    if (openSlot === null) {
      throw new HttpsError(
        "failed-precondition",
        "Booking is only open 5:00–8:00 AM and 5:00–8:00 PM IST. Please try again during those windows."
      );
    }
    if (openSlot !== slot) {
      throw new HttpsError(
        "failed-precondition",
        `Right now only the ${openSlot} slot can be booked. The ${slot} slot's booking window is not open.`
      );
    }

    const [categorySnap, addressSnap] = await Promise.all([
      db.doc(`vegCategories/${categoryId}`).get(),
      db.doc(`addresses/${addressId}`).get(),
    ]);

    if (!categorySnap.exists || categorySnap.data()?.active !== true) {
      throw new HttpsError("not-found", "Category not found or inactive.");
    }
    const address = addressSnap.data();
    if (!addressSnap.exists || address?.uid !== uid) {
      throw new HttpsError("not-found", "Address not found.");
    }
    if (address?.isWithinServiceArea !== true) {
      throw new HttpsError(
        "failed-precondition",
        "This address is outside our 5 km Keelkattalai delivery area."
      );
    }

    const now = Date.now();
    const startDate = nextDeliveryDateForSlot(slot, windows);

    const subRef = db.collection("subscriptions").doc();
    await subRef.set({
      id: subRef.id,
      uid,
      categoryId,
      plan,
      slot,
      addressId,
      startDate,
      status: "active",
      nextDeliveryDate: startDate,
      createdAt: now,
    });

    return { subscriptionId: subRef.id, startDate };
  }
);
