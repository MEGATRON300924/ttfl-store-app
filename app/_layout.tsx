import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { AuthProvider } from "@/lib/auth";
import { CartProvider } from "@/lib/cart";
import { startNotificationNavigation } from "@/lib/notifications";

export default function RootLayout() {
  useEffect(() => startNotificationNavigation(), []);

  return (
    <AuthProvider>
      <CartProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }} />
      </CartProvider>
    </AuthProvider>
  );
}
