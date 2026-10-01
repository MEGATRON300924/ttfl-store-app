import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { AuthProvider } from "@/lib/auth";
import { CartProvider } from "@/lib/cart";
import { startNotificationNavigation, startPushTokenRotationListener } from "@/lib/notifications";
import { TermsGate } from "@/components/TermsGate";

export default function RootLayout() {
  useEffect(() => {
    const stopNavigation = startNotificationNavigation();
    const stopTokenRotation = startPushTokenRotationListener();
    return () => { stopNavigation(); stopTokenRotation(); };
  }, []);

  return (
    <AuthProvider>
      <CartProvider>
        <TermsGate />
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }} />
      </CartProvider>
    </AuthProvider>
  );
}
