import * as admin from "firebase-admin";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { SubscriptionDoc } from "./types-lite";

/**
 * Runs once a day (early morning IST, before the morning delivery window) and
 * materializes an `orders` doc for every active subscription whose
 * nextDeliveryDate is due, then advances nextDeliveryDate by the plan's
 * cadence (7 days for weekly, 1 day for monthly — i.e. monthly subscribers
 * still get a delivery every day for the month, just billed monthly; see
 * README/plan for the intended semantics and adjust here if the product
 * definition changes).
 *
 * This is intentionally NOT subject to the customer booking-window check —
 * that check only gates a customer creating a brand new subscription/order,
 * not the system generating the day's already-subscribed deliveries.
 */
export const generateDailyOrders = onSchedule(
  { schedule: "0 3 * * *", timeZone: "Asia/Kolkata" },
  async () => {
    const db = admin.firestore();
    const now = Date.now();
    const todayMidnight = istMidnightMillis(new Date());

    const dueSubs = await db
      .collection("subscriptions")
      .where("status", "==", "active")
      .where("nextDeliveryDate", "<=", todayMidnight)
      .get();

    const batch = db.batch();
    let count = 0;

    for (const doc of dueSubs.docs) {
      const sub = doc.data() as SubscriptionDoc;

      const orderRef = db.collection("orders").doc();
      batch.set(orderRef, {
        id: orderRef.id,
        subId: sub.id,
        uid: sub.uid,
        categoryId: sub.categoryId,
        slot: sub.slot,
        deliveryDate: todayMidnight,
        addressId: sub.addressId,
        status: "pending",
        assignedDeliveryUid: null,
        paymentStatus: "cod_pending",
        createdAt: now,
      });

      const cadenceDays = sub.plan === "weekly" ? 7 : 1;
      const nextDeliveryDate =
        todayMidnight + cadenceDays * 24 * 60 * 60 * 1000;
      batch.update(doc.ref, { nextDeliveryDate });

      count += 1;
    }

    await batch.commit();
    console.log(`generateDailyOrders: created ${count} order(s) for ${todayMidnight}`);
  }
);

function istMidnightMillis(now: Date): number {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const y = parts.find((p) => p.type === "year")!.value;
  const m = parts.find((p) => p.type === "month")!.value;
  const d = parts.find((p) => p.type === "day")!.value;
  return Date.parse(`${y}-${m}-${d}T00:00:00+05:30`);
}
