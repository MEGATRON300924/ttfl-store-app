import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Image, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { GlassCard } from "@/components/GlassCard";
import { api, ApiError } from "@/lib/api";

type Product = { id: string; slug: string; name: string; price?: number | string; currency?: string; imageUrl?: string | null; images?: Array<{ url: string; position: number }>; sellingMethod?: string; stock?: number };
type ProductResponse = Product[] | { products?: Product[]; items?: Product[] };

export default function ExploreScreen() {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load(search = query) {
    setLoading(true); setError("");
    try {
      const params = search.trim() ? `?q=${encodeURIComponent(search.trim())}` : "";
      const result = await api<ProductResponse>(`/api/products${params}`);
      const list = Array.isArray(result) ? result : result.products ?? result.items ?? [];
      setProducts(list);
    } catch (err) { setError(err instanceof ApiError ? err.message : "Could not load products."); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(""); }, []);

  return (
    <View style={styles.screen}>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        ListHeaderComponent={<View>
          <View style={styles.headerRow}>
            <View><Text style={styles.eyebrow}>TTFL STORE</Text><Text style={styles.title}>Explore</Text><Text style={styles.subtitle}>Find something worth adding to your cart.</Text></View>
            <Pressable style={styles.filterButton} accessibilityLabel="Filter products"><Ionicons name="options-outline" size={20} color="#111" /></Pressable>
          </View>
          <GlassCard style={styles.searchCard} intensity={28}><View style={styles.searchRow}><Ionicons name="search-outline" size={19} color="#777" /><TextInput value={query} onChangeText={setQuery} onSubmitEditing={() => load()} placeholder="Search products" placeholderTextColor="#929292" returnKeyType="search" style={styles.input} /></View></GlassCard>
          <View style={styles.sectionRow}><Text style={styles.sectionTitle}>Marketplace</Text><Text style={styles.sectionCount}>{products.length} items</Text></View>
          {loading && <View style={styles.center}><ActivityIndicator size="small" /></View>}
          {!loading && error && <GlassCard style={styles.messageCard} intensity={24}><Text style={styles.error}>{error}</Text><Pressable onPress={() => load()} style={styles.retryButton}><Text style={styles.retry}>Try again</Text></Pressable></GlassCard>}
        </View>}
        ListEmptyComponent={!loading && !error ? <GlassCard style={styles.messageCard} intensity={24}><Text style={styles.emptyTitle}>Nothing here yet</Text><Text style={styles.empty}>Try another search or check back soon.</Text></GlassCard> : null}
        renderItem={({ item }) => {
          const image = item.imageUrl ?? item.images?.slice().sort((a, b) => a.position - b.position)[0]?.url;
          const price = Number(item.price ?? 0);
          return <Pressable onPress={() => router.push({ pathname: "/product/[slug]", params: { slug: item.slug } })} style={({ pressed }) => [styles.productPressable, pressed && styles.pressed]}>
            <GlassCard style={styles.productCard} intensity={26}>
              <View style={styles.productImage}>{image ? <Image source={{ uri: image }} style={styles.image} resizeMode="cover" /> : <Text style={styles.productInitial}>{item.name?.[0]?.toUpperCase() ?? "P"}</Text>}</View>
              <View style={styles.productInfo}><View style={styles.productTopRow}><Text style={styles.productName} numberOfLines={2}>{item.name}</Text><Ionicons name="arrow-up-outline" size={17} color="#777" /></View><Text style={styles.price}>{item.currency ?? "₦"}{price.toLocaleString()}</Text><Text style={styles.slug} numberOfLines={1}>{item.slug}</Text></View>
            </GlassCard>
          </Pressable>;
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f7f7f7" }, list: { paddingTop: 62, paddingHorizontal: 18, paddingBottom: 116 }, headerRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", paddingHorizontal: 2 }, eyebrow: { fontSize: 11, fontWeight: "800", letterSpacing: 1.4, color: "#8a8a8a", marginBottom: 5 }, title: { fontSize: 32, lineHeight: 36, fontWeight: "800", letterSpacing: -1.1, color: "#111" }, subtitle: { maxWidth: 270, marginTop: 6, fontSize: 14, lineHeight: 20, color: "#707070" }, filterButton: { width: 44, height: 44, marginTop: 4, borderRadius: 15, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.82)", borderWidth: 1, borderColor: "rgba(0,0,0,0.06)" }, searchCard: { marginTop: 22, borderRadius: 18 }, searchRow: { minHeight: 54, paddingHorizontal: 16, flexDirection: "row", alignItems: "center", gap: 10 }, input: { flex: 1, fontSize: 15, color: "#111", paddingVertical: 0 }, sectionRow: { marginTop: 26, marginBottom: 12, paddingHorizontal: 2, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, sectionTitle: { fontSize: 18, fontWeight: "800", color: "#111" }, sectionCount: { fontSize: 12, color: "#929292" }, productPressable: { marginBottom: 10 }, pressed: { opacity: 0.84, transform: [{ scale: 0.992 }] }, productCard: { borderRadius: 20 }, productImage: { width: 88, height: 88, margin: 10, borderRadius: 15, overflow: "hidden", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.045)" }, image: { width: "100%", height: "100%" }, productInitial: { fontSize: 27, fontWeight: "800", color: "#b0b0b0" }, productInfo: { flex: 1, paddingVertical: 15, paddingRight: 15 }, productTopRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 }, productName: { flex: 1, fontSize: 15, lineHeight: 20, fontWeight: "700", color: "#111" }, price: { marginTop: 8, fontSize: 15, fontWeight: "800", color: "#111" }, slug: { marginTop: 3, fontSize: 11, color: "#9a9a9a" }, center: { paddingVertical: 30, alignItems: "center" }, messageCard: { padding: 18, borderRadius: 18 }, error: { color: "#b42318", fontSize: 14, lineHeight: 20 }, retryButton: { alignSelf: "flex-start", marginTop: 10 }, retry: { fontSize: 14, fontWeight: "800", color: "#111" }, emptyTitle: { fontSize: 15, fontWeight: "800", color: "#111" }, empty: { marginTop: 5, fontSize: 13, lineHeight: 19, color: "#777" },
});
