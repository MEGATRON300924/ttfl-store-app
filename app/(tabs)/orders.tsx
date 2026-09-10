import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { api, ApiError } from "@/lib/api";

type Order = { id?: string; orderNumber: string; status?: string; createdAt?: string; total?: number; currency?: string };
type ResponseShape = Order[] | { orders?: Order[]; items?: Order[] };

export default function OrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]); const [loading, setLoading] = useState(true); const [refreshing, setRefreshing] = useState(false); const [error, setError] = useState("");
  const load = useCallback(async (refresh = false) => { if (refresh) setRefreshing(true); else setLoading(true); setError(""); try { const result = await api<ResponseShape>("/api/orders/me", { auth: true }); setOrders(Array.isArray(result) ? result : result.orders ?? result.items ?? []); } catch (err) { setError(err instanceof ApiError ? err.message : "Could not load your orders."); } finally { setLoading(false); setRefreshing(false); } }, []);
  useEffect(() => { load(); }, [load]);
  if (loading) return <View style={styles.center}><ActivityIndicator size="large" /></View>;
  return <ScrollView style={styles.screen} contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} />}>
    <Text style={styles.title}>Your orders</Text><Text style={styles.subtitle}>Track and manage your TTFL purchases.</Text>
    {!!error && <View style={styles.errorBox}><Text style={styles.error}>{error}</Text><Pressable onPress={() => load()}><Text style={styles.retry}>Try again</Text></Pressable></View>}
    {!error && orders.length === 0 && <View style={styles.empty}><Text style={styles.emptyTitle}>No orders yet</Text><Text style={styles.emptyCopy}>Your TTFL purchases will appear here.</Text></View>}
    {orders.map((order) => <Pressable key={order.id ?? order.orderNumber} style={styles.card} onPress={() => router.push({ pathname: "/orders/[orderNumber]", params: { orderNumber: order.orderNumber } })}><View style={styles.row}><Text style={styles.number}>{order.orderNumber}</Text><Text style={styles.status}>{order.status ?? "Processing"}</Text></View><Text style={styles.date}>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : ""}</Text>{typeof order.total === "number" && <Text style={styles.total}>{order.currency ?? "₦"}{order.total.toLocaleString()}</Text>}<Text style={styles.track}>View order ›</Text></Pressable>)}
  </ScrollView>;
}
const styles = StyleSheet.create({ screen: { flex: 1, backgroundColor: "#fff" }, content: { padding: 20, paddingTop: 60, paddingBottom: 30 }, title: { fontSize: 30, fontWeight: "800", color: "#111" }, subtitle: { color: "#6b7280", marginTop: 5, marginBottom: 24 }, center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#fff" }, card: { borderWidth: 1, borderColor: "#ededed", borderRadius: 17, padding: 16, marginBottom: 10 }, row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }, number: { fontWeight: "800", color: "#111" }, status: { fontSize: 12, fontWeight: "700", color: "#6b7280" }, date: { color: "#9ca3af", fontSize: 12, marginTop: 6 }, total: { fontSize: 18, fontWeight: "800", marginTop: 10, color: "#111" }, track: { color: "#111", fontWeight: "700", marginTop: 12 }, errorBox: { backgroundColor: "#fef2f2", padding: 14, borderRadius: 14, marginBottom: 16 }, error: { color: "#b91c1c" }, retry: { fontWeight: "700", marginTop: 8 }, empty: { alignItems: "center", marginTop: 80 }, emptyTitle: { fontSize: 20, fontWeight: "800" }, emptyCopy: { color: "#6b7280", marginTop: 6 }
});
