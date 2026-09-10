import { Platform } from "react-native";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { api } from "./api";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

function getNotificationUrl(notification: Notifications.Notification) {
  const url = notification.request.content.data?.url;
  return typeof url === "string" && url.length > 0 ? url : null;
}

export function startNotificationNavigation() {
  const initialResponse = Notifications.getLastNotificationResponse();
  if (initialResponse?.notification) {
    const url = getNotificationUrl(initialResponse.notification);
    if (url) router.push(url as never);
  }

  const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
    const url = getNotificationUrl(response.notification);
    if (url) router.push(url as never);
  });

  return () => subscription.remove();
}

export async function requestNotificationPermission() {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;

  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

export async function getExpoPushToken(projectId?: string) {
  const granted = await requestNotificationPermission();
  if (!granted) return null;

  const token = await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : undefined);
  return token.data;
}

export async function registerPushDevice() {
  if (Platform.OS === "web") return null;
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "TTFL Store",
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 200],
      sound: "default",
    });
  }

  const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
  const token = await getExpoPushToken(projectId);
  if (!token) return null;

  await api("/api/notifications/devices", {
    method: "POST",
    body: JSON.stringify({
      expoPushToken: token,
      platform: Platform.OS,
      appVersion: Constants.nativeAppVersion ?? Constants.expoConfig?.version,
    }),
  });

  return token;
}

export async function unregisterPushDevice(token: string | null) {
  if (!token) return;
  try {
    await api("/api/notifications/devices", {
      method: "DELETE",
      body: JSON.stringify({ expoPushToken: token }),
      skipRefresh: true,
    });
  } catch {
    // Local session cleanup must never be blocked by notification cleanup.
  }
}
