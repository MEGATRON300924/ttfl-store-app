import * as Notifications from "expo-notifications";
import { router } from "expo-router";

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
