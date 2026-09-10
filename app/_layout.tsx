import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { AuthProvider } from "@/lib/auth";
import { CartProvider } from "@/lib/cart";
import { startNotificationNavigation, startPushTokenRotationListener } from "@/lib/notifications";

export default function RootLayout() {
  useEffect(() => {
    const stopNavigation = startNotificationNavigation();
    const stopTokenRotation = startPushTokenRotationListener();
    return () => { stopNavigation(); stopTokenRotation(); };
  }, []);

  return (
    <AuthProvider>
      <CartProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }} />
      </CartProvider>
    </AuthProvider>
  );
}
