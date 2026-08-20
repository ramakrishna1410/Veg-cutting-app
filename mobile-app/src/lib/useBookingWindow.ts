import { useEffect, useState } from "react";
import { getOpenBookingSlot, DeliverySlot } from "@/lib/domain";

/** Live-updating "which slot's booking window is open right now" (IST). */
export function useBookingWindow(): DeliverySlot | null {
  const [openSlot, setOpenSlot] = useState<DeliverySlot | null>(getOpenBookingSlot());

  useEffect(() => {
    const id = setInterval(() => setOpenSlot(getOpenBookingSlot()), 30_000);
    return () => clearInterval(id);
  }, []);

  return openSlot;
}
