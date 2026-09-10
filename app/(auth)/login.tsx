import { Link, router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { GlassCard } from "@/components/GlassCard";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    setError("");
    if (!email.trim() || !password) { setError("Enter your email and password."); return; }
    setBusy(true);
    try { await signIn(email.trim(), password); router.replace("/(tabs)/home"); }
    catch (err) { setError(err instanceof ApiError ? err.message : "Unable to sign in right now."); }
    finally { setBusy(false); }
  }

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={styles.glowOne} /><View style={styles.glowTwo} />
      <View style={styles.container}>
        <GlassCard style={styles.card} intensity={28}>
          <View style={styles.brand}><Text style={styles.brandText}>TTFL</Text></View>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Sign in to shop, track orders and manage your account.</Text>
          <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Email" placeholderTextColor="#9ca3af" autoCapitalize="none" keyboardType="email-address" />
          <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="Password" placeholderTextColor="#9ca3af" secureTextEntry />
          {!!error && <Text style={styles.error}>{error}</Text>}
          <Pressable style={({ pressed }) => [styles.button, pressed && styles.pressed, busy && styles.disabled]} onPress={submit} disabled={busy}>
            {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign in</Text>}
          </Pressable>
          <Text style={styles.footer}>New to TTFL? <Link href="/(auth)/register" style={styles.link}>Create an account</Link></Text>
        </GlassCard>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f6f6f7" }, container: { flex: 1, justifyContent: "center", padding: 20 },
  glowOne: { position: "absolute", width: 220, height: 220, borderRadius: 110, backgroundColor: "rgba(17,17,17,0.035)", top: 80, right: -90 },
  glowTwo: { position: "absolute", width: 180, height: 180, borderRadius: 90, backgroundColor: "rgba(0,122,255,0.035)", bottom: 70, left: -90 },
  card: { borderRadius: 26, padding: 24 },
  brand: { width: 52, height: 52, borderRadius: 16, backgroundColor: "#111", alignItems: "center", justifyContent: "center", marginBottom: 24 }, brandText: { color: "#fff", fontWeight: "800", fontSize: 18 },
  title: { fontSize: 32, fontWeight: "800", color: "#111", letterSpacing: -1 }, subtitle: { fontSize: 16, color: "#6b7280", lineHeight: 23, marginTop: 8, marginBottom: 28 },
  input: { height: 54, borderWidth: 1, borderColor: "rgba(229,231,235,0.95)", borderRadius: 14, paddingHorizontal: 16, fontSize: 16, marginBottom: 12, color: "#111", backgroundColor: "rgba(255,255,255,0.72)" },
  button: { height: 54, borderRadius: 14, backgroundColor: "#111", alignItems: "center", justifyContent: "center", marginTop: 8 }, pressed: { opacity: 0.8 }, disabled: { opacity: 0.55 }, buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  error: { color: "#dc2626", marginBottom: 4 }, footer: { textAlign: "center", marginTop: 24, color: "#6b7280" }, link: { color: "#111", fontWeight: "700" },
});
