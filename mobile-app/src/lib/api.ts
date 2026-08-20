import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/firebase";
import { DeliverySlot, SubscriptionPlan } from "@/lib/domain";

export async function saveAddress(input: {
  addressId?: string;
  label: string;
  lat: number;
  lng: number;
  formattedAddress: string;
}) {
  const fn = httpsCallable(functions, "saveAddress");
  const res = await fn(input);
  return res.data as {
    addressId: string;
    isWithinServiceArea: boolean;
    distanceFromHubKm: number;
  };
}

export async function createSubscription(input: {
  categoryId: string;
  plan: SubscriptionPlan;
  slot: DeliverySlot;
  addressId: string;
}) {
  const fn = httpsCallable(functions, "createSubscription");
  const res = await fn(input);
  return res.data as { subscriptionId: string; startDate: number };
}

export async function createOrder(input: {
  categoryId: string;
  slot: DeliverySlot;
  addressId: string;
}) {
  const fn = httpsCallable(functions, "createOrder");
  const res = await fn(input);
  return res.data as { orderId: string; deliveryDate: number };
}
