import { Ionicons } from "@expo/vector-icons";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import { GlassCard } from "@/components/GlassCard";
import { useCart } from "@/lib/cart";
import { theme, money } from "@/lib/theme";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";

export type MobileProduct = {
  id: string; slug: string; name: string; price: number | string;
  previousPrice?: number | string | null; imageUrl?: string | null;
  images?: { url: string; position?: number }[]; vendor?: string;
  vendorSlug?: string; verified?: boolean; rating?: number | string;
  reviewCount?: number; currency?: string; stock?: number; comingSoon?: boolean;
};

export function ProductCard({ product }: { product: MobileProduct }) {
  const { addItem } = useCart();
  const { user } = useAuth();
  const [wishlisted,setWishlisted]=useState(false);
  const image = product.imageUrl ?? product.images?.slice().sort((a,b) => (a.position ?? 0) - (b.position ?? 0))[0]?.url;
  const price = Number(product.price || 0);
  const old = product.previousPrice ? Number(product.previousPrice) : 0;
  const discount = old > price ? Math.round(100 - (price / old) * 100) : 0;
  const canBuy = !product.comingSoon;
  const toggleWishlist = async (event?: any) => { event?.stopPropagation?.(); if(!user){router.push("/(auth)/login");return;} try { if(wishlisted) await api(`/api/wishlist/${encodeURIComponent(product.id)}`,{method:"DELETE",auth:true}); else await api("/api/wishlist",{method:"POST",auth:true,body:JSON.stringify({productId:product.id})}); setWishlisted(v=>!v); } catch {} };
  const addToCart = (event?: any) => { event?.stopPropagation?.(); if (!canBuy) return; addItem({ productId: product.id, slug: product.slug, name: product.name, price, currency: product.currency ?? "₦", imageUrl: image, stock: product.stock ?? 99, sellingMethod: "CHECKOUT" }, 1); };

  return (
    <Pressable
      onPress={() => router.push({ pathname: "/product/[slug]", params: { slug: product.slug } })}
      style={({ pressed }) => [styles.wrap, pressed && styles.pressed]}
    >
      <GlassCard style={styles.card}>
        <View style={styles.imageBox}>
          {image ? <Image source={{ uri: image }} style={styles.image} resizeMode="cover" /> :
            <View style={styles.placeholder}><Ionicons name="image-outline" size={28} color={theme.colors.graphite300} /></View>}
          {discount > 0 && <View style={styles.tag}><Text style={styles.tagText}>-{discount}%</Text></View>}
          {product.comingSoon && <View style={styles.soon}><Text style={styles.soonText}>COMING SOON</Text></View>}
          <Pressable onPress={toggleWishlist} style={styles.wishlist}><Ionicons name={wishlisted?"heart":"heart-outline"} size={17} color={wishlisted?theme.colors.ember500:theme.colors.text} /></Pressable>
        </View>
        <View style={styles.body}>
          <Text numberOfLines={2} style={styles.name}>{product.name}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.price}>{money(price, product.currency ?? "₦")}</Text>
            {old > price && <Text style={styles.old}>{money(old, product.currency ?? "₦")}</Text>}
          </View>
          {(product.rating || product.reviewCount) ? (
            <View style={styles.rating}>
              <Ionicons name="star" size={12} color={theme.colors.gold600} />
              <Text style={styles.ratingText}>{Number(product.rating ?? 0).toFixed(1)}{product.reviewCount ? ` (${product.reviewCount})` : ""}</Text>
            </View>
          ) : null}
          {product.vendor && (
            <View style={styles.vendorRow}>
              {product.verified && <Ionicons name="checkmark-circle" size={13} color={theme.colors.green600} />}
              <Text numberOfLines={1} style={styles.vendor}>{product.vendor}</Text>
            </View>
          )}
        </View>
        {!product.comingSoon && (
          <View style={styles.actions}>
            <Pressable onPress={() => router.push({ pathname: "/product/[slug]", params: { slug: product.slug } })} style={styles.secondary}>
              <Text style={styles.secondaryText}>View product</Text>
            </Pressable>
          </View>
        )}
      </GlassCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  card: { borderRadius: theme.radius.card, overflow: "hidden", padding: 0 },
  pressed: { opacity: 0.9, transform: [{ scale: 0.995 }] },
  imageBox: { aspectRatio: 1, backgroundColor: theme.colors.cloud100, position: "relative" },
  image: { width: "100%", height: "100%" },
  placeholder: { flex: 1, alignItems: "center", justifyContent: "center" },
  tag: { position: "absolute", left: 0, top: 10, backgroundColor: theme.colors.ember600, paddingHorizontal: 9, paddingVertical: 5, paddingRight: 14 },
  tagText: { color: "#fff", fontSize: 10, fontWeight: "800", fontFamily: "monospace" },
  soon: { position: "absolute", left: 8, bottom: 8, backgroundColor: theme.colors.graphite950, paddingHorizontal: 8, paddingVertical: 5, borderRadius: 4 },
  soonText: { color: "#fff", fontSize: 8, fontWeight: "800", letterSpacing: 0.6 },
  wishlist: { position: "absolute", right: 8, top: 8, width: 32, height: 32, borderRadius: 16, backgroundColor: "rgba(255,255,255,.94)", alignItems: "center", justifyContent: "center" },
  body: { padding: 11 },
  name: { fontSize: 13, fontWeight: "600", lineHeight: 18, color: theme.colors.graphite950, minHeight: 36 },
  priceRow: { flexDirection: "row", alignItems: "baseline", gap: 7, marginTop: 7 },
  price: { fontSize: 15, fontWeight: "700", color: theme.colors.graphite950 },
  old: { fontSize: 10, color: theme.colors.graphite400, textDecorationLine: "line-through" },
  rating: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 6 },
  ratingText: { fontSize: 10, color: theme.colors.graphite600 },
  vendorRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 7 },
  vendor: { flex: 1, fontSize: 10.5, color: theme.colors.graphite600 },
  actions: { paddingHorizontal: 11, paddingBottom: 11 },
  secondary: { height: 36, borderRadius: 10, borderWidth: 1, borderColor: theme.colors.graphite300, alignItems: "center", justifyContent: "center" },
  secondaryText: { fontSize: 11, fontWeight: "700", color: theme.colors.graphite950 },
});
