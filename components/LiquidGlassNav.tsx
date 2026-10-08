import { BlurView } from "expo-blur";
import { usePathname, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { useEffect, useRef } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { theme } from "@/lib/theme";

type NavItem = { key: string; label: string; icon: keyof typeof Ionicons.glyphMap; route: string };

export function LiquidGlassNav({ isVendor, isLoggedIn }: { isVendor: boolean; isLoggedIn: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const entrance = useRef(new Animated.Value(isLoggedIn ? 1 : 0.82)).current;

  useEffect(() => {
    Animated.spring(entrance, { toValue: 1, useNativeDriver: true, damping: 14, stiffness: 170 }).start();
  }, [isLoggedIn, entrance]);

  const items: NavItem[] = isLoggedIn
    ? [
        { key: "home", label: "Home", icon: "home", route: "/(tabs)/home" },
        { key: "shop", label: "Search", icon: "search", route: "/(tabs)/explore" },
        { key: "orders", label: "Orders", icon: "receipt", route: "/(tabs)/orders" },
        { key: "account", label: "Account", icon: "person", route: "/(tabs)/account" },
        ...(isVendor ? [{ key: "vendor", label: "Vendor", icon: "storefront", route: "/vendor/dashboard" } as NavItem] : []),
      ]
    : [
        { key: "home", label: "Home", icon: "home", route: "/(tabs)/home" },
        { key: "search", label: "Search", icon: "search", route: "/(tabs)/explore" },
        { key: "login", label: "Login", icon: "log-in", route: "/(auth)/login" },
      ];

  const activeKey =
    pathname.includes("/explore") ? (isLoggedIn ? "shop" : "search") :
    pathname.includes("/orders") ? "orders" :
    pathname.includes("/vendor") ? "vendor" :
    pathname.includes("/account") || pathname.includes("/wishlist") || pathname.includes("/notifications") || pathname.includes("/rewards") ? "account" :
    pathname.includes("/auth/login") ? "login" : "home";

  return (
    <Animated.View pointerEvents="box-none" style={[styles.overlay, { paddingBottom: Math.max(insets.bottom, 8) + 8, opacity: entrance, transform: [{ translateY: entrance.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) }] }]}>
      <View style={styles.shadowShell}>
        <View style={styles.shell}>
          <BlurView intensity={95} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={styles.glassWash} />
          <View style={styles.glow} />
          <View style={styles.topShine} />
          <View style={styles.nav}>
            {items.map((item) => {
              const active = activeKey === item.key;
              const icon = active ? item.icon : ((item.icon + "-outline") as keyof typeof Ionicons.glyphMap);
              return (
                <Pressable key={item.key} accessibilityRole="button" accessibilityLabel={item.label} accessibilityState={{ selected: active }} onPress={() => router.push(item.route as never)} style={styles.item}>
                  {({ pressed }) => (
                    <Animated.View style={[styles.modeButton, active && styles.modeButtonActive, pressed && styles.pressed]}>
                      <View style={[styles.iconHalo, active && styles.iconHaloActive]}>
                        <Ionicons name={icon} size={active ? 21 : 18} color={active ? theme.colors.ember500 : theme.colors.textMuted} />
                      </View>
                      <Text numberOfLines={1} style={[styles.label, active && styles.labelActive]}>{item.label}</Text>
                    </Animated.View>
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay:{position:"absolute",left:12,right:12,bottom:0,alignItems:"center"},
  shadowShell:{width:"100%",borderRadius:28,shadowColor:"#000",shadowOffset:{width:0,height:12},shadowOpacity:.42,shadowRadius:28,elevation:18},
  shell:{width:"100%",minHeight:76,borderRadius:28,overflow:"hidden",borderWidth:1,borderColor:"rgba(255,255,255,.20)",backgroundColor:"rgba(18,22,30,.64)"},
  glassWash:{...StyleSheet.absoluteFillObject,backgroundColor:"rgba(255,255,255,.045)"},
  glow:{position:"absolute",left:"25%",right:"25%",top:-22,height:44,borderRadius:30,backgroundColor:"rgba(240,106,54,.08)"},
  topShine:{position:"absolute",top:0,left:26,right:26,height:1,backgroundColor:"rgba(255,255,255,.42)"},
  nav:{minHeight:76,flexDirection:"row",alignItems:"center",justifyContent:"space-evenly",paddingHorizontal:7,paddingVertical:8},
  item:{flex:1,minWidth:0,alignItems:"center"},
  modeButton:{width:"100%",maxWidth:88,minHeight:58,borderRadius:21,alignItems:"center",justifyContent:"center",paddingHorizontal:5,gap:3},
  modeButtonActive:{backgroundColor:"rgba(255,255,255,.13)",borderWidth:1,borderColor:"rgba(255,255,255,.20)",shadowColor:"#000",shadowOffset:{width:0,height:4},shadowOpacity:.24,shadowRadius:10,elevation:4},
  iconHalo:{width:31,height:31,borderRadius:16,alignItems:"center",justifyContent:"center"},
  iconHaloActive:{backgroundColor:"rgba(240,106,54,.16)"},
  label:{fontSize:9.5,lineHeight:12,fontWeight:"700",color:theme.colors.textMuted},
  labelActive:{color:theme.colors.text,fontWeight:"900"},
  pressed:{transform:[{scale:.91}],opacity:.68},
});