import { useEffect, useState } from "react";
import { Linking, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";

export const CURRENT_TERMS_VERSION = "2026-10-01-v1";

export function TermsGate() {
  const { user, loading, refreshUser } = useAuth();
  const [open, setOpen] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && user && user.termsAcceptedVersion !== CURRENT_TERMS_VERSION) setOpen(true);
  }, [loading, user?.id, user?.termsAcceptedVersion]);

  if (!user || loading) return null;

  async function accept() {
    if (!agreed || saving) return;
    setSaving(true);
    try {
      await api("/api/legal/terms/accept", { method: "POST", auth: true });
      await refreshUser();
      setOpen(false);
      setAgreed(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal visible={open} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.eyebrow}>TTFL STORE · UPDATED TERMS</Text>
          <Text style={styles.title}>Please review our Terms and Conditions</Text>
          <Text style={styles.body}>
            TTFL Store has released its marketplace Terms and Conditions. You must review and accept the current version before continuing to use your account.
          </Text>
          <Pressable onPress={() => Linking.openURL("https://ttflstore.name.ng/legal/terms")} style={styles.linkButton}>
            <Text style={styles.linkText}>Read the full Terms and Conditions</Text>
          </Pressable>
          <Pressable onPress={() => setAgreed((value) => !value)} style={styles.checkRow}>
            <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>{agreed ? <Text style={styles.check}>✓</Text> : null}</View>
            <Text style={styles.checkLabel}>I have reviewed the Terms and Conditions and agree to follow them.</Text>
          </Pressable>
          <Pressable disabled={!agreed || saving} onPress={accept} style={[styles.acceptButton, (!agreed || saving) && styles.disabled]}>
            <Text style={styles.acceptText}>{saving ? "Saving…" : "Agree and continue"}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: "center", backgroundColor: "rgba(0,0,0,0.62)", padding: 20 },
  card: { borderRadius: 22, padding: 22, backgroundColor: "#fff" },
  eyebrow: { fontSize: 11, fontWeight: "800", letterSpacing: 1.4, color: "#E8622C" },
  title: { marginTop: 7, fontSize: 22, fontWeight: "800", color: "#111827" },
  body: { marginTop: 10, fontSize: 14, lineHeight: 21, color: "#4B5563" },
  linkButton: { marginTop: 18, borderWidth: 1, borderColor: "#D1D5DB", borderRadius: 12, padding: 14 },
  linkText: { fontSize: 14, fontWeight: "700", color: "#111827" },
  checkRow: { marginTop: 14, flexDirection: "row", alignItems: "flex-start", gap: 10 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, borderColor: "#9CA3AF", alignItems: "center", justifyContent: "center" },
  checkboxChecked: { backgroundColor: "#E8622C", borderColor: "#E8622C" },
  check: { color: "#fff", fontWeight: "800" },
  checkLabel: { flex: 1, fontSize: 13, lineHeight: 19, color: "#374151" },
  acceptButton: { marginTop: 18, borderRadius: 12, padding: 14, alignItems: "center", backgroundColor: "#111827" },
  acceptText: { color: "#fff", fontSize: 14, fontWeight: "800" },
  disabled: { opacity: 0.45 },
});
