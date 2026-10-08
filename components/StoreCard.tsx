import { Ionicons } from "@expo/vector-icons";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { GlassCard } from "@/components/GlassCard";
import { theme } from "@/lib/theme";

export type MobileStore = { id:string; name:string; slug:string; logoUrl?:string|null; bannerUrl?:string|null; location?:string|null; rating?:number; productCount?:number; verified?:boolean; tier?:string|null };

export function StoreCard({ store }: { store: MobileStore }) {
  return <Pressable onPress={()=>router.push({pathname:"/vendor/[slug]",params:{slug:store.slug}})} style={({pressed})=>[styles.wrap,pressed&&styles.pressed]}>
    <GlassCard style={styles.card}>
      <View style={styles.banner}>{store.bannerUrl ? <Image source={{uri:store.bannerUrl}} style={styles.bannerImage}/> : <View style={styles.bannerFallback}/>}</View>
      <View style={styles.identity}>
        <View style={styles.logo}>{store.logoUrl ? <Image source={{uri:store.logoUrl}} style={styles.logoImage}/> : <Ionicons name="storefront-outline" size={25} color={theme.colors.ember500}/>}</View>
        <View style={styles.copy}>
          <View style={styles.nameRow}><Text numberOfLines={1} style={styles.name}>{store.name}</Text>{store.verified&&<Ionicons name="checkmark-circle" size={15} color={theme.colors.green600}/>}</View>
          <Text numberOfLines={1} style={styles.meta}>{store.location||"Nigeria"} · {store.productCount??0} products</Text>
          {!!store.rating&&<View style={styles.rating}><Ionicons name="star" size={12} color={theme.colors.gold600}/><Text style={styles.meta}>{Number(store.rating).toFixed(1)}</Text></View>}
        </View>
        {String(store.tier||"").toLowerCase().includes("platinum") && <View style={styles.platinum}><Ionicons name="diamond" size={12} color="#E6D8FF"/></View>}
      </View>
    </GlassCard>
  </Pressable>
}
const styles=StyleSheet.create({
 wrap:{width:"100%"},card:{padding:0,borderRadius:16,overflow:"hidden",backgroundColor:theme.colors.surfaceRaised,borderWidth:1,borderColor:theme.colors.glassBorder},pressed:{opacity:.82,transform:[{scale:.985}]},
 banner:{height:92,backgroundColor:theme.colors.cloud100},bannerImage:{width:"100%",height:"100%"},bannerFallback:{flex:1,backgroundColor:theme.colors.graphite800},
 identity:{padding:12,paddingTop:0,flexDirection:"row",alignItems:"center"},logo:{width:52,height:52,borderRadius:14,marginTop:-20,overflow:"hidden",backgroundColor:theme.colors.surfaceRaised,borderWidth:2,borderColor:theme.colors.glassBorder,alignItems:"center",justifyContent:"center"},logoImage:{width:"100%",height:"100%"},copy:{flex:1,marginLeft:11},nameRow:{flexDirection:"row",alignItems:"center",gap:5},name:{fontSize:14,fontWeight:"900",color:theme.colors.text,flexShrink:1},meta:{fontSize:10.5,color:theme.colors.textMuted,marginTop:4},rating:{flexDirection:"row",alignItems:"center",gap:4},platinum:{width:28,height:28,borderRadius:10,backgroundColor:"rgba(126,88,200,.22)",borderWidth:1,borderColor:"rgba(205,179,255,.35)",alignItems:"center",justifyContent:"center"}
});