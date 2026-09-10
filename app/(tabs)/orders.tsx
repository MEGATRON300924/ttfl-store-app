import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { ArrowUpRight, PackageOpen } from "lucide-react-native";
import { GlassCard } from "@/components/GlassCard";
import { api, ApiError } from "@/lib/api";

type Order = { id?: string; orderNumber: string; status?: string; createdAt?: string; total?: number; currency?: string };
type ResponseShape = Order[] | { orders?: Order[]; items?: Order[] };

export default function OrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);
    setError("");

    try {
      const result = await api<ResponseShape>("/api/orders/me", { auth: true });
      setOrders(Array.isArray(result) ? result : result.orders ?? result.items ?? []);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not load your orders.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="small" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} />}
    >
      <Text style={styles.eyebrow}>TTFL STORE</Text>
      <Text style={styles.title}>Your orders</Text>
      <Text style={styles.subtitle}>Keep an eye on everything you have bought.</Text>

      {!!error && (
        <GlassCard style={styles.messageCard} intensity={24}>
          <Text style={styles.error}>{error}</Text>
          <Pressable onPress={() => load()} style={styles.retryButton}>
            <Text style={styles.retry}>Try again</Text>
          </Pressable>
        </GlassCard>
      )}

      {!error && orders.length === 0 && (
        <GlassCard style={styles.emptyCard} intensity={24}>
          <View style={styles.emptyIcon}>
            <PackageOpen size={22} color="#555555" />
          </View>
          <Text style={styles.emptyTitle}>No orders yet</Text>
          <Text style={styles.emptyCopy}>Your TTFL purchases will appear here once you place an order.</Text>
        </GlassCard>
      )}

      {orders.map((order) => (
        <Pressable
          key={order.id ?? order.orderNumber}
          style={({ pressed }) => [styles.orderPressable, pressed && styles.pressed]}
          onPress={() => router.push({ pathname: "/orders/[orderNumber]", params: { orderNumber: order.orderNumber } })}
        >
          <GlassCard style={styles.card} intensity={26}>
            <View style={styles.row}>
              <View style={styles.numberWrap}>
                <Text style={styles.label}>ORDER</Text>
                <Text style={styles.number}>{order.orderNumber}</Text>
              </View>
              <View style={styles.statusPill}>
                <Text style={styles.status}>{order.status ?? "Processing"}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.bottomRow}>
              <View>
                <Text style={styles.date}>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "Date unavailable"}</Text>
                {typeof order.total === "number" && (
                  <Text style={styles.total}>{order.currency ?? "₦"}{order.total.toLocaleString()}</Text>
                )}
              </View>
              <View style={styles.openButton}>
                <ArrowUpRight size={17} color="#111111" />
              </View>
            </View>
          </GlassCard>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f7f7f7" },
  content: { paddingHorizontal: 18, paddingTop: 62, paddingBottom: 116 },
  eyebrow: { fontSize: 11, fontWeight: "800", letterSpacing: 1.4, color: "#8a8a8a", marginBottom: 5 },
  title: { fontSize: 32, lineHeight: 36, fontWeight: "800", letterSpacing: -1.1, color: "#111111" },
  subtitle: { fontSize: 14, lineHeight: 20, color: "#707070", marginTop: 6, marginBottom: 22 },
  orderPressable: { marginBottom: 10 },
  pressed: { opacity: 0.84, transform: [{ scale: 0.992 }] },
  card: { borderRadius: 20, padding: 16 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  numberWrap: { flex: 1 },
  label: { fontSize: 9, fontWeight: "800", letterSpacing: 1.3, color: "#9a9a9a", marginBottom: 4 },
  number: { fontSize: 16, fontWeight: "800", color: "#111111" },
  statusPill: { maxWidth: 135, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: "rgba(0,0,0,0.055)" },
  status: { fontSize: 11, fontWeight: "700", color: "#5f5f5f" },
  divider: { height: 1, backgroundColor: "rgba(0,0,0,0.06)", marginVertical: 15 },
  bottomRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  date: { fontSize: 12, color: "#929292" },
  total: { marginTop: 5, fontSize: 18, fontWeight: "800", color: "#111111" },
  openButton: { width: 38, height: 38, borderRadius: 13, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.8)", borderWidth: 1, borderColor: "rgba(0,0,0,0.06)" },
  messageCard: { borderRadius: 18, padding: 18, marginBottom: 12 },
  error: { color: "#b42318", fontSize: 14, lineHeight: 20 },
  retryButton: { alignSelf: "flex-start", marginTop: 10 },
  retry: { fontSize: 14, fontWeight: "800", color: "#111111" },
  emptyCard: { borderRadius: 20, padding: 22, alignItems: "center", marginTop: 10 },
  emptyIcon: { width: 46, height: 46, borderRadius: 15, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.05)", marginBottom: 13 },
  emptyTitle: { fontSize: 17, fontWeight: "800", color: "#111111" },
  emptyCopy: { maxWidth: 290, marginTop: 6, textAlign: "center", fontSize: 13, lineHeight: 19, color: "#777777" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#f7f7f7" },
});
