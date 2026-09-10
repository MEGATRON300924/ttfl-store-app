import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { GlassCard } from "@/components/GlassCard";
import { useAuth } from "@/lib/auth";

export default function AccountScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const initials = `${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}`.toUpperCase() || "T";

  function logout() {
    Alert.alert("Sign out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign out", style: "destructive", onPress: () => signOut() },
    ]);
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.eyebrow}>TTFL STORE</Text>
      <Text style={styles.title}>Account</Text>
      <Text style={styles.subtitle}>Manage your profile and shopping experience.</Text>

      <GlassCard style={styles.profileCard} intensity={30}>
        <View style={styles.profile}>
          <View style={styles.avatar}><Text style={styles.avatarText}>{initials}</Text></View>
          <View style={styles.profileText}>
            <Text style={styles.name}>{user?.firstName || "TTFL Customer"} {user?.lastName || ""}</Text>
            <Text style={styles.email}>{user?.email ?? "No email available"}</Text>
          </View>
        </View>
      </GlassCard>

      <Text style={styles.section}>PROFILE</Text>
      <GlassCard style={styles.detailsCard} intensity={24}>
        <Row label="Phone" value={user?.phone ?? "Not added"} />
        <Row label="Email status" value={user?.emailVerified ? "Verified" : "Not verified"} />
        <Row label="Account type" value={user?.role ?? "CUSTOMER"} last />
      </GlassCard>

      <Text style={styles.section}>QUICK ACCESS</Text>
      <GlassCard style={styles.actionsCard} intensity={24}>
        <Action icon={<Ionicons name="receipt-outline" size={18} color="#111" />} title="My orders" subtitle="View and track your purchases" onPress={() => router.push("/(tabs)/orders")} />
        <Action icon={<Ionicons name="shield-checkmark-outline" size={18} color="#111" />} title="Account security" subtitle="Your TTFL account and session" onPress={() => {}} />
      </GlassCard>

      <Pressable style={({ pressed }) => [styles.logout, pressed && styles.pressed]} onPress={logout}>
        <Ionicons name="log-out-outline" size={18} color="#b42318" />
        <Text style={styles.logoutText}>Sign out</Text>
      </Pressable>
    </ScrollView>
  );
}

function Row({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={[styles.row, !last && styles.rowBorder]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

function Action({ icon, title, subtitle, onPress }: { icon: React.ReactNode; title: string; subtitle: string; onPress: () => void }) {
  return (
    <Pressable style={({ pressed }) => [styles.action, pressed && styles.pressed]} onPress={onPress}>
      <View style={styles.actionIcon}>{icon}</View>
      <View style={styles.actionCopy}>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#9a9a9a" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f7f7f7" },
  content: { paddingHorizontal: 18, paddingTop: 62, paddingBottom: 120 },
  eyebrow: { fontSize: 11, fontWeight: "800", letterSpacing: 1.4, color: "#8a8a8a", marginBottom: 5 },
  title: { fontSize: 32, lineHeight: 36, fontWeight: "800", letterSpacing: -1.1, color: "#111" },
  subtitle: { fontSize: 14, lineHeight: 20, color: "#707070", marginTop: 6, marginBottom: 22 },
  profileCard: { borderRadius: 22, padding: 18, marginBottom: 24 },
  profile: { flexDirection: "row", alignItems: "center" },
  avatar: { width: 62, height: 62, borderRadius: 21, backgroundColor: "#111", alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#fff", fontSize: 20, fontWeight: "800", letterSpacing: 0.5 },
  profileText: { flex: 1, marginLeft: 14 },
  name: { fontSize: 19, fontWeight: "800", color: "#111" },
  email: { color: "#777", marginTop: 4, fontSize: 13 },
  section: { fontSize: 10, fontWeight: "800", letterSpacing: 1.3, color: "#999", marginBottom: 8, marginLeft: 3 },
  detailsCard: { borderRadius: 20, paddingHorizontal: 16, marginBottom: 22 },
  row: { minHeight: 58, justifyContent: "center" },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: "rgba(0,0,0,0.06)" },
  label: { color: "#9a9a9a", fontSize: 11 },
  value: { color: "#111", fontSize: 14, fontWeight: "700", marginTop: 3 },
  actionsCard: { borderRadius: 20, paddingHorizontal: 16, marginBottom: 22 },
  action: { minHeight: 70, flexDirection: "row", alignItems: "center" },
  actionIcon: { width: 40, height: 40, borderRadius: 14, backgroundColor: "rgba(0,0,0,0.05)", alignItems: "center", justifyContent: "center" },
  actionCopy: { flex: 1, marginLeft: 12 },
  actionTitle: { color: "#111", fontSize: 14, fontWeight: "800" },
  actionSubtitle: { color: "#888", fontSize: 12, marginTop: 3 },
  logout: { height: 52, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.72)", borderWidth: 1, borderColor: "rgba(0,0,0,0.06)", flexDirection: "row", gap: 9, alignItems: "center", justifyContent: "center" },
  logoutText: { color: "#b42318", fontWeight: "800", fontSize: 14 },
  pressed: { opacity: 0.78, transform: [{ scale: 0.99 }] },
});
