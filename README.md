# TTFL Store App

Native TTFL Store mobile client built with Expo, React Native and Expo Router.

## Architecture

- Android-first, iOS-ready.
- Uses the existing TTFL Store backend and the existing TTFL customer account system.
- Mobile authentication uses the same users and sessions as the web store, with native access/refresh tokens stored in SecureStore.
- No separate mobile database or customer account system.
- Product discovery, checkout, orders and tracking call the existing TTFL API.
- Push notifications use the shared backend notification endpoints.
- Expo Router provides native file-based navigation and incoming deep-link routing.

## Development

1. Copy `.env.example` to `.env`.
2. Set `EXPO_PUBLIC_API_URL` to the deployed TTFL Store backend URL.
3. Run `npm install`.
4. Run `npm start`.

## Deep linking

The app supports the `ttflstore://` custom scheme and HTTPS links for `ttflstore.name.ng`.

Examples:

- `ttflstore://app/product/example-product`
- `ttflstore://app/vendor/example-store`
- `ttflstore://app/orders/TTFL-12345`
- `https://ttflstore.name.ng/products/example-product`
- `https://ttflstore.name.ng/store/example-store`
- `https://ttflstore.name.ng/orders/TTFL-12345/confirm?reference=PAYMENT_REFERENCE`
- `https://ttflstore.name.ng/payment/callback?reference=PAYMENT_REFERENCE&orderNumber=TTFL-12345`

The app rewrites the web marketplace routes to their native Expo Router equivalents. Notification payloads can also include a `url` field and use the same routing layer.

### Testing links locally

Use a development build rather than relying on Expo Go for full native linking behavior. Expo's documentation recommends development builds for testing app links and universal links.

For the custom scheme, open a link such as `ttflstore://app/product/example-product` on a device/emulator where the development build is installed.

HTTPS App Links and Universal Links additionally require the production website association files and the final Android signing certificate / iOS application association details. Those values should be configured when the release signing credentials are finalized; they are intentionally not guessed in this repository.

## Local checks

- `npm run typecheck`
- `npm run lint`
- `npx expo start`

For Android release builds, use the project's normal EAS/local Android build process after configuring the final signing credentials and production environment variables.
