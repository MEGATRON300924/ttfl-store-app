import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { api, ApiError } from "@/lib/api";

type Product = { id: string; slug: string; name: string; price?: number; currency?: string; imageUrl?: string | null };
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

  return <View style={styles.screen}>
    <View style={styles.header}><Text style={styles.title}>Explore</Text><Text style={styles.subtitle}>Browse the TTFL marketplace</Text></View>
    <View style={styles.search}><TextInput value={query} onChangeText={setQuery} onSubmitEditing={() => load()} placeholder="Search products" returnKeyType="search" style={styles.input} /></View>
    {loading ? <View style={styles.center}><ActivityIndicator size="large" /></View> : error ? <View style={styles.center}><Text style={styles.error}>{error}</Text><Pressable onPress={() => load()}><Text style={styles.retry}>Try again</Text></Pressable></View> : <FlatList data={products} keyExtractor={(item) => item.id} contentContainerStyle={styles.list} ListEmptyComponent={<Text style={styles.empty}>No products found yet.</Text>} renderItem={({ item }) => <View style={styles.product}><View style={styles.productImage}><Text style={styles.productInitial}>{item.name?.[0]?.toUpperCase() ?? "P"}</Text></View><View style={styles.productInfo}><Text style={styles.productName} numberOfLines={2}>{item.name}</Text><Text style={styles.price}>{item.currency ?? "₦"}{typeof item.price === "number" ? item.price.toLocaleString() : "—"}</Text><Text style={styles.slug}>{item.slug}</Text></View></View>} />}
  </View>;
}
const styles = StyleSheet.create({ screen: { flex: 1, backgroundColor: "#fff", paddingTop: 58 }, header: { paddingHorizontal: 20 }, title: { fontSize: 30, fontWeight: "800", color: "#111" }, subtitle: { color: "#6b7280", marginTop: 4 }, search: { margin: 18, height: 50, borderRadius: 14, backgroundColor: "#f5f5f5", paddingHorizontal: 14, justifyContent: "center" }, input: { fontSize: 16, color: "#111" }, list: { paddingHorizontal: 18, paddingBottom: 28, gap: 10 }, product: { flexDirection: "row", borderWidth: 1, borderColor: "#eee", borderRadius: 16, padding: 12 }, productImage: { width: 72, height: 72, borderRadius: 12, backgroundColor: "#f1f1f1", alignItems: "center", justifyContent: "center" }, productInitial: { fontSize: 24, fontWeight: "800", color: "#9ca3af" }, productInfo: { flex: 1, paddingLeft: 12, justifyContent: "center" }, productName: { fontWeight: "700", fontSize: 15, color: "#111" }, price: { marginTop: 6, fontWeight: "800", color: "#111" }, slug: { color: "#9ca3af", fontSize: 11, marginTop: 2 }, center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }, error: { color: "#dc2626", textAlign: "center" }, retry: { marginTop: 10, fontWeight: "700", color: "#111" }, empty: { textAlign: "center", color: "#6b7280", marginTop: 40 }
});
