import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { GlassCard } from "@/components/GlassCard";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function ProfileScreen() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!firstName.trim() || !lastName.trim()) return Alert.alert("Missing details", "Enter your first and last name.");
    setSaving(true);
    try {
      await api("/api/auth/me", { method: "PATCH", body: JSON.stringify({ firstName: firstName.trim(), lastName: lastName.trim(), ...(phone.trim() ? { phone: phone.trim() } : {}) }) });
      await refreshUser();
      Alert.alert("Saved", "Your profile has been updated.", [{ text: "Done", onPress: () => router.back() }]);
    } catch (error) {
      Alert.alert("Could not save", error instanceof ApiError ? error.message : "Please try again.");
    } finally { setSaving(false); }
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Header title="Edit profile" onBack={() => router.back()} />
      <GlassCard style={styles.card} intensity={26}>
        <Field label="First name" value={firstName} onChangeText={setFirstName} autoCapitalize="words" />
        <Field label="Last name" value={lastName} onChangeText={setLastName} autoCapitalize="words" />
        <Field label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" last />
      </GlassCard>
      <Pressable disabled={saving} style={({ pressed }) => [styles.button, pressed && styles.pressed, saving && styles.disabled]} onPress={save}>
        <Text style={styles.buttonText}>{saving ? "Saving…" : "Save changes"}</Text>
      </Pressable>
    </ScrollView>
  );
}

function Header({ title, onBack }: { title: string; onBack: () => void }) {
  return <View style={styles.header}><Pressable onPress={onBack} style={styles.back}><Ionicons name="arrow-back" size={21} color="#111" /></Pressable><Text style={styles.title}>{title}</Text><View style={styles.spacer} /></View>;
}
function Field({ label, last, ...props }: { label: string; last?: boolean } & React.ComponentProps<typeof TextInput>) {
  return <View style={[styles.field, !last && styles.fieldBorder]}><Text style={styles.label}>{label}</Text><TextInput {...props} style={styles.input} placeholderTextColor="#aaa" /></View>;
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f7f7f7" }, content: { padding: 18, paddingTop: 58, paddingBottom: 50 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 22 }, back: { width: 42, height: 42, borderRadius: 14, backgroundColor: "rgba(255,255,255,.72)", alignItems: "center", justifyContent: "center" }, spacer: { width: 42 }, title: { flex: 1, textAlign: "center", fontSize: 20, fontWeight: "800", color: "#111" },
  card: { paddingHorizontal: 16, borderRadius: 20 }, field: { paddingVertical: 14 }, fieldBorder: { borderBottomWidth: 1, borderBottomColor: "rgba(0,0,0,.06)" }, label: { fontSize: 11, color: "#999", marginBottom: 4 }, input: { color: "#111", fontSize: 15, fontWeight: "600", paddingVertical: 3 },
  button: { height: 54, borderRadius: 17, backgroundColor: "#111", alignItems: "center", justifyContent: "center", marginTop: 18 }, buttonText: { color: "#fff", fontWeight: "800", fontSize: 15 }, pressed: { opacity: .8 }, disabled: { opacity: .55 },
});
