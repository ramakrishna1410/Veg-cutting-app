// Minimal doc shapes used within functions/. Mirrors /shared/types.ts.
import { DeliverySlot, SubscriptionPlan } from "./domain";

export interface SubscriptionDoc {
  id: string;
  uid: string;
  categoryId: string;
  plan: SubscriptionPlan;
  slot: DeliverySlot;
  addressId: string;
  startDate: number;
  status: "active" | "paused" | "cancelled";
  nextDeliveryDate: number;
  createdAt: number;
}
