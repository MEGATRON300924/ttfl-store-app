import { Ionicons } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { GlassCard } from "@/components/GlassCard";
import { api, ApiError } from "@/lib/api";
import { useCart } from "@/lib/cart";

type Product = {
  id: string; publicProductId?: string; name: string; slug: string; description: string; price: string | number; previousPrice?: string | number | null;
  currency?: string; condition?: string; stock: number; status?: string; sellingMethod?: "CHECKOUT" | "EXTERNAL_LINK" | "WHATSAPP";
  location?: string | null; avgRating?: string | null; reviewCount?: number; specifications?: Record<string, string> | null;
  images?: Array<{ id: string; url: string; position: number; isPrimary: boolean }>;
  category?: { name: string }; vendor?: { storeName: string; storeSlug: string; verified: boolean; location: string | null };
};

type ProductResponse = { product: Product } | Product | { items?: Product[]; products?: Product[] };

export default function ProductDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { addItem, count } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError("");
    api<ProductResponse>(`/api/products/${encodeURIComponent(slug)}`)
      .then((result) => {
        if ("product" in result) setProduct(result.product);
        else if ("id" in result) setProduct(result);
        else {
          const items = result.items ?? result.products ?? [];
          setProduct(items.find((item) => item.slug === slug) ?? items[0] ?? null);
        }
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Could not load this product."))
      .finally(() => setLoading(false));
  }, [slug]);

  const price = useMemo(() => Number(product?.price ?? 0), [product]);
  const previousPrice = Number(product?.previousPrice ?? 0);
  const image = product?.images?.slice().sort((a, b) => a.position - b.position)[0]?.url;
  const unavailable = !product || product.stock <= 0 || product.status === "OUT_OF_STOCK" || product.sellingMethod !== "CHECKOUT";

  function addToCart() {
    if (!product || unavailable) return;
    addItem({ productId: product.id, slug: product.slug, name: product.name, price, currency: product.currency ?? "₦", imageUrl: image, stock: product.stock, sellingMethod: product.sellingMethod ?? "CHECKOUT" }, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  }

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ headerShown: true, title: "Product", headerBackTitle: "Back" }} />
      {loading ? <View style={styles.center}><ActivityIndicator size="small" /></View> : error || !product ? (
        <View style={styles.center}><Text style={styles.error}>{error || "Product not found."}</Text></View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <View style={styles.imageShell}>
            {image ? <Image source={{ uri: image }} style={styles.heroImage} resizeMode="cover" /> : <Text style={styles.imageInitial}>{product.name[0]?.toUpperCase()}</Text>}
            <Pressable onPress={() => router.push("/cart")} style={styles.cartButton}>
              <Ionicons name="bag-outline" size={20} color="#111" />
              {count > 0 && <View style={styles.badge}><Text style={styles.badgeText}>{count > 9 ? "9+" : count}</Text></View>}
            </Pressable>
          </View>

          <View style={styles.metaRow}><Text style={styles.category}>{product.category?.name ?? "Marketplace"}</Text>{product.condition && <Text style={styles.condition}>{product.condition}</Text>}</View>
          <Text style={styles.title}>{product.name}</Text>
          <Text style={styles.price}>{product.currency ?? "₦"}{price.toLocaleString()}</Text>
          {previousPrice > price && <Text style={styles.previous}>{product.currency ?? "₦"}{previousPrice.toLocaleString()}</Text>}
          {product.avgRating && <View style={styles.rating}><Ionicons name="star" size={16} color="#111" /><Text style={styles.ratingText}>{product.avgRating} · {product.reviewCount ?? 0} reviews</Text></View>}

          <Pressable onPress={() => product.vendor?.storeSlug && router.push({ pathname: "/vendor/[slug]", params: { slug: product.vendor.storeSlug } })} disabled={!product.vendor?.storeSlug}>
            <GlassCard style={styles.vendorCard} intensity={22}>
              <View style={styles.vendorIcon}><Ionicons name={product.vendor?.verified ? "checkmark-circle" : "storefront-outline"} size={20} color="#111" /></View>
              <View style={styles.vendorText}><Text style={styles.vendorName}>{product.vendor?.storeName ?? "TTFL Store"}</Text><Text style={styles.vendorLocation}>{product.vendor?.location ?? product.location ?? "Marketplace seller"}</Text></View>
              {product.vendor?.storeSlug && <Ionicons name="chevron-forward" size={18} color="#999" />}
            </GlassCard>
          </Pressable>

          <GlassCard style={styles.infoCard} intensity={22}>
            <Text style={styles.sectionTitle}>About this product</Text>
            <Text style={styles.description}>{product.description || "No description provided."}</Text>
            {product.specifications && Object.keys(product.specifications).length > 0 && <View style={styles.specs}>{Object.entries(product.specifications).map(([key, value]) => <View key={key} style={styles.specRow}><Text style={styles.specKey}>{key}</Text><Text style={styles.specValue}>{value}</Text></View>)}</View>}
          </GlassCard>

          <View style={styles.purchaseRow}>
            <View style={styles.quantity}><Pressable onPress={() => setQuantity((value) => Math.max(1, value - 1))} style={styles.quantityButton}><Ionicons name="remove" size={18} color="#111" /></Pressable><Text style={styles.quantityText}>{quantity}</Text><Pressable onPress={() => setQuantity((value) => Math.min(product.stock, value + 1))} style={styles.quantityButton}><Ionicons name="add" size={18} color="#111" /></Pressable></View>
            <Pressable onPress={addToCart} disabled={unavailable} style={({ pressed }) => [styles.addButton, pressed && styles.pressed, unavailable && styles.disabled]}><Ionicons name={added ? "checkmark" : "bag-add-outline"} size={19} color="#fff" /><Text style={styles.addText}>{added ? "Added" : unavailable ? "Unavailable" : "Add to cart"}</Text></Pressable>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f7f7f7" }, content: { padding: 18, paddingBottom: 40 }, center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }, error: { color: "#b42318", textAlign: "center" },
  imageShell: { height: 330, borderRadius: 26, overflow: "hidden", backgroundColor: "rgba(0,0,0,0.045)", alignItems: "center", justifyContent: "center", position: "relative" }, heroImage: { width: "100%", height: "100%" }, imageInitial: { fontSize: 72, fontWeight: "800", color: "#b5b5b5" },
  cartButton: { position: "absolute", right: 14, top: 14, width: 46, height: 46, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.86)", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.9)" }, badge: { position: "absolute", right: -2, top: -2, minWidth: 18, height: 18, borderRadius: 9, backgroundColor: "#111", alignItems: "center", justifyContent: "center", paddingHorizontal: 4 }, badgeText: { color: "#fff", fontSize: 9, fontWeight: "800" },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 20 }, category: { fontSize: 11, fontWeight: "800", letterSpacing: 1, color: "#777" }, condition: { fontSize: 10, fontWeight: "700", color: "#777", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, backgroundColor: "rgba(0,0,0,0.05)" }, title: { marginTop: 7, fontSize: 29, lineHeight: 34, fontWeight: "800", letterSpacing: -1, color: "#111" }, price: { marginTop: 11, fontSize: 24, fontWeight: "800", color: "#111" }, previous: { color: "#999", textDecorationLine: "line-through", marginTop: 2 },
  rating: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 9 }, ratingText: { color: "#666", fontSize: 13 }, vendorCard: { marginTop: 22, borderRadius: 20, padding: 15, flexDirection: "row", alignItems: "center" }, vendorIcon: { width: 40, height: 40, borderRadius: 13, backgroundColor: "rgba(0,0,0,0.05)", alignItems: "center", justifyContent: "center" }, vendorText: { flex: 1, marginLeft: 12 }, vendorName: { fontSize: 15, fontWeight: "800", color: "#111" }, vendorLocation: { marginTop: 3, fontSize: 12, color: "#888" },
  infoCard: { marginTop: 12, borderRadius: 20, padding: 18 }, sectionTitle: { fontSize: 17, fontWeight: "800", color: "#111" }, description: { marginTop: 8, fontSize: 14, lineHeight: 21, color: "#666" }, specs: { marginTop: 15, borderTopWidth: 1, borderTopColor: "rgba(0,0,0,0.06)" }, specRow: { flexDirection: "row", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "rgba(0,0,0,0.05)" }, specKey: { flex: 1, color: "#888", fontSize: 12 }, specValue: { flex: 1, color: "#222", fontSize: 12, textAlign: "right", fontWeight: "600" },
  purchaseRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 16 }, quantity: { height: 54, borderRadius: 15, backgroundColor: "rgba(255,255,255,0.8)", borderWidth: 1, borderColor: "rgba(0,0,0,0.06)", flexDirection: "row", alignItems: "center", paddingHorizontal: 5 }, quantityButton: { width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center" }, quantityText: { minWidth: 22, textAlign: "center", fontWeight: "800" }, addButton: { flex: 1, height: 54, borderRadius: 15, backgroundColor: "#111", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 }, addText: { color: "#fff", fontWeight: "800" }, pressed: { opacity: 0.82 }, disabled: { opacity: 0.45 },
});
