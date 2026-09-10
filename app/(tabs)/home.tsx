import { Link } from "expo-router";
import { ScrollView, StyleSheet, Text, View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { GlassCard } from "@/components/GlassCard";
import { useAuth } from "@/lib/auth";

export default function HomeScreen() {
  const { user } = useAuth();
  const firstName = user?.firstName?.trim() || "there";

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>TTFL STORE</Text>
          <Text style={styles.title}>Hey, {firstName} 👋</Text>
        </View>
        <View style={styles.avatar}><Text style={styles.avatarText}>{firstName[0]?.toUpperCase() ?? "T"}</Text></View>
      </View>

      <Link href="/(tabs)/explore" asChild>
        <Pressable style={styles.search}>
          <Ionicons name="search-outline" size={20} color="#6b7280" />
          <Text style={styles.searchText}>Search products, stores and more</Text>
        </Pressable>
      </Link>

      <GlassCard dark style={styles.hero} intensity={28}>
        <View style={styles.heroGlow} />
        <Text style={styles.heroEyebrow}>SHOP TTFL</Text>
        <Text style={styles.heroTitle}>Find what you need.</Text>
        <Text style={styles.heroCopy}>Discover products from stores across the TTFL marketplace.</Text>
        <Link href="/(tabs)/explore" asChild>
          <Pressable style={styles.heroButton}>
            <Text style={styles.heroButtonText}>Explore marketplace</Text>
            <Ionicons name="arrow-forward" size={17} color="#111" />
          </Pressable>
        </Link>
      </GlassCard>

      <Text style={styles.sectionTitle}>Quick access</Text>
      <View style={styles.grid}>
        <Quick title="Orders" icon="receipt-outline" href="/(tabs)/orders" />
        <Quick title="Explore" icon="search-outline" href="/(tabs)/explore" />
        <Quick title="Account" icon="person-outline" href="/(tabs)/account" />
      </View>

      <Text style={styles.sectionTitle}>Your marketplace</Text>
      <GlassCard style={styles.infoCard} intensity={22}>
        <View style={styles.infoIcon}><Ionicons name="sparkles-outline" size={20} color="#111" /></View>
        <Text style={styles.cardTitle}>Built around the TTFL Store</Text>
        <Text style={styles.cardCopy}>Products, vendors, wishlist, checkout, payments and real-time tracking will use the same TTFL backend as the web store.</Text>
      </GlassCard>
    </ScrollView>
  );
}

function Quick({ title, icon, href }: { title: string; icon: keyof typeof Ionicons.glyphMap; href: "/(tabs)/orders" | "/(tabs)/explore" | "/(tabs)/account" }) {
  return <Link href={href} asChild><Pressable style={styles.quick}><View style={styles.quickIcon}><Ionicons name={icon} size={19} color="#111" /></View><Text style={styles.quickTitle}>{title}</Text><Ionicons name="chevron-forward" size={18} color="#9ca3af" /></Pressable></Link>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f7f7f8" },
  content: { paddingHorizontal: 20, paddingTop: 58, paddingBottom: 34 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  eyebrow: { fontSize: 11, fontWeight: "800", letterSpacing: 1.4, color: "#9ca3af" },
  title: { fontSize: 28, fontWeight: "800", color: "#111", letterSpacing: -0.8, marginTop: 4 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#111", alignItems: "center", justifyContent: "center", shadowColor: "#111", shadowOpacity: 0.12, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 3 },
  avatarText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  search: { height: 54, borderRadius: 17, backgroundColor: "rgba(255,255,255,0.86)", borderWidth: 1, borderColor: "#e9e9eb", flexDirection: "row", alignItems: "center", paddingHorizontal: 16, marginBottom: 18 },
  searchText: { color: "#9ca3af", fontSize: 15, marginLeft: 10 },
  hero: { minHeight: 238, borderRadius: 26, padding: 24, marginBottom: 28 },
  heroGlow: { position: "absolute", width: 170, height: 170, borderRadius: 85, right: -55, top: -70, backgroundColor: "rgba(255,255,255,0.10)" },
  heroEyebrow: { color: "#a3a3a3", fontSize: 11, fontWeight: "800", letterSpacing: 1.2 },
  heroTitle: { color: "#fff", fontSize: 30, fontWeight: "800", letterSpacing: -1, marginTop: 8 },
  heroCopy: { color: "#c4c4c4", fontSize: 15, lineHeight: 22, marginTop: 8, maxWidth: 300 },
  heroButton: { backgroundColor: "rgba(255,255,255,0.94)", paddingHorizontal: 16, height: 44, borderRadius: 13, flexDirection: "row", gap: 8, alignItems: "center", justifyContent: "center", alignSelf: "flex-start", marginTop: 20 },
  heroButtonText: { color: "#111", fontWeight: "700" },
  sectionTitle: { fontSize: 19, fontWeight: "800", color: "#111", marginBottom: 12 },
  grid: { gap: 10, marginBottom: 26 },
  quick: { height: 62, borderWidth: 1, borderColor: "rgba(225,225,228,0.9)", backgroundColor: "rgba(255,255,255,0.76)", borderRadius: 17, paddingHorizontal: 12, flexDirection: "row", alignItems: "center" },
  quickIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: "#f1f1f2", alignItems: "center", justifyContent: "center", marginRight: 12 },
  quickTitle: { flex: 1, fontWeight: "700", color: "#111", fontSize: 15 },
  infoCard: { borderRadius: 21, padding: 18 },
  infoIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.85)", alignItems: "center", justifyContent: "center", marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: "800", color: "#111" },
  cardCopy: { color: "#6b7280", lineHeight: 21, marginTop: 6, fontSize: 14 },
});
