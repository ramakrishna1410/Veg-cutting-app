import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/firebase";
import { DeliverySlot, PaymentMethod } from "@/lib/domain";

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

export async function createOrder(input: {
  items: { menuItemId: string; quantity: number }[];
  slot: DeliverySlot;
  addressId: string;
  paymentMethod: PaymentMethod;
}) {
  const fn = httpsCallable(functions, "createOrder");
  const res = await fn(input);
  return res.data as {
    orderId: string;
    deliveryDate: number;
    subtotal: number;
    deliveryFee: number;
    total: number;
  };
}
