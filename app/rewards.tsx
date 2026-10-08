import { Animated, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Stack } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { GlassCard } from "@/components/GlassCard";
import { theme } from "@/lib/theme";

type Wallet = { pointsBalance:number; lifetimeEarned:number; lifetimeRedeemed:number; lifetimeSpend:number; completedOrders:number; level:string };
type Ledger = { id:string; type:string; points:number; description:string; expiresAt:string|null; createdAt:string };

export default function RewardsScreen() {
  const [wallet,setWallet]=useState<Wallet|null>(null);
  const [history,setHistory]=useState<Ledger[]>([]);
  const [appDownloadPoints,setAppDownloadPoints]=useState(500);
  const [claimed,setClaimed]=useState(false);
  const [loading,setLoading]=useState(true);
  const [claiming,setClaiming]=useState(false);
  const [error,setError]=useState("");\n  const fade=useRef(new Animated.Value(0)).current;

  async function load() {
    setLoading(true); setError("");
    try {
      const result=await api<{wallet:Wallet;history:Ledger[];appDownloadPoints:number}>("/api/rewards/me",{auth:true});
      setWallet(result.wallet); setHistory(result.history??[]); setAppDownloadPoints(Number(result.appDownloadPoints)||500);
      setClaimed((result.history??[]).some(item=>item.type==="APP_DOWNLOAD"));
    } catch(e) { setError(e instanceof ApiError?e.message:"Could not load rewards."); }
    finally { setLoading(false); }
  }

  useEffect(()=>{void load();Animated.timing(fade,{toValue:1,duration:450,useNativeDriver:true}).start()},[fade]);

  async function claim() {
    setClaiming(true); setError("");
    try {
      const result=await api<{reward:{claimed:boolean;points:number}}>("/api/rewards/app-download",{method:"POST",auth:true,body:JSON.stringify({platform:Platform.OS==="ios"?"IOS":"ANDROID"})});
      if(result.reward?.claimed) setClaimed(true);
      await load();
    } catch(e) { setError(e instanceof ApiError?e.message:"Could not claim this reward."); }
    finally { setClaiming(false); }
  }

  return <Animated.ScrollView style={[styles.screen,{opacity:fade}]} contentContainerStyle={styles.content}>
    <Stack.Screen options={{headerShown:true,title:"TTFL Rewards"}} />
    <Text style={styles.kicker}>TTFL STORE</Text>
    <Text style={styles.title}>TTFL Rewards</Text>
    <Text style={styles.subtitle}>Earn points while you shop and use them on eligible orders.</Text>
    <GlassCard style={styles.hero}>
      <Text style={styles.label}>AVAILABLE POINTS</Text>
      <Text style={styles.points}>{loading?"—":Number(wallet?.pointsBalance??0).toLocaleString()}</Text>
      <View style={styles.row}><Text style={styles.level}>LEVEL</Text><Text style={styles.levelValue}>{wallet?.level??"BRONZE"}</Text></View>
      <Text style={styles.note}>1 point = ₦1 · Up to 20% of an eligible order can be paid with points.</Text>
    </GlassCard>
    <GlassCard style={styles.card}>
      <Text style={styles.cardTitle}>App download reward</Text>
      <Text style={styles.cardText}>Claim {appDownloadPoints.toLocaleString()} points for downloading the TTFL Store app. This reward can only be claimed once.</Text>
      <Pressable disabled={claimed||claiming} onPress={claim} style={[styles.button,(claimed||claiming)&&styles.disabled]}><Text style={styles.buttonText}>{claimed?"Reward claimed ✓":claiming?"Claiming…":`Claim ${appDownloadPoints.toLocaleString()} points`}</Text></Pressable>
    </GlassCard>
    {!!error&&<Text style={styles.error}>{error}</Text>}
    <View style={styles.stats}><Stat label="Lifetime earned" value={wallet?.lifetimeEarned}/><Stat label="Orders" value={wallet?.completedOrders}/><Stat label="Redeemed" value={wallet?.lifetimeRedeemed}/></View>
    <Text style={styles.section}>REWARD HISTORY</Text>
    {history.length===0?<Text style={styles.empty}>No reward activity yet.</Text>:history.map(item=><View key={item.id} style={styles.item}><View style={styles.itemCopy}><Text style={styles.itemTitle}>{item.description}</Text><Text style={styles.itemDate}>{new Date(item.createdAt).toLocaleDateString("en-NG",{dateStyle:"medium"})}</Text></View><Text style={[styles.itemPoints,item.points<0&&styles.negative]}>{item.points>0?"+":""}{item.points.toLocaleString()}</Text></View>)}
  </ScrollView>
}
function Stat({label,value}:{label:string;value?:number}){return <View style={styles.stat}><Text style={styles.statLabel}>{label}</Text><Text style={styles.statValue}>{Number(value??0).toLocaleString()}</Text></View>}
const styles=StyleSheet.create({screen:{flex:1,backgroundColor:theme.colors.cloud50},content:{padding:18,paddingTop:58,paddingBottom:80},kicker:{fontSize:10,fontWeight:"900",letterSpacing:1.5,color:theme.colors.ember600},title:{fontSize:31,fontWeight:"900",letterSpacing:-1,color:theme.colors.text,marginTop:4},subtitle:{fontSize:13,color:theme.colors.textMuted,marginTop:5,marginBottom:18},hero:{padding:20,borderRadius: theme.radius.card,backgroundColor:theme.colors.graphite950},label:{fontSize:9,fontWeight:"900",letterSpacing:1.4,color:theme.colors.textMuted},points:{fontSize:38,fontWeight:"900",color:"#fff",marginTop:5},row:{flexDirection:"row",justifyContent:"space-between",marginTop:17,paddingTop:13,borderTopWidth:1,borderTopColor:"rgba(255,255,255,.12)"},level:{fontSize:9,fontWeight:"900",letterSpacing:1,color:theme.colors.graphite400},levelValue:{fontSize:12,fontWeight:"900",color:"#fff"},note:{fontSize:11,color:theme.colors.graphite200,lineHeight:17,marginTop:12},card:{padding:17,borderRadius: theme.radius.card,marginTop:12},cardTitle:{fontSize:15,fontWeight:"900",color:theme.colors.graphite950},cardText:{fontSize:12,color:theme.colors.graphite600,lineHeight:18,marginTop:6},button:{height:48,borderRadius: theme.radius.card,backgroundColor:theme.colors.graphite950,alignItems:"center",justifyContent:"center",marginTop:14},buttonText:{color:"#fff",fontSize:13,fontWeight:"900"},disabled:{opacity:.5},error:{fontSize:12,color:theme.colors.ember700,lineHeight:18,marginTop:10},stats:{flexDirection:"row",gap:8,marginTop:12},stat:{flex:1,backgroundColor:theme.colors.surfaceRaised,borderWidth:1,borderColor:theme.colors.glassBorder,borderRadius: theme.radius.card,padding:12},statLabel:{fontSize:9,color:theme.colors.graphite600,fontWeight:"800"},statValue:{fontSize:16,color:theme.colors.graphite950,fontWeight:"900",marginTop:5},section:{fontSize:9,fontWeight:"900",letterSpacing:1.4,color:theme.colors.graphite600,marginTop:25,marginBottom:8},empty:{fontSize:13,color:theme.colors.graphite600},item:{backgroundColor:"#fff",borderWidth:1,borderColor:theme.colors.graphite200,borderRadius: theme.radius.card,padding:13,flexDirection:"row",alignItems:"center",marginBottom:7},itemCopy:{flex:1},itemTitle:{fontSize:12,fontWeight:"800",color:theme.colors.graphite950},itemDate:{fontSize:10,color:theme.colors.graphite600,marginTop:3},itemPoints:{fontSize:13,fontWeight:"900",color:theme.colors.green700},negative:{color:theme.colors.ember700}});
