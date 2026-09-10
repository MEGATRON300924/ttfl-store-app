import { Ionicons } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { GlassCard } from "@/components/GlassCard";
import { api, ApiError } from "@/lib/api";

type VendorOrder = { id: string; vendor?: { name?: string }; status?: string };
type Address = { name?: string; phone?: string; line1?: string; line2?: string; city?: string; state?: string; country?: string };
type Order = {
  orderNumber: string;
  status?: string;
  createdAt?: string;
  total?: number;
  currency?: string;
  shippingAddress?: Address | null;
  vendorOrders?: VendorOrder[];
};

export default function OrderDetailScreen() {
  const { orderNumber } = useLocalSearchParams<{ orderNumber: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!orderNumber) return;
    setLoading(true);
    api<Order>(`/api/orders/${encodeURIComponent(orderNumber)}`, { auth: true })
      .then(setOrder)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Could not load this order."))
      .finally(() => setLoading(false));
  }, [orderNumber]);

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="small" /></View>;
  }

  if (error || !order) {
    return (
      <View style={styles.center}>
        <Ionicons name="alert-circle-outline" size={28} color="#b42318" />
        <Text style={styles.error}>{error || "Order not found."}</Text>
        <Pressable style={styles.retry} onPress={() => router.back()}><Text style={styles.retryText}>Go back</Text></Pressable>
      </View>
    );
  }

  const address = order.shippingAddress;
  const vendors = order.vendorOrders ?? [];

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ headerShown: true, title: "Order" }} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>ORDER</Text>
        <Text style={styles.number}>{order.orderNumber}</Text>

        <GlassCard dark style={styles.hero} intensity={28}>
          <Text style={styles.heroLabel}>CURRENT STATUS</Text>
          <Text style={styles.heroStatus}>{formatStatus(order.status)}</Text>
          {order.createdAt && <Text style={styles.heroMuted}>Placed {new Date(order.createdAt).toLocaleString()}</Text>}
          {typeof order.total === "number" && (
            <View style={styles.totalRow}>
              <Text style={styles.heroMuted}>Order total</Text>
              <Text style={styles.heroTotal}>{order.currency ?? "₦"}{order.total.toLocaleString()}</Text>
            </View>
          )}
        </GlassCard>

        <Pressable style={({ pressed }) => [styles.trackButton, pressed && styles.pressed]} onPress={() => router.push({ pathname: "/orders/track", params: { orderNumber: order.orderNumber } })}>
          <Ionicons name="navigate-outline" size={19} color="#fff" />
          <Text style={styles.trackText}>Track order</Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" />
        </Pressable>

        {vendors.length > 0 && (
          <>
            <Text style={styles.section}>VENDORS</Text>
            <GlassCard style={styles.card} intensity={22}>
              {vendors.map((vendor, index) => (
                <View key={vendor.id} style={[styles.vendor, index < vendors.length - 1 && styles.vendorBorder]}>
                  <View style={styles.vendorIcon}><Ionicons name="storefront-outline" size={18} color="#111" /></View>
                  <View style={styles.vendorCopy}>
                    <Text style={styles.vendorName}>{vendor.vendor?.name ?? "TTFL vendor"}</Text>
                    <Text style={styles.vendorStatus}>{formatStatus(vendor.status)}</Text>
                  </View>
                </View>
              ))}
            </GlassCard>
          </>
        )}

        {address && (
          <>
            <Text style={styles.section}>DELIVERY</Text>
            <GlassCard style={styles.card} intensity={22}>
              <View style={styles.addressHeader}>
                <Ionicons name="location-outline" size={18} color="#111" />
                <Text style={styles.addressTitle}>{address.name || "Delivery address"}</Text>
              </View>
              {address.phone && <Text style={styles.addressLine}>{address.phone}</Text>}
              {address.line1 && <Text style={styles.addressLine}>{address.line1}</Text>}
              {address.line2 && <Text style={styles.addressLine}>{address.line2}</Text>}
              <Text style={styles.addressLine}>{[address.city, address.state, address.country].filter(Boolean).join(", ")}</Text>
            </GlassCard>
          </>
        )}
      </ScrollView>
    </View>
  );
}

function formatStatus(status?: string) {
  if (!status) return "Processing";
  return status.toLowerCase().replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f7f7f7" },
  content: { padding: 18, paddingBottom: 42 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, backgroundColor: "#f7f7f7" },
  eyebrow: { fontSize: 10, fontWeight: "800", letterSpacing: 1.4, color: "#999", marginTop: 4 },
  number: { fontSize: 29, lineHeight: 35, fontWeight: "800", color: "#111", letterSpacing: -0.9, marginTop: 4 },
  hero: { borderRadius: 23, padding: 20, marginTop: 20 },
  heroLabel: { color: "#999", fontSize: 10, fontWeight: "800", letterSpacing: 1.2 },
  heroStatus: { color: "#fff", fontSize: 25, fontWeight: "800", marginTop: 7 },
  heroMuted: { color: "#a8a8a8", fontSize: 12, marginTop: 5 },
  totalRow: { borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.1)", marginTop: 17, paddingTop: 14, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  heroTotal: { color: "#fff", fontSize: 18, fontWeight: "800" },
  trackButton: { height: 54, borderRadius: 16, backgroundColor: "#111", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 9, marginTop: 12 },
  trackText: { color: "#fff", fontSize: 14, fontWeight: "800", flex: 0 },
  pressed: { opacity: 0.78, transform: [{ scale: 0.99 }] },
  section: { fontSize: 10, fontWeight: "800", letterSpacing: 1.3, color: "#999", marginTop: 24, marginBottom: 8, marginLeft: 3 },
  card: { borderRadius: 20, paddingHorizontal: 16 },
  vendor: { minHeight: 68, flexDirection: "row", alignItems: "center" },
  vendorBorder: { borderBottomWidth: 1, borderBottomColor: "rgba(0,0,0,0.06)" },
  vendorIcon: { width: 40, height: 40, borderRadius: 14, backgroundColor: "rgba(0,0,0,0.05)", alignItems: "center", justifyContent: "center" },
  vendorCopy: { flex: 1, marginLeft: 12 },
  vendorName: { fontSize: 14, fontWeight: "800", color: "#111" },
  vendorStatus: { fontSize: 12, color: "#888", marginTop: 3 },
  addressHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 9 },
  addressTitle: { fontSize: 14, fontWeight: "800", color: "#111" },
  addressLine: { fontSize: 13, lineHeight: 20, color: "#707070" },
  error: { color: "#b42318", textAlign: "center", marginTop: 10, lineHeight: 20 },
  retry: { marginTop: 14, height: 44, paddingHorizontal: 18, borderRadius: 13, backgroundColor: "#111", alignItems: "center", justifyContent: "center" },
  retryText: { color: "#fff", fontWeight: "800" },
});
