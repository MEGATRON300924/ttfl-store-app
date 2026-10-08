import { Tabs } from "expo-router";
import { useAuth } from "@/lib/auth";
import { LiquidGlassNav } from "@/components/LiquidGlassNav";

export default function TabsLayout() {
  const { user } = useAuth();
  return <>
    <Tabs screenOptions={{ headerShown: false, tabBarStyle: { display: "none" } }}>
      <Tabs.Screen name="home" options={{ title: "Home" }} />
      <Tabs.Screen name="explore" options={{ title: "Shop" }} />
      <Tabs.Screen name="orders" options={{ title: "Orders" }} />
      <Tabs.Screen name="account" options={{ title: "Account" }} />
    </Tabs>
    <LiquidGlassNav isVendor={user?.role === "VENDOR"} isLoggedIn={!!user} />
  </>;
}