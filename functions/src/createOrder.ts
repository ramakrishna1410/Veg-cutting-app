import * as admin from "firebase-admin";
import { HttpsError, onCall } from "firebase-functions/v2/https";
import { loadBookingWindows, loadDeliveryFee } from "./config";
import { DeliverySlot, PaymentMethod, getOpenBookingSlot, nextDeliveryDateForSlot } from "./domain";

interface CartItemInput {
  categoryId: string;
  quantity: number;
}

interface CreateOrderRequest {
  items: CartItemInput[];
  slot: DeliverySlot;
  addressId: string;
  paymentMethod: PaymentMethod;
}

/**
 * Places an ad-hoc order for one or more recipe packs. Prices, the delivery
 * fee, the booking window and the service-area check are all computed and
 * enforced server-side from live Firestore data — never trust a client-
 * supplied price or fee, since request.data is attacker-controlled.
 */
export const createOrder = onCall<CreateOrderRequest>(async (request) => {
  const uid = request.auth?.uid;
  if (!uid) {
    throw new HttpsError("unauthenticated", "Sign in required.");
  }

  const { items, slot, addressId, paymentMethod } = request.data;
  if (!Array.isArray(items) || items.length === 0 || !slot || !addressId) {
    throw new HttpsError("invalid-argument", "Missing required fields.");
  }
  if (slot !== "morning" && slot !== "evening") {
    throw new HttpsError("invalid-argument", "Invalid slot.");
  }
  if (paymentMethod !== "cod") {
    // Online payment isn't wired up to a gateway yet — every order is COD
    // for now. Reject anything else rather than silently downgrading it,
    // so a future client bug can't accidentally charge nobody.
    throw new HttpsError(
      "failed-precondition",
      "Online payment isn't available yet — please choose cash on delivery."
    );
  }
  for (const item of items) {
    if (!item.categoryId || !Number.isInteger(item.quantity) || item.quantity < 1) {
      throw new HttpsError("invalid-argument", "Each item needs a categoryId and a positive quantity.");
    }
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

  const addressSnap = await db.doc(`addresses/${addressId}`).get();
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

  const categorySnaps = await Promise.all(
    items.map((item) => db.doc(`vegCategories/${item.categoryId}`).get())
  );

  const orderItems = items.map((item, i) => {
    const snap = categorySnaps[i];
    const category = snap.data();
    if (!snap.exists || category?.active !== true) {
      throw new HttpsError("not-found", `Category ${item.categoryId} not found or inactive.`);
    }
    return {
      categoryId: item.categoryId,
      categoryName: category!.name as string,
      quantity: item.quantity,
      unitPrice: category!.price as number,
    };
  });

  const subtotal = orderItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const deliveryFeeConfig = await loadDeliveryFee();
  const deliveryFee = subtotal >= deliveryFeeConfig.freeDeliveryThreshold ? 0 : deliveryFeeConfig.flatDeliveryFee;
  const total = subtotal + deliveryFee;

  const deliveryDate = nextDeliveryDateForSlot(slot, windows);
  const orderRef = db.collection("orders").doc();
  await orderRef.set({
    id: orderRef.id,
    uid,
    items: orderItems,
    subtotal,
    deliveryFee,
    total,
    slot,
    deliveryDate,
    addressId,
    status: "pending",
    assignedDeliveryUid: null,
    paymentMethod: "cod",
    paymentStatus: "cod_pending",
    createdAt: Date.now(),
  });

  return { orderId: orderRef.id, deliveryDate, subtotal, deliveryFee, total };
});
