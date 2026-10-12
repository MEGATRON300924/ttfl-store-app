import { Ionicons } from "@expo/vector-icons";
import { Link, router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { theme } from "@/lib/theme";

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    setError("");
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password) {
      setError("Enter your email and password to continue.");
      return;
    }

    setBusy(true);
    try {
      await signIn(normalizedEmail, password);
      router.replace("/(tabs)/home");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "We couldn't sign you in. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <View style={styles.brandRow}>
            <Image
              source={require("../../assets/icon.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <View>
              <Text style={styles.brandName}>TTFL Store</Text>
              <Text style={styles.brandCaption}>THE TRON FORGE MARKETPLACE</Text>
            </View>
          </View>

          <View style={styles.intro}>
            <Text style={styles.eyebrow}>WELCOME BACK</Text>
            <Text style={styles.title}>Good to have you back.</Text>
            <Text style={styles.subtitle}>
              Sign in to continue shopping, track orders, and manage your TTFL
              Store account.
            </Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>Email address</Text>
            <View style={styles.inputShell}>
              <Ionicons
                name="mail-outline"
                size={19}
                color={theme.colors.textMuted}
              />
              <TextInput
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor={theme.colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                textContentType="emailAddress"
                returnKeyType="next"
              />
            </View>

            <View style={styles.passwordLabelRow}>
              <Text style={styles.label}>Password</Text>
              <Link href="/(auth)/forgot-password" style={styles.forgotLink}>
                Forgot password?
              </Link>
            </View>
            <View style={styles.inputShell}>
              <Ionicons
                name="lock-closed-outline"
                size={19}
                color={theme.colors.textMuted}
              />
              <TextInput
                value={password}
                onChangeText={setPassword}
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor={theme.colors.textMuted}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="password"
                textContentType="password"
                returnKeyType="go"
                onSubmitEditing={() => void submit()}
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={showPassword ? "Hide password" : "Show password"}
                hitSlop={10}
                onPress={() => setShowPassword((value) => !value)}
                style={styles.visibilityButton}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={19}
                  color={theme.colors.textMuted}
                />
              </Pressable>
            </View>

            {!!error && (
              <View style={styles.errorBox}>
                <Ionicons
                  name="alert-circle-outline"
                  size={18}
                  color={theme.colors.ember500}
                />
                <Text accessibilityRole="alert" style={styles.errorText}>
                  {error}
                </Text>
              </View>
            )}

            <Pressable
              accessibilityRole="button"
              disabled={busy}
              onPress={() => void submit()}
              style={({ pressed }) => [
                styles.submitButton,
                pressed && !busy && styles.pressed,
                busy && styles.disabled,
              ]}
            >
              {busy ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.submitText}>Sign in securely</Text>
                  <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                </>
              )}
            </Pressable>

            <View style={styles.securityNote}>
              <Ionicons
                name="shield-checkmark-outline"
                size={16}
                color={theme.colors.green600}
              />
              <Text style={styles.securityText}>
                Your sign-in is secured and your session is stored on this device.
              </Text>
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>New to TTFL Store?</Text>
            <Link href="/(auth)/register" style={styles.createLink}>
              Create an account
            </Link>
          </View>

          <Pressable onPress={() => router.replace("/(tabs)/home")} style={styles.backHome}>
            <Ionicons
              name="arrow-back"
              size={15}
              color={theme.colors.textMuted}
            />
            <Text style={styles.backHomeText}>Back to shopping</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.cloud50,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 22,
    paddingVertical: 36,
  },
  container: {
    width: "100%",
    maxWidth: 460,
    alignSelf: "center",
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    marginBottom: 42,
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: 13,
    backgroundColor: theme.colors.surfaceRaised,
  },
  brandName: {
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: -0.6,
    color: theme.colors.text,
  },
  brandCaption: {
    marginTop: 3,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.3,
    color: theme.colors.ember500,
  },
  intro: {
    marginBottom: 28,
  },
  eyebrow: {
    marginBottom: 9,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.8,
    color: theme.colors.ember500,
  },
  title: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "900",
    letterSpacing: -1.1,
    color: theme.colors.text,
  },
  subtitle: {
    marginTop: 10,
    maxWidth: 390,
    fontSize: 14,
    lineHeight: 22,
    color: theme.colors.textMuted,
  },
  form: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
    backgroundColor: theme.colors.surface,
  },
  label: {
    marginBottom: 8,
    fontSize: 13,
    fontWeight: "700",
    color: theme.colors.text,
  },
  inputShell: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
    backgroundColor: theme.colors.cloud50,
  },
  input: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 14,
    fontSize: 14,
    color: theme.colors.text,
  },
  passwordLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 20,
  },
  forgotLink: {
    marginBottom: 8,
    fontSize: 12,
    fontWeight: "700",
    color: theme.colors.ember500,
  },
  visibilityButton: {
    padding: 3,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 12,
    marginTop: 14,
    borderRadius: 10,
    backgroundColor: theme.colors.ember100,
  },
  errorText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    color: theme.colors.ember500,
  },
  submitButton: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 20,
    borderRadius: 13,
    backgroundColor: theme.colors.ember600,
  },
  submitText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  pressed: {
    opacity: 0.86,
    transform: [{ scale: 0.99 }],
  },
  disabled: {
    opacity: 0.65,
  },
  securityNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "center",
    gap: 7,
    marginTop: 15,
  },
  securityText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
    color: theme.colors.textMuted,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 5,
    marginTop: 26,
  },
  footerText: {
    fontSize: 13,
    color: theme.colors.textMuted,
  },
  createLink: {
    fontSize: 13,
    fontWeight: "800",
    color: theme.colors.ember500,
  },
  backHome: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    marginTop: 24,
    padding: 8,
  },
  backHomeText: {
    fontSize: 12,
    fontWeight: "700",
    color: theme.colors.textMuted,
  },
});
