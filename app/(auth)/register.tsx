import { Link, router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function RegisterScreen() {
  const { signUp } = useAuth();
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));

  async function submit() {
    setError("");
    if (Object.values(form).some((value) => !value.trim())) { setError("Complete all fields."); return; }
    setBusy(true);
    try { await signUp(form); router.replace("/(tabs)/home"); }
    catch (err) { setError(err instanceof ApiError ? err.message : "Unable to create your account right now."); }
    finally { setBusy(false); }
  }

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Create your TTFL account</Text><Text style={styles.subtitle}>One account across TTFL Store web and mobile.</Text>
        {(["firstName", "lastName", "email", "phone", "password"] as const).map((key) => (
          <TextInput key={key} style={styles.input} value={form[key]} onChangeText={(value) => update(key, value)} placeholder={{ firstName: "First name", lastName: "Last name", email: "Email", phone: "Phone number", password: "Password" }[key]} secureTextEntry={key === "password"} autoCapitalize={key === "email" ? "none" : "words"} keyboardType={key === "email" ? "email-address" : key === "phone" ? "phone-pad" : "default"} />
        ))}
        {!!error && <Text style={styles.error}>{error}</Text>}
        <Pressable style={({ pressed }) => [styles.button, pressed && { opacity: 0.8 }, busy && { opacity: 0.55 }]} onPress={submit} disabled={busy}>{busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Create account</Text>}</Pressable>
        <Text style={styles.footer}>Already have an account? <Link href="/(auth)/login" style={styles.link}>Sign in</Link></Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({ screen: { flex: 1, backgroundColor: "#fff" }, container: { flexGrow: 1, justifyContent: "center", padding: 24 }, title: { fontSize: 30, fontWeight: "800", color: "#111", letterSpacing: -0.8 }, subtitle: { fontSize: 16, color: "#6b7280", marginTop: 8, marginBottom: 26 }, input: { height: 54, borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 14, paddingHorizontal: 16, fontSize: 16, marginBottom: 12, backgroundColor: "#fafafa" }, error: { color: "#dc2626", marginBottom: 8 }, button: { height: 54, borderRadius: 14, backgroundColor: "#111", alignItems: "center", justifyContent: "center", marginTop: 4 }, buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 }, footer: { textAlign: "center", marginTop: 24, color: "#6b7280" }, link: { color: "#111", fontWeight: "700" } });
