import { useLocalSearchParams, Stack } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { api, ApiError } from "@/lib/api";

type Order = { orderNumber: string; status?: string; createdAt?: string; total?: number; currency?: string; shippingAddress?: any; vendorOrders?: Array<{ id: string; vendor?: { name?: string }; status?: string }> };
export default function OrderDetailScreen() {
  const { orderNumber } = useLocalSearchParams<{ orderNumber: string }>();
  const [order, setOrder] = useState<Order | null>(null); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  useEffect(() => { if (!orderNumber) return; api<Order>(`/api/orders/${encodeURIComponent(orderNumber)}`, { auth: true }).then(setOrder).catch((err) => setError(err instanceof ApiError ? err.message : "Could not load this order.")).finally(() => setLoading(false)); }, [orderNumber]);
  return <View style={styles.screen}><Stack.Screen options={{ headerShown: true, title: "Order" }} />{loading ? <View style={styles.center}><ActivityIndicator size="large" /></View> : error ? <View style={styles.center}><Text style={styles.error}>{error}</Text></View> : order ? <ScrollView contentContainerStyle={styles.content}><Text style={styles.label}>ORDER</Text><Text style={styles.number}>{order.orderNumber}</Text><View style={styles.card}><Text style={styles.label}>STATUS</Text><Text style={styles.status}>{order.status ?? "Processing"}</Text>{order.createdAt && <Text style={styles.muted}>Placed {new Date(order.createdAt).toLocaleString()}</Text>}{typeof order.total === "number" && <Text style={styles.total}>{order.currency ?? "₦"}{order.total.toLocaleString()}</Text>}</View><Pressable style={styles.button} onPress={() => router.push({ pathname: "/orders/track", params: { orderNumber: order.orderNumber } })}><Text style={styles.buttonText}>Track order</Text></Pressable></ScrollView> : null}</View>;
}
const styles = StyleSheet.create({ screen: { flex: 1, backgroundColor: "#fff" }, content: { padding: 20 }, center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20 }, label: { color: "#9ca3af", fontSize: 11, fontWeight: "800", letterSpacing: 1.2 }, number: { fontSize: 28, fontWeight: "800", color: "#111", marginTop: 5 }, card: { borderWidth: 1, borderColor: "#ededed", borderRadius: 18, padding: 18, marginTop: 24 }, status: { fontSize: 19, fontWeight: "800", marginTop: 7 }, muted: { color: "#6b7280", marginTop: 7 }, total: { fontSize: 21, fontWeight: "800", marginTop: 16 }, button: { height: 54, borderRadius: 14, backgroundColor: "#111", alignItems: "center", justifyContent: "center", marginTop: 14 }, buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 }, error: { color: "#dc2626" }
});
