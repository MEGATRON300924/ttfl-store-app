import { PropsWithChildren } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { theme } from "@/lib/theme";

type Props = PropsWithChildren<{ style?: StyleProp<ViewStyle>; intensity?: number; dark?: boolean }>;

export function GlassCard({ children, style, dark = false }: Props) {
  return (
    <View style={[styles.card, dark ? styles.dark : styles.light, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: "hidden",
    borderRadius: theme.radius.card,
    borderWidth: 1,
    ...theme.shadow.card,
  },
  light: { backgroundColor: theme.colors.white, borderColor: theme.colors.graphite200 },
  dark: { backgroundColor: theme.colors.graphite950, borderColor: theme.colors.graphite700 },
});
