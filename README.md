# Veg Cutting App

Subscription-based delivery of pre-cut vegetables, delivered in two daily 3-hour
slots (5–8 AM, 5–8 PM), within a 5 km radius of Keelkattalai.

## Structure

```
mobile-app/       Customer app (Expo / React Native + TypeScript)
admin-dashboard/  Admin + delivery-partner web dashboard (React + Vite + TypeScript)
functions/        Firebase Cloud Functions (booking-window + service-area enforcement,
                   daily order generation from subscriptions)
shared/           Types and constants shared across all three apps
firestore.rules
firestore.indexes.json
firebase.json
```

## Core business rules (enforced server-side in `functions/`)

- **Booking windows**: new subscriptions/orders can only be *created* 5:00–8:00 AM
  or 5:00–8:00 PM IST. See `functions/src/bookingWindow.ts`.
- **Delivery slots**: every order/subscription is for the `morning` (5–8 AM) or
  `evening` (5–8 PM) delivery slot.
- **Service area**: delivery addresses must resolve within 5 km (Haversine) of the
  Keelkattalai hub coordinate. See `shared/serviceArea.ts`.
- **Recurring orders**: a scheduled Cloud Function (`generateDailyOrders`) turns
  active subscriptions into concrete `orders` each day — this runs on a cron
  schedule and is *not* subject to the booking-window restriction (that only
  gates new subscription/order creation by customers).

## Getting started

### 1. Firebase project

```bash
npm install -g firebase-tools
firebase login
firebase use --add   # link this repo to your Firebase project
```

Fill in `mobile-app/.env` and `admin-dashboard/.env` from the `.env.example` files
with your Firebase web config.

### 2. Cloud Functions

```bash
cd functions
npm install
npm run build
firebase deploy --only functions,firestore:rules
```

### 3. Seed initial config docs

After first deploy, create these Firestore documents (see `shared/constants.ts`
for the exact default values used if they're missing):

- `config/bookingWindows`
- `config/serviceArea`

Also seed a few `vegCategories` docs, either by hand in the console or from the
admin dashboard once it's running.

### 4. Mobile app (customer)

```bash
cd mobile-app
npm install
npx expo start
```

### 5. Admin dashboard (admin + delivery partner)

```bash
cd admin-dashboard
npm install
npm run dev
```

Log in with a user whose `users/{uid}.role` is `admin` or `delivery` — the
dashboard routes by role.

## Status

MVP in progress: customer app (auth, address + service-area check, category
browsing, slot/plan booking, subscriptions) + admin dashboard (orders board,
category management, delivery assignment, delivery-partner view). Payments are
manual/COD for now — see the plan doc for what's deferred.
