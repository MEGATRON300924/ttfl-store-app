import { Redirect } from "expo-router";
import { StyleSheet, View } from "react-native";

export default function Index() {
  return <Redirect href="/(tabs)/home" />;
}

const styles = StyleSheet.create({ loading: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#fff" } });
