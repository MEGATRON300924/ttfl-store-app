# TTFL Store App

Native TTFL Store mobile client built with Expo, React Native and Expo Router.

## Architecture

- Android-first, iOS-ready.
- Uses the existing TTFL Store backend and the existing TTFL customer account system.
- Mobile authentication uses the same users and sessions as the web store, with native access/refresh tokens stored in SecureStore.
- No separate mobile database or customer account system.
- Product discovery, orders and tracking call the existing TTFL API.
- Notifications will be added against the shared backend notification architecture rather than creating a second notification system.

## Development

1. Copy `.env.example` to `.env`.
2. Set `EXPO_PUBLIC_API_URL` to the deployed TTFL Store backend URL.
3. Run `npm install`.
4. Run `npm start`.

Expo Router is used for file-based native navigation and deep linking. See the official Expo Router documentation for the current SDK guidance.
