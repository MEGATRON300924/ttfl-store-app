import { Platform } from "react-native";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { api } from "./api";
import { normalizeTTFLLink } from "./deep-links";

const NOTIFICATION_CHANNEL_ID = "orders";

Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: false }),
});

function getNotificationUrl(notification: Notifications.Notification) {
  const url = notification.request.content.data?.url;
  return typeof url === "string" && url.length > 0 ? url : null;
}

function navigateFromNotification(url: string | null) {
  if (!url) return;
  const route = normalizeTTFLLink(url);
  if (route) router.push(route as never);
}

export function startNotificationNavigation() {
  const initialResponse = Notifications.getLastNotificationResponse();
  if (initialResponse?.notification) navigateFromNotification(getNotificationUrl(initialResponse.notification));

  const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
    navigateFromNotification(getNotificationUrl(response.notification));
  });

  return () => subscription.remove();
}

export async function requestNotificationPermission() {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

export async function getExpoPushToken(projectId?: string, devicePushToken?: Notifications.DevicePushToken) {
  const granted = await requestNotificationPermission();
  if (!granted) return null;
  const options = projectId ? { projectId, ...(devicePushToken ? { devicePushToken } : {}) } : devicePushToken ? { devicePushToken } : undefined;
  const token = await Notifications.getExpoPushTokenAsync(options);
  return token.data;
}

async function registerToken(token: string) {
  await api("/api/notifications/devices", {
    method: "POST",
    body: JSON.stringify({ expoPushToken: token, platform: Platform.OS, appVersion: Constants.nativeAppVersion ?? Constants.expoConfig?.version }),
  });
  return token;
}

export async function registerPushDevice() {
  if (Platform.OS === "web") return null;
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNEL_ID, { name: "Orders & updates", importance: Notifications.AndroidImportance.DEFAULT, vibrationPattern: [0, 200], sound: "default" });
  }
  const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
  const token = await getExpoPushToken(projectId);
  if (!token) return null;
  return registerToken(token);
}

export function startPushTokenRotationListener() {
  if (Platform.OS === "web") return () => {};
  const subscription = Notifications.addPushTokenListener(async (devicePushToken) => {
    try {
      const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
      const token = await getExpoPushToken(projectId, devicePushToken);
      if (token) await registerToken(token);
    } catch {
      // Registration is retried on the next authenticated app launch.
    }
  });
  return () => subscription.remove();
}

export async function unregisterPushDevice(token: string | null) {
  if (!token) return;
  try {
    await api("/api/notifications/devices", { method: "DELETE", body: JSON.stringify({ expoPushToken: token }), skipRefresh: true });
  } catch {
    // Notification cleanup must never block sign-out.
  }
}
