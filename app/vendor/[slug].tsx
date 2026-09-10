import { Ionicons } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { GlassCard } from "@/components/GlassCard";
import { api, ApiError } from "@/lib/api";

type Store = {
  id: string;
  storeName: string;
  storeSlug: string;
  bio?: string | null;
  location?: string | null;
  whatsappNumber?: string | null;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  verified?: boolean;
  tier?: string;
  headline?: string | null;
  description?: string | null;
  accentColor?: string;
  productCount?: number;
  badges?: string[];
  gallery?: Array<{ id: string; url: string; position: number }>;
};

type Product = {
  id: string;
  slug: string;
  name: string;
  price?: number | string;
  currency?: string;
  images?: Array<{ url: string; position: number }>;
  stock?: number;
  sellingMethod?: string;
};

export default function VendorStoreScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    setLoading(true);
    setError("");

    Promise.all([
      api<{ store: Store }>(`/api/store-profile/public/${encodeURIComponent(slug)}`),
      api<{ items?: Product[]; products?: Product[] }>(`/api/products?vendor=${encodeURIComponent(slug)}&limit=48&sort=newest`),
    ])
      .then(([storeResult, productResult]) => {
        if (cancelled) return;
        setStore(storeResult.store);
        setProducts(productResult.items ?? productResult.products ?? []);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Could not load this store.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [slug]);

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="small" /></View>;
  }

  if (error || !store) {
    return <View style={styles.center}><Text style={styles.error}>{error || "Store not found."}</Text><Pressable onPress={() => router.back()}><Text style={styles.back}>Go back</Text></Pressable></View>;
  }

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ headerShown: true, title: store.storeName, headerBackTitle: "Back" }} />
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View>
            <View style={styles.banner}>
              {store.bannerUrl ? <Image source={{ uri: store.bannerUrl }} style={styles.bannerImage} resizeMode="cover" /> : <View style={styles.bannerFallback} />}
              <View style={styles.bannerShade} />
              <View style={styles.storeIdentity}>
                <View style={styles.logoShell}>
                  {store.logoUrl ? <Image source={{ uri: store.logoUrl }} style={styles.logo} resizeMode="cover" /> : <Text style={styles.logoInitial}>{store.storeName[0]?.toUpperCase() ?? "T"}</Text>}
                </View>
                <View style={styles.identityText}>
                  <View style={styles.nameRow}>
                    <Text style={styles.storeName} numberOfLines={1}>{store.storeName}</Text>
                    {store.verified && <Ionicons name="checkmark-circle" size={18} color="#fff" />}
                  </View>
                  <Text style={styles.location}>{store.location || "TTFL Store marketplace"}</Text>
                </View>
              </View>
            </View>

            <GlassCard style={styles.aboutCard} intensity={24}>
              <View style={styles.statsRow}>
                <View><Text style={styles.statValue}>{store.productCount ?? products.length}</Text><Text style={styles.statLabel}>Products</Text></View>
                <View><Text style={styles.statValue}>{store.tier ?? "Store"}</Text><Text style={styles.statLabel}>Plan</Text></View>
                <View><Text style={styles.statValue}>{store.verified ? "Verified" : "Seller"}</Text><Text style={styles.statLabel}>Status</Text></View>
              </View>
              {(store.headline || store.description || store.bio) && <View style={styles.descriptionBlock}><Text style={styles.headline}>{store.headline || "About this store"}</Text><Text style={styles.description}>{store.description || store.bio}</Text></View>}
              {store.badges && store.badges.length > 0 && <View style={styles.badges}>{store.badges.map((badge) => <View key={badge} style={styles.badge}><Ionicons name="shield-checkmark-outline" size={13} color="#111" /><Text style={styles.badgeText}>{badge}</Text></View>)}</View>}
            </GlassCard>

            <View style={styles.sectionRow}><Text style={styles.sectionTitle}>Products</Text><Text style={styles.sectionCount}>{products.length}</Text></View>
          </View>
        }
        ListEmptyComponent={<GlassCard style={styles.emptyCard} intensity={24}><Text style={styles.emptyTitle}>No products yet</Text><Text style={styles.emptyText}>This store has not listed any active products.</Text></GlassCard>}
        renderItem={({ item }) => {
          const image = item.images?.slice().sort((a, b) => a.position - b.position)[0]?.url;
          const price = Number(item.price ?? 0);
          return <Pressable onPress={() => router.push({ pathname: "/product/[slug]", params: { slug: item.slug } })} style={({ pressed }) => [styles.productPressable, pressed && styles.pressed]}>
            <GlassCard style={styles.productCard} intensity={24}>
              <View style={styles.productImage}>{image ? <Image source={{ uri: image }} style={styles.image} resizeMode="cover" /> : <Text style={styles.productInitial}>{item.name[0]?.toUpperCase() ?? "P"}</Text>}</View>
              <View style={styles.productInfo}><Text style={styles.productName} numberOfLines={2}>{item.name}</Text><Text style={styles.price}>{item.currency ?? "₦"}{price.toLocaleString()}</Text><Text style={styles.stock}>{item.stock && item.stock > 0 ? `${item.stock} available` : "Out of stock"}</Text></View>
              <Ionicons name="chevron-forward" size={18} color="#999" />
            </GlassCard>
          </Pressable>;
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f7f7f7" }, content: { padding: 18, paddingBottom: 44 }, center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }, error: { color: "#b42318", textAlign: "center", fontSize: 14 }, back: { marginTop: 12, fontWeight: "800", color: "#111" },
  banner: { height: 230, borderRadius: 26, overflow: "hidden", backgroundColor: "#222", position: "relative" }, bannerImage: { width: "100%", height: "100%" }, bannerFallback: { flex: 1, backgroundColor: "#1b1b1b" }, bannerShade: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.34)" }, storeIdentity: { position: "absolute", left: 18, right: 18, bottom: 18, flexDirection: "row", alignItems: "center" }, logoShell: { width: 64, height: 64, borderRadius: 20, overflow: "hidden", backgroundColor: "rgba(255,255,255,0.92)", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.9)" }, logo: { width: "100%", height: "100%" }, logoInitial: { fontSize: 26, fontWeight: "800", color: "#111" }, identityText: { flex: 1, marginLeft: 13 }, nameRow: { flexDirection: "row", alignItems: "center", gap: 6 }, storeName: { flexShrink: 1, fontSize: 22, fontWeight: "800", color: "#fff", letterSpacing: -0.5 }, location: { marginTop: 4, fontSize: 12, color: "rgba(255,255,255,0.78)" },
  aboutCard: { marginTop: 12, borderRadius: 20, padding: 17 }, statsRow: { flexDirection: "row", justifyContent: "space-between", paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: "rgba(0,0,0,0.06)" }, statValue: { fontSize: 15, fontWeight: "800", color: "#111" }, statLabel: { marginTop: 3, fontSize: 11, color: "#888" }, descriptionBlock: { paddingTop: 15 }, headline: { fontSize: 16, fontWeight: "800", color: "#111" }, description: { marginTop: 6, fontSize: 13, lineHeight: 20, color: "#707070" }, badges: { flexDirection: "row", flexWrap: "wrap", gap: 7, marginTop: 13 }, badge: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 9, paddingVertical: 6, borderRadius: 999, backgroundColor: "rgba(0,0,0,0.055)" }, badgeText: { fontSize: 10, fontWeight: "800", color: "#222" },
  sectionRow: { marginTop: 25, marginBottom: 11, paddingHorizontal: 2, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, sectionTitle: { fontSize: 19, fontWeight: "800", color: "#111" }, sectionCount: { fontSize: 12, color: "#888" }, productPressable: { marginBottom: 10 }, pressed: { opacity: 0.84, transform: [{ scale: 0.992 }] }, productCard: { borderRadius: 20, minHeight: 112, padding: 10, flexDirection: "row", alignItems: "center" }, productImage: { width: 92, height: 92, borderRadius: 15, overflow: "hidden", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.045)" }, image: { width: "100%", height: "100%" }, productInitial: { fontSize: 28, fontWeight: "800", color: "#aaa" }, productInfo: { flex: 1, paddingHorizontal: 13 }, productName: { fontSize: 14, lineHeight: 19, fontWeight: "700", color: "#111" }, price: { marginTop: 7, fontSize: 15, fontWeight: "800", color: "#111" }, stock: { marginTop: 3, fontSize: 11, color: "#888" }, emptyCard: { borderRadius: 18, padding: 18 }, emptyTitle: { fontSize: 15, fontWeight: "800", color: "#111" }, emptyText: { marginTop: 5, fontSize: 13, lineHeight: 19, color: "#777" },
});
