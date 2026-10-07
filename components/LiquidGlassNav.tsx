import { BlurView } from "expo-blur";
import { usePathname, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { theme } from "@/lib/theme";

type NavItem = {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
};

export function LiquidGlassNav({ isVendor }: { isVendor: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const items: NavItem[] = [
    { key: "home", label: "Home", icon: "home", route: "/(tabs)/home" },
    { key: "shop", label: "Shop", icon: "search", route: "/(tabs)/explore" },
    { key: "orders", label: "Orders", icon: "receipt", route: "/(tabs)/orders" },
    { key: "settings", label: "Settings", icon: "settings", route: "/(tabs)/account" },
    ...(isVendor
      ? [{ key: "vendor", label: "Vendor", icon: "storefront", route: "/vendor/dashboard" } as NavItem]
      : []),
  ];

  const activeKey = pathname.includes("/explore")
    ? "shop"
    : pathname.includes("/orders")
      ? "orders"
      : pathname.includes("/vendor")
        ? "vendor"
        : pathname.includes("/account") ||
            pathname.includes("/wishlist") ||
            pathname.includes("/notifications") ||
            pathname.includes("/rewards")
          ? "settings"
          : "home";

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.overlay,
        { paddingBottom: Math.max(insets.bottom, 8) + 8 },
      ]}
    >
      <View style={styles.shell}>
        <BlurView intensity={85} tint="light" style={StyleSheet.absoluteFill} />
        <View style={styles.glassWash} />
        <View style={styles.topShine} />

        <View style={styles.nav}>
          {items.map((item) => {
            const active = activeKey === item.key;
            const outline = (
              item.icon.endsWith("-outline")
                ? item.icon
                : (item.icon + "-outline")
            ) as keyof typeof Ionicons.glyphMap;

            return (
              <Pressable
                key={item.key}
                accessibilityRole="button"
                accessibilityLabel={item.label}
                accessibilityState={{ selected: active }}
                onPress={() => router.push(item.route as never)}
                style={({ pressed }) => [
                  styles.item,
                  active && styles.itemActive,
                  pressed && styles.pressed,
                ]}
              >
                <View style={[styles.modeButton, active && styles.modeButtonActive]}>
                  <View style={[styles.iconHalo, active && styles.iconHaloActive]}>
                    <Ionicons
                      name={active ? item.icon : outline}
                      size={active ? 20 : 18}
                      color={
                        active
                          ? theme.colors.ember600
                          : theme.colors.graphite600
                      }
                    />
                  </View>
                  <Text
                    numberOfLines={1}
                    style={[styles.label, active && styles.labelActive]}
                  >
                    {item.label}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 0,
    alignItems: "center",
  },
  shell: {
    width: "100%",
    minHeight: 70,
    borderRadius: 26,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.9)",
    backgroundColor: "rgba(255,255,255,0.54)",
    shadowColor: "#12141A",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 12,
  },
  glassWash: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(255,255,255,0.24)",
  },
  topShine: {
    position: "absolute",
    top: 0,
    left: 24,
    right: 24,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.96)",
  },
  nav: {
    minHeight: 70,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
    paddingHorizontal: 6,
    paddingVertical: 7,
  },
  item: {
    flex: 1,
    minWidth: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  itemActive: {
    flexGrow: 1.12,
  },
  pressed: {
    transform: [{ scale: 0.94 }],
    opacity: 0.72,
  },
  modeButton: {
    width: "100%",
    maxWidth: 82,
    minHeight: 54,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    gap: 3,
  },
  modeButtonActive: {
    backgroundColor: "rgba(255,255,255,0.72)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.88)",
    shadowColor: "#12141A",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 7,
    elevation: 3,
  },
  iconHalo: {
    width: 29,
    height: 29,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  iconHaloActive: {
    backgroundColor: "rgba(253,231,219,0.92)",
  },
  label: {
    fontSize: 9,
    lineHeight: 11,
    fontWeight: "700",
    color: theme.colors.graphite600,
    letterSpacing: 0.1,
  },
  labelActive: {
    color: theme.colors.ember700,
    fontWeight: "800",
  },
});
