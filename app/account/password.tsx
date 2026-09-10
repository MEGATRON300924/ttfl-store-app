import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { GlassCard } from "@/components/GlassCard";
import { api, ApiError } from "@/lib/api";

export default function PasswordScreen() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  async function save() {
    if (!currentPassword || newPassword.length < 8) return Alert.alert("Check your password", "Your new password must be at least 8 characters.");
    if (newPassword !== confirm) return Alert.alert("Passwords do not match", "Enter the same new password twice.");
    setSaving(true);
    try { await api("/api/auth/change-password", { method: "POST", body: JSON.stringify({ currentPassword, newPassword }) }); Alert.alert("Password changed", "Your password has been updated.", [{ text: "Done", onPress: () => router.back() }]); }
    catch (error) { Alert.alert("Could not change password", error instanceof ApiError ? error.message : "Please try again."); }
    finally { setSaving(false); }
  }
  return <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled"><View style={styles.header}><Pressable onPress={() => router.back()} style={styles.back}><Ionicons name="arrow-back" size={21} color="#111" /></Pressable><Text style={styles.title}>Password & security</Text><View style={styles.spacer} /></View><GlassCard style={styles.card} intensity={26}><Field label="Current password" value={currentPassword} onChangeText={setCurrentPassword} secureTextEntry /><Field label="New password" value={newPassword} onChangeText={setNewPassword} secureTextEntry /><Field label="Confirm new password" value={confirm} onChangeText={setConfirm} secureTextEntry last /></GlassCard><Pressable disabled={saving} onPress={save} style={({ pressed }) => [styles.button, pressed && styles.pressed, saving && styles.disabled]}><Text style={styles.buttonText}>{saving ? "Updating…" : "Update password"}</Text></Pressable></ScrollView>;
}
function Field({ label, last, ...props }: { label: string; last?: boolean } & React.ComponentProps<typeof TextInput>) { return <View style={[styles.field, !last && styles.border]}><Text style={styles.label}>{label}</Text><TextInput {...props} style={styles.input} placeholderTextColor="#aaa" /></View>; }
const styles = StyleSheet.create({ screen:{flex:1,backgroundColor:"#f7f7f7"},content:{padding:18,paddingTop:58,paddingBottom:50},header:{flexDirection:"row",alignItems:"center",marginBottom:22},back:{width:42,height:42,borderRadius:14,backgroundColor:"rgba(255,255,255,.72)",alignItems:"center",justifyContent:"center"},spacer:{width:42},title:{flex:1,textAlign:"center",fontSize:19,fontWeight:"800",color:"#111"},card:{paddingHorizontal:16,borderRadius:20},field:{paddingVertical:14},border:{borderBottomWidth:1,borderBottomColor:"rgba(0,0,0,.06)"},label:{fontSize:11,color:"#999",marginBottom:4},input:{color:"#111",fontSize:15,fontWeight:"600",paddingVertical:3},button:{height:54,borderRadius:17,backgroundColor:"#111",alignItems:"center",justifyContent:"center",marginTop:18},buttonText:{color:"#fff",fontWeight:"800",fontSize:15},pressed:{opacity:.8},disabled:{opacity:.55}}
