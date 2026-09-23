import { PropsWithChildren } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

type Props = PropsWithChildren<{ style?: StyleProp<ViewStyle>; intensity?: number; dark?: boolean }>;

export function GlassCard({ children, style, dark = false }: Props) {
  return <View style={[styles.card, dark ? styles.dark : styles.light, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: { overflow: "hidden", borderRadius: 16, borderWidth: 1 },
  light: { backgroundColor: "#fff", borderColor: "#D6DAE1" },
  dark: { backgroundColor: "#1A1D24", borderColor: "#2C313B" },
});
