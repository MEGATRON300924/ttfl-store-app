import { BlurView } from "expo-blur";
import { PropsWithChildren } from "react";
import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

type Props = PropsWithChildren<{ style?: StyleProp<ViewStyle>; intensity?: number; dark?: boolean }>;

export function GlassCard({ children, style, intensity = 34, dark = false }: Props) {
  return (
    <View style={[styles.shell, dark ? styles.darkShell : styles.lightShell, style]}>
      <BlurView
        intensity={intensity}
        tint={dark ? "dark" : "light"}
        blurMethod={Platform.OS === "android" ? "dimezisBlurViewSdk31Plus" : undefined}
        style={StyleSheet.absoluteFill}
      />
      <View pointerEvents="none" style={[styles.highlight, dark ? styles.darkHighlight : styles.lightHighlight]} />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: { overflow: "hidden", borderRadius: 22, borderWidth: 1 },
  lightShell: { backgroundColor: "rgba(255,255,255,0.62)", borderColor: "rgba(255,255,255,0.82)" },
  darkShell: { backgroundColor: "rgba(17,17,17,0.68)", borderColor: "rgba(255,255,255,0.16)" },
  highlight: { ...StyleSheet.absoluteFillObject, borderRadius: 22, borderTopWidth: 1 },
  lightHighlight: { borderTopColor: "rgba(255,255,255,0.95)" },
  darkHighlight: { borderTopColor: "rgba(255,255,255,0.22)" },
  content: { zIndex: 1 },
});
