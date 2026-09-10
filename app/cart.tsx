import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { GlassCard } from "@/components/GlassCard";
import { useCart } from "@/lib/cart";

export default function CartScreen() {
  const { items, subtotal, updateQuantity, removeItem, clear } = useCart();
  const currency = items[0]?.currency ?? "₦";

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ headerShown: true, title: "Cart" }} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.headerRow}><View><Text style={styles.eyebrow}>TTFL STORE</Text><Text style={styles.title}>Your cart</Text></View>{items.length > 0 && <Pressable onPress={clear}><Text style={styles.clear}>Clear</Text></Pressable>}</View>

        {items.length === 0 ? (
          <GlassCard style={styles.emptyCard} intensity={24}>
            <View style={styles.emptyIcon}><Ionicons name="bag-outline" size={25} color="#555" /></View>
            <Text style={styles.emptyTitle}>Your cart is empty</Text>
            <Text style={styles.emptyCopy}>Add products from the marketplace and they will stay here until you are ready to check out.</Text>
            <Pressable style={styles.shopButton} onPress={() => router.replace("/(tabs)/explore")}><Text style={styles.shopText}>Explore marketplace</Text><Ionicons name="arrow-forward" size={17} color="#111" /></Pressable>
          </GlassCard>
        ) : (
          <>
            {items.map((item) => (
              <GlassCard key={item.productId} style={styles.itemCard} intensity={24}>
                <View style={styles.itemRow}>
                  <View style={styles.imageBox}>{item.imageUrl ? <Image source={{ uri: item.imageUrl }} style={styles.image} resizeMode="cover" /> : <Text style={styles.initial}>{item.name[0]?.toUpperCase()}</Text>}</View>
                  <View style={styles.itemInfo}><Text style={styles.itemName} numberOfLines={2}>{item.name}</Text><Text style={styles.itemPrice}>{item.currency}{item.price.toLocaleString()}</Text><Text style={styles.stock}>{item.stock} available</Text></View>
                  <Pressable onPress={() => removeItem(item.productId)} hitSlop={8}><Ionicons name="trash-outline" size={19} color="#999" /></Pressable>
                </View>
                <View style={styles.itemBottom}><View style={styles.quantity}><Pressable onPress={() => updateQuantity(item.productId, item.quantity - 1)} style={styles.quantityButton}><Ionicons name="remove" size={17} color="#111" /></Pressable><Text style={styles.quantityText}>{item.quantity}</Text><Pressable onPress={() => updateQuantity(item.productId, item.quantity + 1)} style={styles.quantityButton}><Ionicons name="add" size={17} color="#111" /></Pressable></View><Text style={styles.lineTotal}>{item.currency}{(item.price * item.quantity).toLocaleString()}</Text></View>
              </GlassCard>
            ))}

            <GlassCard dark style={styles.summary} intensity={26}>
              <Text style={styles.summaryEyebrow}>ORDER SUMMARY</Text>
              <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Subtotal</Text><Text style={styles.summaryValue}>{currency}{subtotal.toLocaleString()}</Text></View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryRow}><Text style={styles.summaryTotalLabel}>Total</Text><Text style={styles.summaryTotal}>{currency}{subtotal.toLocaleString()}</Text></View>
              <Text style={styles.summaryNote}>Delivery and any applicable fees are calculated at checkout.</Text>
              <Pressable style={styles.checkoutButton} onPress={() => router.push("/checkout")}><Text style={styles.checkoutText}>Continue to checkout</Text><Ionicons name="arrow-forward" size={18} color="#111" /></Pressable>
            </GlassCard>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f7f7f7" }, content: { padding: 18, paddingBottom: 42 }, headerRow: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", paddingTop: 4, marginBottom: 20 }, eyebrow: { fontSize: 11, fontWeight: "800", letterSpacing: 1.4, color: "#8a8a8a" }, title: { marginTop: 5, fontSize: 31, fontWeight: "800", letterSpacing: -1, color: "#111" }, clear: { color: "#777", fontWeight: "700", paddingBottom: 4 },
  itemCard: { borderRadius: 20, padding: 14, marginBottom: 10 }, itemRow: { flexDirection: "row", alignItems: "center" }, imageBox: { width: 76, height: 76, borderRadius: 15, overflow: "hidden", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.045)" }, image: { width: "100%", height: "100%" }, initial: { fontSize: 25, fontWeight: "800", color: "#aaa" }, itemInfo: { flex: 1, marginLeft: 12, marginRight: 10 }, itemName: { fontSize: 14, lineHeight: 19, fontWeight: "750", color: "#111" }, itemPrice: { marginTop: 5, fontSize: 15, fontWeight: "800", color: "#111" }, stock: { marginTop: 2, fontSize: 11, color: "#999" }, itemBottom: { marginTop: 14, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, quantity: { height: 38, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.75)", borderWidth: 1, borderColor: "rgba(0,0,0,0.06)", flexDirection: "row", alignItems: "center", paddingHorizontal: 2 }, quantityButton: { width: 34, height: 34, alignItems: "center", justifyContent: "center" }, quantityText: { minWidth: 22, textAlign: "center", fontWeight: "800" }, lineTotal: { fontSize: 15, fontWeight: "800", color: "#111" },
  summary: { borderRadius: 23, padding: 20, marginTop: 8 }, summaryEyebrow: { color: "#999", fontSize: 10, fontWeight: "800", letterSpacing: 1.2 }, summaryRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 14 }, summaryLabel: { color: "#c7c7c7", fontSize: 14 }, summaryValue: { color: "#fff", fontWeight: "700" }, summaryDivider: { height: 1, backgroundColor: "rgba(255,255,255,0.12)", marginTop: 15 }, summaryTotalLabel: { color: "#fff", fontSize: 16, fontWeight: "800" }, summaryTotal: { color: "#fff", fontSize: 22, fontWeight: "800" }, summaryNote: { color: "#9f9f9f", fontSize: 12, lineHeight: 18, marginTop: 8 }, checkoutButton: { height: 50, borderRadius: 14, backgroundColor: "#fff", marginTop: 18, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 }, checkoutText: { color: "#111", fontWeight: "800" },
  emptyCard: { borderRadius: 22, padding: 24, alignItems: "center", marginTop: 18 }, emptyIcon: { width: 54, height: 54, borderRadius: 17, backgroundColor: "rgba(0,0,0,0.05)", alignItems: "center", justifyContent: "center" }, emptyTitle: { marginTop: 15, fontSize: 19, fontWeight: "800", color: "#111" }, emptyCopy: { marginTop: 7, maxWidth: 300, textAlign: "center", fontSize: 13, lineHeight: 20, color: "#777" }, shopButton: { height: 46, paddingHorizontal: 16, borderRadius: 14, marginTop: 18, backgroundColor: "#111", flexDirection: "row", alignItems: "center", gap: 8 }, shopText: { color: "#fff", fontWeight: "800" },
});
