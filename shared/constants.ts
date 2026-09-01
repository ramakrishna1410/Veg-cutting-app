import type { BookingWindowsConfig, DeliveryFeeConfig, ServiceAreaConfig } from "./types";

// Keelkattalai, Chennai — approximate hub coordinate. Update to the exact
// kitchen/hub address once finalized; this is the center used for the 5 km
// service-area check.
export const DEFAULT_SERVICE_AREA: ServiceAreaConfig = {
  hubLat: 12.9486,
  hubLng: 80.1959,
  radiusKm: 5,
};

// 5:00–8:00 AM and 5:00–8:00 PM, IST. Both the delivery slot itself and the
// window during which a customer may *place* a new booking.
export const DEFAULT_BOOKING_WINDOWS: BookingWindowsConfig = {
  morningStartHour: 5,
  morningEndHour: 8,
  eveningStartHour: 17,
  eveningEndHour: 20,
};

export const IST_TIMEZONE = "Asia/Kolkata";

// TESTING TOGGLE — set back to true before real launch. While false, a
// customer can book either delivery slot at any hour. Kept in lockstep with
// the same constant duplicated in functions/src/domain.ts and
// mobile-app/src/lib/domain.ts (see those files for why they're duplicated
// rather than importing this one directly).
export const BOOKING_WINDOW_ENFORCED = false;

// Orders below this subtotal pay DEFAULT_DELIVERY_FEE.flatDeliveryFee for delivery;
// at or above it, delivery is free.
export const DEFAULT_DELIVERY_FEE: DeliveryFeeConfig = {
  freeDeliveryThreshold: 129,
  flatDeliveryFee: 25,
};

export const VEG_CATEGORY_SEED = [
  {
    name: "Biryani Veggies",
    description: "Onion, carrot, beans, potato — cut and ready for biryani.",
    items: ["Onion", "Carrot", "Beans", "Potato"],
    price: 89,
  },
  {
    name: "Fried Rice Veggies",
    description: "Finely diced mixed veg for fried rice / noodles.",
    items: ["Carrot", "Beans", "Capsicum", "Cabbage", "Spring Onion"],
    price: 79,
  },
  {
    name: "Sambar Veggies",
    description: "Classic sambar mix, chopped.",
    items: ["Drumstick", "Brinjal", "Pumpkin", "Carrot", "Onion", "Tomato"],
    price: 75,
  },
  {
    name: "Tiffin Sambar Veggies",
    description: "Lighter mix for idli/dosa-side tiffin sambar.",
    items: ["Onion", "Tomato", "Carrot", "Drumstick"],
    price: 65,
  },
  {
    name: "Veg Fry Mix",
    description: "Sliced veg for a quick stir-fry / poriyal.",
    items: ["Beans", "Carrot", "Cabbage", "Potato"],
    price: 69,
  },
] as const;
