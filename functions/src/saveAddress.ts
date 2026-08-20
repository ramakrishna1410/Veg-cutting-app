import * as admin from "firebase-admin";
import { HttpsError, onCall } from "firebase-functions/v2/https";
import { loadServiceArea } from "./config";
import { isWithinServiceArea } from "./domain";

interface SaveAddressRequest {
  addressId?: string; // omit to create a new one
  label: string;
  lat: number;
  lng: number;
  formattedAddress: string;
}

/**
 * Creates or updates a delivery address. Computes distance-from-hub and the
 * service-area flag server-side so a client can't spoof `isWithinServiceArea`
 * to unlock booking outside the 5 km Keelkattalai zone.
 */
export const saveAddress = onCall<SaveAddressRequest>(async (request) => {
  const uid = request.auth?.uid;
  if (!uid) {
    throw new HttpsError("unauthenticated", "Sign in required.");
  }

  const { addressId, label, lat, lng, formattedAddress } = request.data;
  if (
    typeof lat !== "number" ||
    typeof lng !== "number" ||
    !label ||
    !formattedAddress
  ) {
    throw new HttpsError("invalid-argument", "Missing required fields.");
  }

  const db = admin.firestore();
  const area = await loadServiceArea();
  const { withinArea, distanceKm } = isWithinServiceArea(lat, lng, area);

  const ref = addressId
    ? db.doc(`addresses/${addressId}`)
    : db.collection("addresses").doc();

  if (addressId) {
    const existing = await ref.get();
    if (!existing.exists || existing.data()?.uid !== uid) {
      throw new HttpsError("not-found", "Address not found.");
    }
  }

  await ref.set({
    id: ref.id,
    uid,
    label,
    lat,
    lng,
    formattedAddress,
    distanceFromHubKm: Math.round(distanceKm * 100) / 100,
    isWithinServiceArea: withinArea,
    createdAt: Date.now(),
  });

  return {
    addressId: ref.id,
    isWithinServiceArea: withinArea,
    distanceFromHubKm: Math.round(distanceKm * 100) / 100,
  };
});
