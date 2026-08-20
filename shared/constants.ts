import type { BookingWindowsConfig, ServiceAreaConfig } from "./types";

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

export const VEG_CATEGORY_SEED = [
  {
    name: "Biryani Veggies",
    description: "Onion, carrot, beans, potato — cut and ready for biryani.",
    items: ["Onion", "Carrot", "Beans", "Potato"],
    priceWeekly: 249,
    priceMonthly: 899,
  },
  {
    name: "Fried Rice Veggies",
    description: "Finely diced mixed veg for fried rice / noodles.",
    items: ["Carrot", "Beans", "Capsicum", "Cabbage", "Spring Onion"],
    priceWeekly: 229,
    priceMonthly: 829,
  },
  {
    name: "Sambar Veggies",
    description: "Classic sambar mix, chopped.",
    items: ["Drumstick", "Brinjal", "Pumpkin", "Carrot", "Onion", "Tomato"],
    priceWeekly: 219,
    priceMonthly: 799,
  },
  {
    name: "Tiffin Sambar Veggies",
    description: "Lighter mix for idli/dosa-side tiffin sambar.",
    items: ["Onion", "Tomato", "Carrot", "Drumstick"],
    priceWeekly: 199,
    priceMonthly: 749,
  },
  {
    name: "Veg Fry Mix",
    description: "Sliced veg for a quick stir-fry / poriyal.",
    items: ["Beans", "Carrot", "Cabbage", "Potato"],
    priceWeekly: 209,
    priceMonthly: 769,
  },
] as const;
