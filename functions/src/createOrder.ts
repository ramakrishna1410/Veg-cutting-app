import * as admin from "firebase-admin";
import { HttpsError, onCall } from "firebase-functions/v2/https";
import { loadBookingWindows } from "./config";
import { DeliverySlot, getOpenBookingSlot, nextDeliveryDateForSlot } from "./domain";

interface CreateOrderRequest {
  categoryId: string;
  slot: DeliverySlot;
  addressId: string;
}

/**
 * One-off (non-subscription) order, same booking-window + service-area
 * enforcement as createSubscription. Recurring orders from active
 * subscriptions are generated separately by generateDailyOrders.
 */
export const createOrder = onCall<CreateOrderRequest>(async (request) => {
  const uid = request.auth?.uid;
  if (!uid) {
    throw new HttpsError("unauthenticated", "Sign in required.");
  }

  const { categoryId, slot, addressId } = request.data;
  if (!categoryId || !slot || !addressId) {
    throw new HttpsError("invalid-argument", "Missing required fields.");
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
      `Right now only the ${openSlot} slot can be booked.`
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

  const deliveryDate = nextDeliveryDateForSlot(slot, windows);
  const orderRef = db.collection("orders").doc();
  await orderRef.set({
    id: orderRef.id,
    subId: null,
    uid,
    categoryId,
    slot,
    deliveryDate,
    addressId,
    status: "pending",
    assignedDeliveryUid: null,
    paymentStatus: "cod_pending",
    createdAt: Date.now(),
  });

  return { orderId: orderRef.id, deliveryDate };
});
