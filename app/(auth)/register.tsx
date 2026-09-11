import { Link, router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";

const fields = [
  { key: "firstName", label: "First name", keyboardType: "default" as const, autoCapitalize: "words" as const },
  { key: "lastName", label: "Last name", keyboardType: "default" as const, autoCapitalize: "words" as const },
  { key: "email", label: "Email", keyboardType: "email-address" as const, autoCapitalize: "none" as const },
  { key: "phone", label: "Phone number", keyboardType: "phone-pad" as const, autoCapitalize: "none" as const },
  { key: "password", label: "Password", keyboardType: "default" as const, autoCapitalize: "none" as const },
] as const;

type FormKey = (typeof fields)[number]["key"];
type FormState = Record<FormKey, string>;

function validateForm(form: FormState) {
  if (Object.values(form).some((value) => !value.trim())) return "Complete all fields.";
  if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) return "Enter a valid email address.";
  if (form.phone.trim().length < 7 || form.phone.trim().length > 20) return "Enter a valid phone number.";
  if (form.password.length < 8) return "Password must be at least 8 characters.";
  if (form.password.length > 72) return "Password is too long.";
  if (!/[a-z]/.test(form.password)) return "Password needs a lowercase letter.";
  if (!/[A-Z]/.test(form.password)) return "Password needs an uppercase letter.";
  if (!/[0-9]/.test(form.password)) return "Password needs a number.";
  return null;
}

export default function RegisterScreen() {
  const { signUp } = useAuth();
  const [form, setForm] = useState<FormState>({ firstName: "", lastName: "", email: "", phone: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const update = (key: FormKey, value: string) => setForm((current) => ({ ...current, [key]: value }));

  async function submit() {
    setError("");
    const validationError = validateForm(form);
    if (validationError) {
      setError(validationError);
      return;
    }

    setBusy(true);
    try {
      await signUp({
        ...form,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
      });
      router.replace("/(tabs)/home");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to create your account right now.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Create your TTFL account</Text>
        <Text style={styles.subtitle}>One account across TTFL Store web and mobile.</Text>

        {fields.map((field) => (
          <View key={field.key} style={styles.field}>
            <Text style={styles.label}>{field.label}</Text>
            <TextInput
              style={styles.input}
              value={form[field.key]}
              onChangeText={(value) => update(field.key, value)}
              placeholder={`Enter ${field.label.toLowerCase()}`}
              placeholderTextColor="#8b8f98"
              secureTextEntry={field.key === "password"}
              autoCapitalize={field.autoCapitalize}
              keyboardType={field.keyboardType}
              autoCorrect={false}
            />
            {field.key === "password" && <Text style={styles.hint}>8+ characters, with uppercase, lowercase, and a number.</Text>}
          </View>
        ))}

        {!!error && <Text style={styles.error}>{error}</Text>}

        <Pressable
          style={({ pressed }) => [styles.button, pressed && styles.pressed, busy && styles.disabled]}
          onPress={submit}
          disabled={busy}
        >
          {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Create account</Text>}
        </Pressable>

        <Text style={styles.footer}>
          Already have an account? <Link href="/(auth)/login" style={styles.link}>Sign in</Link>
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f6f6f7" },
  container: { flexGrow: 1, justifyContent: "center", padding: 24 },
  title: { fontSize: 30, fontWeight: "800", color: "#111", letterSpacing: -0.8 },
  subtitle: { fontSize: 16, color: "#6b7280", marginTop: 8, marginBottom: 26 },
  field: { marginBottom: 12 },
  label: { fontSize: 13, fontWeight: "700", color: "#374151", marginBottom: 6, marginLeft: 3 },
  input: { height: 54, borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 14, paddingHorizontal: 16, fontSize: 16, color: "#111", backgroundColor: "#fff" },
  hint: { fontSize: 12, color: "#6b7280", marginTop: 6, marginLeft: 3 },
  error: { color: "#dc2626", marginBottom: 8 },
  button: { height: 54, borderRadius: 14, backgroundColor: "#111", alignItems: "center", justifyContent: "center", marginTop: 4 },
  pressed: { opacity: 0.8 },
  disabled: { opacity: 0.55 },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  footer: { textAlign: "center", marginTop: 24, color: "#6b7280" },
  link: { color: "#111", fontWeight: "700" },
});
