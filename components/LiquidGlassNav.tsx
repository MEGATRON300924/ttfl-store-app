import { BlurView } from "expo-blur";
import { usePathname, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { theme } from "@/lib/theme";

type NavItem = { key: string; label: string; icon: keyof typeof Ionicons.glyphMap; route: string };

export function LiquidGlassNav({ isVendor }: { isVendor: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const items: NavItem[] = [
    { key: "home", label: "Home", icon: "home", route: "/(tabs)/home" },
    { key: "shop", label: "Shop", icon: "search", route: "/(tabs)/explore" },
    { key: "orders", label: "Orders", icon: "receipt", route: "/(tabs)/orders" },
    { key: "settings", label: "Settings", icon: "settings", route: "/(tabs)/account" },
    ...(isVendor ? [{ key: "vendor", label: "Vendor", icon: "storefront", route: "/vendor/dashboard" } as NavItem] : []),
  ];
  const activeKey = pathname.includes("/explore") ? "shop"
    : pathname.includes("/orders") ? "orders"
    : pathname.includes("/vendor") ? "vendor"
    : pathname.includes("/account") || pathname.includes("/wishlist") || pathname.includes("/notifications") || pathname.includes("/rewards") ? "settings"
    : "home";

  return <View pointerEvents="box-none" style={[styles.overlay, { paddingBottom: Math.max(insets.bottom, 8) + 6 }]}>
    <View style={styles.shell}>
      <BlurView intensity={72} tint="light" style={StyleSheet.absoluteFill} />
      <View style={styles.tint} />
      <View style={styles.nav}>
        {items.map(item => {
          const active = activeKey === item.key;
          const outline = item.icon.endsWith("-outline") ? item.icon : (item.icon + "-outline") as keyof typeof Ionicons.glyphMap;
          return <Pressable key={item.key} onPress={() => router.push(item.route as never)} style={({pressed}) => [styles.item, pressed && styles.pressed]}>
            <View style={[styles.capsule, active && styles.activeCapsule]}>
              <Ionicons name={active ? item.icon : outline} size={19} color={active ? theme.colors.ember600 : theme.colors.graphite600} />
              <Text style={[styles.label, active && styles.labelOn]}>{item.label}</Text>
            </View>
          </Pressable>;
        })}
      </View>
      <View style={styles.highlight} />
    </View>
  </View>;
}

const styles = StyleSheet.create({
  overlay:{position:"absolute",left:12,right:12,bottom:0,alignItems:"center"},
  shell:{width:"100%",minHeight:66,borderRadius:24,overflow:"hidden",borderWidth:1,borderColor:"rgba(255,255,255,0.82)",backgroundColor:"rgba(255,255,255,0.62)",shadowColor:"#12141A",shadowOffset:{width:0,height:7},shadowOpacity:0.14,shadowRadius:18,elevation:10},
  tint:{...StyleSheet.absoluteFillObject,backgroundColor:"rgba(255,255,255,0.30)"},
  nav:{minHeight:66,flexDirection:"row",alignItems:"center",justifyContent:"space-around",paddingHorizontal:5},
  item:{flex:1,alignItems:"center",justifyContent:"center"},
  pressed:{transform:[{scale:0.96}],opacity:0.78},
  capsule:{minWidth:58,height:48,borderRadius:18,alignItems:"center",justifyContent:"center",gap:2,paddingHorizontal:7},
  activeCapsule:{backgroundColor:"rgba(253,231,219,0.88)",borderWidth:1,borderColor:"rgba(232,98,44,0.18)"},
  label:{fontSize:9,fontWeight:"800",color:theme.colors.graphite600},
  labelOn:{color:theme.colors.ember700},
  highlight:{position:"absolute",top:0,left:"22%",right:"22%",height:1,backgroundColor:"rgba(255,255,255,0.92)"}
});