import { Redirect } from "expo-router";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useAuth } from "@/lib/auth";

export default function Index() {
  const { user, loading } = useAuth();
  if (loading) return <View style={styles.loading}><ActivityIndicator size="large" /></View>;
  return <Redirect href={user ? "/(tabs)/home" : "/(auth)/login"} />;
}

const styles = StyleSheet.create({ loading: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#fff" } });
