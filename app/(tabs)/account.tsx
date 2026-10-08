import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAuth } from "@/lib/auth";
import { theme } from "@/lib/theme";

export default function AccountScreen() {
  const { user, signOut, savedAccounts, switchAccount } = useAuth();
  const router = useRouter();
  if (!user) { return <View style={styles.loggedOut}><Ionicons name="person-circle-outline" size={62} color={theme.colors.ember500}/><Text style={styles.loggedOutTitle}>Your Account</Text><Text style={styles.loggedOutText}>Sign in to access orders, rewards, wishlist, settings and seller tools.</Text><Pressable onPress={()=>router.push("/(auth)/login")} style={styles.loginButton}><Text style={styles.loginButtonText}>Log in to TTFL Store</Text></Pressable></View>; }
  const initials = `${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}`.toUpperCase() || "T";
  const isVendor = user?.role === "VENDOR";
  const logout = () => Alert.alert("Sign out", "Are you sure you want to sign out?", [
    { text: "Cancel", style: "cancel" },
    { text: "Sign out", style: "destructive", onPress: () => signOut() }
  ]);
  return <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
    <Text style={styles.kicker}>TTFL STORE</Text><Text style={styles.title}>Account</Text>
    <Text style={styles.subtitle}>Your profile, orders and shopping tools.</Text>
    <View style={styles.profile}><View style={styles.avatar}><Text style={styles.avatarText}>{initials}</Text></View><View style={styles.profileCopy}><Text style={styles.name}>{user?.firstName || "TTFL Customer"} {user?.lastName || ""}</Text><Text style={styles.email}>{user?.email ?? "No email available"}</Text><Text style={styles.role}>{isVendor ? "Vendor account" : "Customer account"}</Text></View></View>
    {isVendor && <Pressable onPress={() => router.push("/vendor/dashboard")} style={({pressed}) => [styles.vendorButton, pressed && styles.pressed]}>
      <View style={styles.vendorIcon}><Ionicons name="storefront" size={21} color="#fff" /></View><View style={styles.vendorCopy}><Text style={styles.vendorKicker}>SELLER TOOLS</Text><Text style={styles.vendorTitle}>Open Vendor Dashboard</Text><Text style={styles.vendorSubtitle}>Manage your store, products and orders.</Text></View><Ionicons name="arrow-forward" size={19} color="#fff" />
    </Pressable>}
    <Text style={styles.section}>SHOPPING</Text>
    <CardAction icon="gift-outline" title="TTFL Rewards" subtitle="Earn and use reward points" onPress={() => router.push("/rewards")} />
    <CardAction icon="receipt-outline" title="My orders" subtitle="View and track purchases" onPress={() => router.push("/(tabs)/orders")} />
    <CardAction icon="heart-outline" title="Wishlist" subtitle="Products you saved" onPress={() => router.push("/wishlist")} />
    <CardAction icon="notifications-outline" title="Notifications" subtitle="Order and marketplace updates" onPress={() => router.push("/notifications")} />
    <Text style={styles.section}>APP</Text><CardAction icon="options-outline" title="Customize your app" subtitle="Choose your navigation and app layout" onPress={() => router.push("/account/customize")} /><CardAction icon="swap-horizontal-outline" title="Switch account" subtitle="Keep another TTFL Store account ready" onPress={() => Alert.alert("Switch account", "Choose a saved TTFL Store account.", [...savedAccounts.filter(account=>account.id!==user.id).map(account=>({text:account.email,onPress:()=>void switchAccount(account.id)})), {text:"Cancel",style:"cancel"}])} /><Text style={styles.section}>PROFILE & SECURITY</Text>
    <CardAction icon="person-outline" title="Edit profile" subtitle="Update your name and phone" onPress={() => router.push("/account/profile")} />
    <CardAction icon="location-outline" title="Saved addresses" subtitle="Manage delivery addresses" onPress={() => router.push("/account/addresses")} />
    <CardAction icon="lock-closed-outline" title="Password & security" subtitle="Change your account password" onPress={() => router.push("/account/password")} />
    {isVendor && <><Text style={styles.section}>SELLER</Text><CardAction icon="storefront-outline" title="Vendor dashboard" subtitle="Manage your TTFL Store" onPress={() => router.push("/vendor/dashboard")} /></>}
    <Pressable onPress={logout} style={styles.logout}><Ionicons name="log-out-outline" size={18} color="#B42318" /><Text style={styles.logoutText}>Sign out</Text></Pressable>
    <View style={{height:100}} />
  </ScrollView>;
}
function CardAction({icon,title,subtitle,onPress}:{icon:keyof typeof Ionicons.glyphMap;title:string;subtitle:string;onPress:()=>void}) {
  return <Pressable onPress={onPress} style={({pressed}) => [styles.action, pressed && styles.pressed]}><View style={styles.actionIcon}><Ionicons name={icon} size={19} color={theme.colors.graphite950}/></View><View style={styles.actionCopy}><Text style={styles.actionTitle}>{title}</Text><Text style={styles.actionSubtitle}>{subtitle}</Text></View><Ionicons name="chevron-forward" size={17} color={theme.colors.graphite300}/></Pressable>;
}
const styles=StyleSheet.create({
  screen:{flex:1,backgroundColor:theme.colors.cloud50},loggedOut:{flex:1,backgroundColor:theme.colors.cloud50,alignItems:"center",justifyContent:"center",padding:28},loggedOutTitle:{fontSize:28,fontWeight:"900",color:theme.colors.text,marginTop:14},loggedOutText:{fontSize:13,lineHeight:20,textAlign:"center",color:theme.colors.textMuted,marginTop:7,maxWidth:330},loginButton:{marginTop:20,height:50,paddingHorizontal:22,borderRadius:15,backgroundColor:theme.colors.ember600,alignItems:"center",justifyContent:"center"},loginButtonText:{color:"#fff",fontSize:13,fontWeight:"900"},content:{padding:18,paddingTop:62,paddingBottom:120},kicker:{fontSize:10,fontWeight:"900",letterSpacing:1.5,color:theme.colors.ember600},title:{fontSize:31,fontWeight:"900",letterSpacing:-1,color:theme.colors.text,marginTop:4},subtitle:{fontSize:13,color:theme.colors.textMuted,marginTop:5,marginBottom:18},profile:{backgroundColor:theme.colors.surface,borderWidth:1,borderColor:theme.colors.graphite200,borderRadius:10,padding:16,flexDirection:"row",alignItems:"center"},avatar:{width:52,height:52,borderRadius:10,backgroundColor:theme.colors.cloud100,alignItems:"center",justifyContent:"center"},avatarText:{fontSize:19,fontWeight:"900",color:theme.colors.graphite950},profileCopy:{flex:1,marginLeft:13},name:{fontSize:17,fontWeight:"800",color:theme.colors.graphite950},email:{fontSize:11,color:theme.colors.graphite600,marginTop:4},role:{fontSize:9,fontWeight:"800",color:theme.colors.ember600,marginTop:7},vendorButton:{minHeight:74,marginTop:14,borderRadius:18,padding:12,backgroundColor:theme.colors.graphite950,flexDirection:"row",alignItems:"center",overflow:"hidden"},vendorIcon:{width:46,height:46,borderRadius:15,backgroundColor:theme.colors.ember600,alignItems:"center",justifyContent:"center"},vendorCopy:{flex:1,marginLeft:12},vendorKicker:{fontSize:8,fontWeight:"900",letterSpacing:1.2,color:theme.colors.ember500},vendorTitle:{fontSize:14,fontWeight:"900",color:"#fff",marginTop:2},vendorSubtitle:{fontSize:10,color:"#D6DAE1",marginTop:2},section:{fontSize:9,fontWeight:"900",letterSpacing:1.4,color:theme.colors.graphite600,marginTop:25,marginBottom:8},action:{minHeight:64,backgroundColor:"#fff",borderWidth:1,borderColor:theme.colors.graphite200,borderRadius:14,padding:11,flexDirection:"row",alignItems:"center",marginBottom:8},actionIcon:{width:40,height:40,borderRadius:12,backgroundColor:theme.colors.cloud100,alignItems:"center",justifyContent:"center"},actionCopy:{flex:1,marginLeft:11},actionTitle:{fontSize:13.5,fontWeight:"900",color:theme.colors.graphite950},actionSubtitle:{fontSize:10.5,color:theme.colors.graphite600,marginTop:3},logout:{height:50,borderRadius:10,backgroundColor:"#fff",borderWidth:1,borderColor:"#F2C7BB",alignItems:"center",justifyContent:"center",flexDirection:"row",gap:8,marginTop:18},logoutText:{color:"#B42318",fontWeight:"900",fontSize:13},pressed:{opacity:.78,transform:[{scale:.985}]}
});