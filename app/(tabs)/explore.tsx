import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Image, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { GlassCard } from "@/components/GlassCard";
import { api, ApiError } from "@/lib/api";

type Product = { id: string; slug: string; name: string; price?: number | string; currency?: string; imageUrl?: string | null; images?: Array<{ url: string; position: number }>; sellingMethod?: string; stock?: number };
type ProductResponse = Product[] | { products?: Product[]; items?: Product[]; pagination?: { page: number; totalPages: number; total: number } };
type Category = { id: string; name: string; slug: string; icon?: string | null; children?: Category[] };
type Sort = "relevance" | "price_asc" | "price_desc" | "newest" | "rating";
type Condition = "" | "NEW" | "USED";
type SellingMethod = "" | "CHECKOUT" | "EXTERNAL_LINK" | "WHATSAPP";

export default function ExploreScreen() {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState<Condition>("");
  const [sellingMethod, setSellingMethod] = useState<SellingMethod>("");
  const [sort, setSort] = useState<Sort>("relevance");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const activeFilterCount = useMemo(() => [category, condition, sellingMethod, minPrice, maxPrice, sort !== "relevance" ? sort : ""].filter(Boolean).length, [category, condition, sellingMethod, minPrice, maxPrice, sort]);

  async function load(nextPage = 1, append = false) {
    if (append) setLoadingMore(true); else setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (query.trim()) params.set("q", query.trim());
      if (category) params.set("category", category);
      if (condition) params.set("condition", condition);
      if (sellingMethod) params.set("sellingMethod", sellingMethod);
      if (sort) params.set("sort", sort);
      if (minPrice.trim()) params.set("minPrice", minPrice.trim());
      if (maxPrice.trim()) params.set("maxPrice", maxPrice.trim());
      params.set("page", String(nextPage));
      params.set("limit", "24");
      const result = await api<ProductResponse>(`/api/products?${params.toString()}`);
      const list = Array.isArray(result) ? result : result.products ?? result.items ?? [];
      const pagination = Array.isArray(result) ? undefined : result.pagination;
      setProducts((current) => append ? [...current, ...list] : list);
      setPage(nextPage);
      setTotalPages(pagination?.totalPages ?? nextPage);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not load products.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }

  useEffect(() => {
    api<{ categories: Category[] }>("/api/categories")
      .then((result) => setCategories(result.categories ?? []))
      .catch(() => setCategories([]));
    load(1);
  }, []);

  function applyFilters() {
    setFiltersOpen(false);
    load(1);
  }

  function clearFilters() {
    setCategory(""); setCondition(""); setSellingMethod(""); setSort("relevance"); setMinPrice(""); setMaxPrice("");
  }

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
            <Pressable onPress={() => setFiltersOpen(true)} style={styles.filterButton} accessibilityLabel="Filter products"><Ionicons name="options-outline" size={20} color="#111" />{activeFilterCount > 0 && <View style={styles.filterBadge}><Text style={styles.filterBadgeText}>{activeFilterCount}</Text></View>}</Pressable>
          </View>
          <GlassCard style={styles.searchCard} intensity={28}><View style={styles.searchRow}><Ionicons name="search-outline" size={19} color="#777" /><TextInput value={query} onChangeText={setQuery} onSubmitEditing={() => load(1)} placeholder="Search products" placeholderTextColor="#929292" returnKeyType="search" style={styles.input} /><Pressable onPress={() => { setQuery(""); load(1); }} disabled={!query}><Ionicons name="close-circle" size={18} color={query ? "#888" : "transparent"} /></Pressable></View></GlassCard>
          {categories.length > 0 && <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categories}><Pressable onPress={() => { setCategory(""); load(1); }} style={[styles.categoryChip, !category && styles.categoryChipActive]}><Text style={[styles.categoryText, !category && styles.categoryTextActive]}>All</Text></Pressable>{categories.map((item) => <Pressable key={item.id} onPress={() => { setCategory(item.slug); load(1); }} style={[styles.categoryChip, category === item.slug && styles.categoryChipActive]}><Text style={[styles.categoryText, category === item.slug && styles.categoryTextActive]}>{item.icon ? `${item.icon} ` : ""}{item.name}</Text></Pressable>)}</ScrollView>}
          <View style={styles.sectionRow}><Text style={styles.sectionTitle}>{category ? categories.find((item) => item.slug === category)?.name ?? "Marketplace" : "Marketplace"}</Text><Text style={styles.sectionCount}>{products.length} items</Text></View>
          {loading && <View style={styles.center}><ActivityIndicator size="small" /></View>}
          {!loading && error && <GlassCard style={styles.messageCard} intensity={24}><Text style={styles.error}>{error}</Text><Pressable onPress={() => load(page)} style={styles.retryButton}><Text style={styles.retry}>Try again</Text></Pressable></GlassCard>}
        </View>}
        ListEmptyComponent={!loading && !error ? <GlassCard style={styles.messageCard} intensity={24}><Text style={styles.emptyTitle}>Nothing here yet</Text><Text style={styles.empty}>Try another search or change your filters.</Text></GlassCard> : null}
        ListFooterComponent={!loading && products.length > 0 && page < totalPages ? <Pressable disabled={loadingMore} onPress={() => load(page + 1, true)} style={styles.moreButton}>{loadingMore ? <ActivityIndicator size="small" /> : <Text style={styles.moreText}>Load more</Text>}</Pressable> : <View style={{ height: 20 }} />}
        renderItem={({ item }) => {
          const image = item.imageUrl ?? item.images?.slice().sort((a, b) => a.position - b.position)[0]?.url;
          const price = Number(item.price ?? 0);
          return <Pressable onPress={() => router.push({ pathname: "/product/[slug]", params: { slug: item.slug } })} style={({ pressed }) => [styles.productPressable, pressed && styles.pressed]}>
            <GlassCard style={styles.productCard} intensity={26}>
              <View style={styles.productImage}>{image ? <Image source={{ uri: image }} style={styles.image} resizeMode="cover" /> : <Text style={styles.productInitial}>{item.name?.[0]?.toUpperCase() ?? "P"}</Text>}</View>
              <View style={styles.productInfo}><View style={styles.productTopRow}><Text style={styles.productName} numberOfLines={2}>{item.name}</Text><Ionicons name="arrow-up-outline" size={17} color="#777" /></View><Text style={styles.price}>{item.currency ?? "₦"}{price.toLocaleString()}</Text>{item.stock !== undefined && <Text style={styles.stock}>{item.stock > 0 ? `${item.stock} available` : "Out of stock"}</Text>}</View>
            </GlassCard>
          </Pressable>;
        }}
      />

      <Modal visible={filtersOpen} transparent animationType="slide" onRequestClose={() => setFiltersOpen(false)}>
        <View style={styles.modalBackdrop}><View style={styles.sheet}><View style={styles.sheetHeader}><View><Text style={styles.sheetEyebrow}>MARKETPLACE</Text><Text style={styles.sheetTitle}>Filters</Text></View><Pressable onPress={() => setFiltersOpen(false)} style={styles.closeButton}><Ionicons name="close" size={20} color="#111" /></Pressable></View>
          <Text style={styles.filterLabel}>Condition</Text><View style={styles.optionRow}>{(["", "NEW", "USED"] as Condition[]).map((value) => <Option key={value || "all"} label={value || "Any"} active={condition === value} onPress={() => setCondition(value)} />)}</View>
          <Text style={styles.filterLabel}>Purchase method</Text><View style={styles.optionWrap}>{(["", "CHECKOUT", "WHATSAPP", "EXTERNAL_LINK"] as SellingMethod[]).map((value) => <Option key={value || "all"} label={value === "EXTERNAL_LINK" ? "External" : value === "WHATSAPP" ? "WhatsApp" : value === "CHECKOUT" ? "TTFL Checkout" : "Any"} active={sellingMethod === value} onPress={() => setSellingMethod(value)} />)}</View>
          <Text style={styles.filterLabel}>Price range</Text><View style={styles.priceRow}><TextInput value={minPrice} onChangeText={setMinPrice} placeholder="Min ₦" placeholderTextColor="#aaa" keyboardType="numeric" style={styles.priceInput} /><TextInput value={maxPrice} onChangeText={setMaxPrice} placeholder="Max ₦" placeholderTextColor="#aaa" keyboardType="numeric" style={styles.priceInput} /></View>
          <Text style={styles.filterLabel}>Sort by</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.optionRow}>{(["relevance", "newest", "price_asc", "price_desc", "rating"] as Sort[]).map((value) => <Option key={value} label={value === "price_asc" ? "Lowest price" : value === "price_desc" ? "Highest price" : value === "relevance" ? "Relevant" : value[0].toUpperCase() + value.slice(1)} active={sort === value} onPress={() => setSort(value)} />)}</ScrollView>
          <View style={styles.sheetActions}><Pressable onPress={clearFilters} style={styles.clearButton}><Text style={styles.clearText}>Clear</Text></Pressable><Pressable onPress={applyFilters} style={styles.applyButton}><Text style={styles.applyText}>Apply filters</Text></Pressable></View>
        </View></View>
      </Modal>
    </View>
  );
}

function Option({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return <Pressable onPress={onPress} style={[styles.option, active && styles.optionActive]}><Text style={[styles.optionText, active && styles.optionTextActive]}>{label}</Text></Pressable>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f7f7f7" }, list: { paddingTop: 62, paddingHorizontal: 18, paddingBottom: 116 }, headerRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", paddingHorizontal: 2 }, eyebrow: { fontSize: 11, fontWeight: "800", letterSpacing: 1.4, color: "#8a8a8a", marginBottom: 5 }, title: { fontSize: 32, lineHeight: 36, fontWeight: "800", letterSpacing: -1.1, color: "#111" }, subtitle: { maxWidth: 270, marginTop: 6, fontSize: 14, lineHeight: 20, color: "#707070" }, filterButton: { width: 44, height: 44, marginTop: 4, borderRadius: 15, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.82)", borderWidth: 1, borderColor: "rgba(0,0,0,0.06)" }, filterBadge: { position: "absolute", right: -2, top: -2, minWidth: 18, height: 18, borderRadius: 9, paddingHorizontal: 4, alignItems: "center", justifyContent: "center", backgroundColor: "#111" }, filterBadgeText: { color: "#fff", fontSize: 9, fontWeight: "800" }, searchCard: { marginTop: 22, borderRadius: 18 }, searchRow: { minHeight: 54, paddingHorizontal: 16, flexDirection: "row", alignItems: "center", gap: 10 }, input: { flex: 1, fontSize: 15, color: "#111", paddingVertical: 0 }, categories: { paddingTop: 14, paddingBottom: 2, gap: 8 }, categoryChip: { paddingHorizontal: 14, height: 36, borderRadius: 18, justifyContent: "center", backgroundColor: "rgba(255,255,255,0.72)", borderWidth: 1, borderColor: "rgba(0,0,0,0.06)" }, categoryChipActive: { backgroundColor: "#111", borderColor: "#111" }, categoryText: { color: "#666", fontSize: 12, fontWeight: "700" }, categoryTextActive: { color: "#fff" }, sectionRow: { marginTop: 22, marginBottom: 12, paddingHorizontal: 2, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, sectionTitle: { fontSize: 18, fontWeight: "800", color: "#111" }, sectionCount: { fontSize: 12, color: "#929292" }, productPressable: { marginBottom: 10 }, pressed: { opacity: 0.84, transform: [{ scale: 0.992 }] }, productCard: { borderRadius: 20 }, productImage: { width: 88, height: 88, margin: 10, borderRadius: 15, overflow: "hidden", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.045)" }, image: { width: "100%", height: "100%" }, productInitial: { fontSize: 27, fontWeight: "800", color: "#b0b0b0" }, productInfo: { flex: 1, paddingVertical: 15, paddingRight: 15 }, productTopRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 }, productName: { flex: 1, fontSize: 15, lineHeight: 20, fontWeight: "700", color: "#111" }, price: { marginTop: 8, fontSize: 15, fontWeight: "800", color: "#111" }, stock: { marginTop: 3, fontSize: 11, color: "#888" }, center: { paddingVertical: 30, alignItems: "center" }, messageCard: { padding: 18, borderRadius: 18 }, error: { color: "#b42318", fontSize: 14, lineHeight: 20 }, retryButton: { alignSelf: "flex-start", marginTop: 10 }, retry: { fontSize: 14, fontWeight: "800", color: "#111" }, emptyTitle: { fontSize: 15, fontWeight: "800", color: "#111" }, empty: { marginTop: 5, fontSize: 13, lineHeight: 19, color: "#777" }, moreButton: { height: 48, marginVertical: 8, borderRadius: 15, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.82)", borderWidth: 1, borderColor: "rgba(0,0,0,0.06)" }, moreText: { fontWeight: "800", color: "#111" },
  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.34)", justifyContent: "flex-end" }, sheet: { backgroundColor: "#f7f7f7", borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20, paddingBottom: 30, borderWidth: 1, borderColor: "rgba(255,255,255,0.8)" }, sheetHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }, sheetEyebrow: { fontSize: 10, letterSpacing: 1.3, fontWeight: "800", color: "#999" }, sheetTitle: { marginTop: 3, fontSize: 25, fontWeight: "800", color: "#111" }, closeButton: { width: 40, height: 40, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.9)", alignItems: "center", justifyContent: "center" }, filterLabel: { marginTop: 18, marginBottom: 9, fontSize: 12, fontWeight: "800", color: "#555" }, optionRow: { flexDirection: "row", gap: 8 }, optionWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 }, option: { minHeight: 38, paddingHorizontal: 13, borderRadius: 19, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.8)", borderWidth: 1, borderColor: "rgba(0,0,0,0.06)" }, optionActive: { backgroundColor: "#111", borderColor: "#111" }, optionText: { fontSize: 12, fontWeight: "700", color: "#666" }, optionTextActive: { color: "#fff" }, priceRow: { flexDirection: "row", gap: 10 }, priceInput: { flex: 1, height: 48, borderRadius: 14, borderWidth: 1, borderColor: "rgba(0,0,0,0.07)", backgroundColor: "#fff", paddingHorizontal: 14, color: "#111" }, sheetActions: { flexDirection: "row", gap: 10, marginTop: 24 }, clearButton: { width: 90, height: 52, borderRadius: 15, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.8)", borderWidth: 1, borderColor: "rgba(0,0,0,0.06)" }, clearText: { color: "#555", fontWeight: "800" }, applyButton: { flex: 1, height: 52, borderRadius: 15, alignItems: "center", justifyContent: "center", backgroundColor: "#111" }, applyText: { color: "#fff", fontWeight: "800" },
});
