import * as admin from "firebase-admin";
import { onDocumentUpdated } from "firebase-functions/v2/firestore";
import { logger } from "firebase-functions/v2";

const STATUS_COPY: Record<string, { title: string; body: string }> = {
  confirmed: { title: "Order confirmed", body: "We've confirmed your order and it's being packed." },
  out_for_delivery: { title: "Out for delivery", body: "Your order is on its way — tap to track it live." },
  delivered: { title: "Delivered", body: "Your order has been delivered. Enjoy!" },
  cancelled: { title: "Order cancelled", body: "This order was cancelled." },
};

/** Sends one push via Expo's push service — no FCM/APNs setup needed on our side. */
async function sendExpoPush(pushToken: string, title: string, body: string, data: Record<string, string>) {
  try {
    const res = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ to: pushToken, title, body, data, sound: "default" }),
    });
    if (!res.ok) {
      logger.warn("Expo push send failed", { status: res.status, body: await res.text() });
    }
  } catch (e) {
    logger.warn("Expo push send threw", e);
  }
}

async function getPushToken(uid: string): Promise<string | null> {
  const snap = await admin.firestore().doc(`users/${uid}`).get();
  const token = snap.data()?.pushToken;
  return typeof token === "string" && token.length > 0 ? token : null;
}

/**
 * Watches every order for status changes and delivery-partner assignment,
 * and sends a real push notification (Expo push service) for each — this
 * fires even if the recipient's app is closed, unlike the in-app toast.
 */
export const onOrderUpdated = onDocumentUpdated("orders/{orderId}", async (event) => {
  const before = event.data?.before.data();
  const after = event.data?.after.data();
  if (!before || !after) return;

  if (before.status !== after.status) {
    const copy = STATUS_COPY[after.status as string];
    if (copy) {
      const token = await getPushToken(after.uid);
      if (token) {
        await sendExpoPush(token, copy.title, copy.body, { orderId: after.id, type: "order_status" });
      }
    }
  }

  const newlyAssigned =
    !before.assignedDeliveryUid && after.assignedDeliveryUid && after.status === "confirmed";
  if (newlyAssigned) {
    const token = await getPushToken(after.assignedDeliveryUid);
    if (token) {
      await sendExpoPush(
        token,
        "New delivery assigned",
        "You've been assigned a new order — check your Deliveries list.",
        { orderId: after.id, type: "new_assignment" }
      );
    }
  }
});
