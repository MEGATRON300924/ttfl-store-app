import { Ionicons } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { GlassCard } from "@/components/GlassCard";
import { api, ApiError } from "@/lib/api";

type PaymentOrder = { orderNumber: string; paymentStatus?: string; status?: string };

export default function PaymentPendingScreen() {
  const { orderNumber, reference } = useLocalSearchParams<{ orderNumber: string; reference?: string }>();
  const [status, setStatus] = useState("PENDING");
  const [checking, setChecking] = useState(Boolean(reference));

  useEffect(() => {
    if (!reference) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const check = async () => {
      try {
        const result = await api<{ order: PaymentOrder }>(`/api/orders/verify/${encodeURIComponent(reference)}`);
        if (cancelled) return;
        const nextStatus = String(result.order.paymentStatus ?? result.order.status ?? "PENDING").toUpperCase();
        setStatus(nextStatus);
        if (nextStatus !== "PAID") timer = setTimeout(check, 10000);
        else setChecking(false);
      } catch (error) {
        if (cancelled) return;
        if (error instanceof ApiError && error.status === 404) setStatus("NOT_FOUND");
        timer = setTimeout(check, 10000);
      }
    };

    check();
    return () => { cancelled = true; if (timer) clearTimeout(timer); };
  }, [reference]);

  const paid = status === "PAID";
  const failed = ["FAILED", "CANCELLED", "ABANDONED"].includes(status);

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ headerShown: true, title: "Payment" }} />
      <GlassCard style={styles.card} intensity={28}>
        <View style={[styles.icon, paid && styles.successIcon, failed && styles.failedIcon]}><Ionicons name={paid ? "checkmark" : failed ? "close" : "card-outline"} size={30} color="#111" /></View>
        <Text style={styles.title}>{paid ? "Payment confirmed" : failed ? "Payment not completed" : "Payment started"}</Text>
        <Text style={styles.copy}>{paid ? "Your payment has been confirmed and your TTFL order is now moving through the normal order and tracking flow." : failed ? "The payment was not completed. You can return to the order and try again if the order is still awaiting payment." : "Your payment page has opened. TTFL is checking for confirmation automatically, so you do not need to keep refreshing."}</Text>
        <Text style={styles.order}>Order {orderNumber}</Text>
        {!paid && !failed && checking && <View style={styles.checking}><ActivityIndicator size="small" /><Text style={styles.checkingText}>Checking payment status…</Text></View>}
        <Pressable style={styles.button} onPress={() => router.replace({ pathname: "/orders/[orderNumber]", params: { orderNumber } })}><Text style={styles.buttonText}>View order</Text><Ionicons name="arrow-forward" size={17} color="#fff" /></Pressable>
        <Pressable onPress={() => router.replace("/(tabs)/home")}><Text style={styles.home}>Back to TTFL Store</Text></Pressable>
      </GlassCard>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f7f7f7", padding: 18, justifyContent: "center" }, card: { borderRadius: 25, padding: 24, alignItems: "center" }, icon: { width: 62, height: 62, borderRadius: 20, backgroundColor: "rgba(0,0,0,0.05)", alignItems: "center", justifyContent: "center" }, successIcon: { backgroundColor: "rgba(16,185,129,0.14)" }, failedIcon: { backgroundColor: "rgba(180,35,24,0.10)" }, title: { marginTop: 17, fontSize: 25, fontWeight: "800", color: "#111", textAlign: "center" }, copy: { marginTop: 8, maxWidth: 320, textAlign: "center", fontSize: 14, lineHeight: 21, color: "#707070" }, order: { marginTop: 14, fontWeight: "800", color: "#111" }, checking: { marginTop: 14, flexDirection: "row", alignItems: "center", gap: 8 }, checkingText: { fontSize: 12, color: "#777" }, button: { width: "100%", height: 52, borderRadius: 15, backgroundColor: "#111", marginTop: 20, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 }, buttonText: { color: "#fff", fontWeight: "800" }, home: { marginTop: 17, color: "#777", fontWeight: "700" }
});
