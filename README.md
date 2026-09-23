# TTFL Store App

Native TTFL Store marketplace client built with React Native, Expo, Expo Router and EAS.

## Product direction

The mobile app mirrors the TTFL Store webstore identity: graphite/white marketplace surfaces, ember orange CTAs, dense commerce cards, familiar marketplace navigation and no generic glassmorphism/neon AI styling.

## Architecture

- Android-first and iOS-ready.
- Same TTFL Store backend and TTFL customer accounts as web.
- No separate mobile database or customer account system.
- SecureStore access/refresh sessions.
- Product discovery, categories, search, sorting, cart, checkout/Paystack, orders, tracking, wishlist, vendor storefronts and account tools.
- Native notification center plus Expo push registration and actionable deep links.
- Vendor dashboard entry point with native order summary and links to the full seller tools.
- Web marketplace links are normalized into native Expo Router routes where supported.

## Development

1. Copy `.env.example` to `.env`.
2. Set `EXPO_PUBLIC_API_URL` to `https://ttfl-store-backend.onrender.com` or your development backend.
3. Run `npm install`.
4. Run `npm start`.

Checks:

- `npm run typecheck`
- `npm run lint`

## EAS

The project is configured for EAS in `eas.json`.

Preview Android build:

`npx eas build --platform android --profile preview`

Production Android build:

`npx eas build --platform android --profile production`

Production iOS build:

`npx eas build --platform ios --profile production`

If the Expo project has not yet been linked to EAS, run `npx eas init` once from this repository. Do not invent a project ID in source; EAS will associate the project with the account/project during initialization.

## Notifications

The app registers Expo push tokens with the TTFL Store backend at `/api/notifications/devices`.

The backend now also exposes:

- `GET /api/notifications/` — notification center
- `PATCH /api/notifications/:id/read` — mark one notification read
- `POST /api/notifications/read-all` — mark all notifications read
- `POST /api/notifications/devices` — register a device
- `DELETE /api/notifications/devices` — disable a device

Order creation, successful payment and vendor order-status changes create customer notification records and send push notifications when a registered device is available.

## Deep linking

Supported custom scheme:

- `ttflstore://app/product/example-product`
- `ttflstore://app/vendor/example-store`
- `ttflstore://app/orders/TTFL-12345`

Supported web links include:

- `https://ttflstore.name.ng/products/example-product`
- `https://ttflstore.name.ng/store/example-store`
- `https://ttflstore.name.ng/orders/TTFL-12345/confirm?reference=PAYMENT_REFERENCE`
- `https://ttflstore.name.ng/payment/callback?reference=PAYMENT_REFERENCE&orderNumber=TTFL-12345`

Notification payloads can include a `url` field and use the same native routing layer.

## Important

HTTPS App Links and iOS Universal Links still require the final production association files/signing configuration on the web and app side. The repository keeps the native intent configuration in place without guessing production signing identifiers.
