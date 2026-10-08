import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { theme } from "@/lib/theme";

export default function AuthCallback(){
 const {handoff}=useLocalSearchParams<{handoff?:string}>();
 const {exchangeHandoff}=useAuth();
 useEffect(()=>{if(!handoff)return;void exchangeHandoff(handoff).then(()=>router.replace("/(tabs)/home")).catch(()=>router.replace("/(auth)/login"))},[handoff,exchangeHandoff]);
 return <View style={styles.screen}><ActivityIndicator color={theme.colors.ember500}/><Text style={styles.text}>Finishing your TTFL Store sign in…</Text></View>
}
const styles=StyleSheet.create({screen:{flex:1,backgroundColor:theme.colors.cloud50,alignItems:"center",justifyContent:"center"},text:{marginTop:10,color:theme.colors.textMuted,fontSize:12,fontWeight:"700"}});
