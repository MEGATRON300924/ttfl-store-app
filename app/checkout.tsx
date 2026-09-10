import { Ionicons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import { router, Stack } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { GlassCard } from "@/components/GlassCard";
import { ApiError, api } from "@/lib/api";
import { DeliveryAddress, useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";

export default function CheckoutScreen() {
  const { items, subtotal, clear, deliveryAddress, setDeliveryAddress } = useCart();
  const { user } = useAuth();
  const [name, setName] = useState(deliveryAddress?.name ?? (user ? `${user.firstName} ${user.lastName}`.trim() : ""));
  const [phone, setPhone] = useState(deliveryAddress?.phone ?? user?.phone ?? "");
  const [line1, setLine1] = useState(deliveryAddress?.line1 ?? "");
  const [line2, setLine2] = useState(deliveryAddress?.line2 ?? "");
  const [city, setCity] = useState(deliveryAddress?.city ?? "");
  const [state, setState] = useState(deliveryAddress?.state ?? "");
  const [country, setCountry] = useState(deliveryAddress?.country ?? "Nigeria");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!deliveryAddress) return;
    setName(deliveryAddress.name);
    setPhone(deliveryAddress.phone);
    setLine1(deliveryAddress.line1);
    setLine2(deliveryAddress.line2 ?? "");
    setCity(deliveryAddress.city);
    setState(deliveryAddress.state);
    setCountry(deliveryAddress.country);
  }, [deliveryAddress]);

  const addressComplete = Boolean(name.trim() && phone.trim() && line1.trim() && city.trim() && state.trim());

  function saveAddress() {
    setDeliveryAddress({
      name: name.trim(), phone: phone.trim(), line1: line1.trim(),
      ...(line2.trim() ? { line2: line2.trim() } : {}),
      city: city.trim(), state: state.trim(), country: country.trim() || "Nigeria",
    });
  }

  async function submit() {
    setError("");
    if (!items.length) { setError("Your cart is empty."); return; }
    if (!addressComplete) { setError("Complete the required delivery details first."); return; }
    saveAddress();
    setBusy(true);
    try {
      const result = await api<{ order: { orderNumber: string; paymentReference?: string | null }; checkoutUrl: string | null }>("/api/orders/checkout", {
        method: "POST", auth: true,
        body: JSON.stringify({ items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })), delivery: { name: name.trim(), phone: phone.trim(), line1: line1.trim(), ...(line2.trim() ? { line2: line2.trim() } : {}), city: city.trim(), state: state.trim(), country: country.trim() || "Nigeria" } }),
      });
      if (result.checkoutUrl) {
        await Linking.openURL(result.checkoutUrl);
        router.replace({ pathname: "/payment/pending", params: { orderNumber: result.order.orderNumber, reference: result.order.paymentReference ?? "" } });
      } else {
        clear();
        router.replace({ pathname: "/orders/[orderNumber]", params: { orderNumber: result.order.orderNumber } });
      }
    } catch (err) { setError(err instanceof ApiError ? err.message : "Could not start checkout."); }
    finally { setBusy(false); }
  }

  function addAnotherAddress() {
    setName(user ? `${user.firstName} ${user.lastName}`.trim() : "");
    setPhone(user?.phone ?? "");
    setLine1(""); setLine2(""); setCity(""); setState(""); setCountry("Nigeria");
    setError("");
  }

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <Stack.Screen options={{ headerShown: true, title: "Checkout" }} />
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>TTFL STORE</Text><Text style={styles.title}>Checkout</Text><Text style={styles.subtitle}>Where should we deliver your order?</Text>
        {deliveryAddress && addressComplete && <GlassCard style={styles.savedCard} intensity={22}><View style={styles.savedHeader}><View style={styles.savedIcon}><Ionicons name="location" size={18} color="#111" /></View><View style={styles.savedText}><Text style={styles.savedTitle}>Delivery address</Text><Text style={styles.savedAddress}>{deliveryAddress.line1}, {deliveryAddress.city}, {deliveryAddress.state}</Text></View><Ionicons name="checkmark-circle" size={20} color="#111" /></View><Pressable onPress={addAnotherAddress} style={styles.anotherButton}><Ionicons name="add" size={17} color="#111" /><Text style={styles.anotherText}>Add another address</Text></Pressable></GlassCard>}
        <GlassCard style={styles.card} intensity={24}><Text style={styles.section}>{deliveryAddress && addressComplete ? "Selected address" : "Delivery details"}</Text><Field label="Full name" value={name} onChangeText={setName} placeholder="Your full name" /><Field label="Phone number" value={phone} onChangeText={setPhone} placeholder="080..." keyboardType="phone-pad" /><Field label="Address" value={line1} onChangeText={setLine1} placeholder="Street address" /><Field label="Apartment / landmark (optional)" value={line2} onChangeText={setLine2} placeholder="Optional" optional /><View style={styles.row}><View style={styles.half}><Field label="City" value={city} onChangeText={setCity} placeholder="City" /></View><View style={styles.half}><Field label="State" value={state} onChangeText={setState} placeholder="State" /></View></View><Field label="Country" value={country} onChangeText={setCountry} placeholder="Country" /></GlassCard>
        {!!error && <Text style={styles.error}>{error}</Text>}
        <GlassCard dark style={styles.summary} intensity={26}><Text style={styles.summaryEyebrow}>ORDER TOTAL</Text><View style={styles.totalRow}><Text style={styles.totalLabel}>Subtotal</Text><Text style={styles.totalValue}>₦{subtotal.toLocaleString()}</Text></View><Text style={styles.note}>Final delivery charges, if applicable, are handled by the TTFL checkout flow.</Text><Pressable disabled={busy} onPress={submit} style={({ pressed }) => [styles.payButton, pressed && styles.pressed, busy && styles.disabled]}>{busy ? <ActivityIndicator color="#111" /> : <><Text style={styles.payText}>Continue to payment</Text><Ionicons name="arrow-forward" size={18} color="#111" /></>}</Pressable></GlassCard>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({ label, value, onChangeText, placeholder, keyboardType, optional }: { label: string; value: string; onChangeText: (value: string) => void; placeholder: string; keyboardType?: "default" | "phone-pad"; optional?: boolean }) {
  return <View style={styles.field}><Text style={styles.fieldLabel}>{label}</Text><TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor="#aaa" keyboardType={keyboardType} style={styles.input} /></View>;
}

const styles = StyleSheet.create({ screen: { flex: 1, backgroundColor: "#f7f7f7" }, content: { padding: 18, paddingBottom: 42 }, eyebrow: { fontSize: 11, fontWeight: "800", letterSpacing: 1.4, color: "#8a8a8a" }, title: { marginTop: 5, fontSize: 31, fontWeight: "800", letterSpacing: -1, color: "#111" }, subtitle: { marginTop: 6, marginBottom: 20, fontSize: 14, color: "#707070" }, savedCard: { padding: 16, borderRadius: 20, marginBottom: 12 }, savedHeader: { flexDirection: "row", alignItems: "center" }, savedIcon: { width: 40, height: 40, borderRadius: 13, backgroundColor: "rgba(0,0,0,0.05)", alignItems: "center", justifyContent: "center" }, savedText: { flex: 1, marginHorizontal: 12 }, savedTitle: { fontSize: 14, fontWeight: "800", color: "#111" }, savedAddress: { marginTop: 3, fontSize: 12, color: "#777" }, anotherButton: { marginTop: 13, height: 44, borderRadius: 13, backgroundColor: "rgba(0,0,0,0.045)", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 }, anotherText: { fontSize: 13, fontWeight: "800", color: "#111" }, card: { padding: 18, borderRadius: 21 }, section: { fontSize: 17, fontWeight: "800", color: "#111", marginBottom: 4 }, field: { marginTop: 13 }, fieldLabel: { fontSize: 11, fontWeight: "700", color: "#777", marginBottom: 6 }, input: { height: 50, borderRadius: 14, borderWidth: 1, borderColor: "rgba(0,0,0,0.07)", backgroundColor: "rgba(255,255,255,0.72)", paddingHorizontal: 14, color: "#111", fontSize: 14 }, row: { flexDirection: "row", gap: 10 }, half: { flex: 1 }, error: { color: "#b42318", fontSize: 13, lineHeight: 19, marginTop: 12 }, summary: { borderRadius: 22, padding: 20, marginTop: 12 }, summaryEyebrow: { color: "#999", fontSize: 10, fontWeight: "800", letterSpacing: 1.2 }, totalRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 14 }, totalLabel: { color: "#ccc" }, totalValue: { color: "#fff", fontSize: 21, fontWeight: "800" }, note: { color: "#9f9f9f", fontSize: 12, lineHeight: 18, marginTop: 8 }, payButton: { height: 50, borderRadius: 14, backgroundColor: "#fff", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 18 }, payText: { color: "#111", fontWeight: "800" }, pressed: { opacity: 0.82 }, disabled: { opacity: 0.55 } });
