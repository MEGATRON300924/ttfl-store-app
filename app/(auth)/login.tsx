import { router } from "expo-router";
import { useRef } from "react";
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { WebView } from "react-native-webview";
import type { WebViewNavigation, WebViewShouldStartLoadRequest } from "react-native-webview";
import { theme } from "@/lib/theme";
import { useAuth } from "@/lib/auth";

const LOGIN_URL="https://www.ttflstore.name.ng/login?mobile-app=login";

export default function LoginScreen(){
 const web=useRef<WebView>(null);
 async function handleCallback(url:string){
  const url=e.url;
  if(url.startsWith("ttflstore://")||url.startsWith("https://ttflstore.name.ng/auth/callback")){
    router.replace("/(tabs)/home");
  }
 }
 return <View style={styles.screen}>
  <View style={styles.header}><View style={styles.brand}><Image source={require("../../assets/icon.png")} style={styles.brandLogo}/><View><Text style={styles.brandText}>TTFL Store</Text><Text style={styles.brandSub}>THE TRON FORGE MARKETPLACE</Text></View></View><Text style={styles.title}>Sign in</Text><Pressable onPress={()=>router.back()}><Text style={styles.close}>Close</Text></Pressable></View>
  <View style={styles.webShell}><WebView ref={web} source={{uri:LOGIN_URL}} onNavigationStateChange={onNavigation} onShouldStartLoadWithRequest={shouldStart} startInLoadingState renderLoading={()=> <View style={styles.loading}><ActivityIndicator color={theme.colors.ember500}/><Text style={styles.loadingText}>Loading TTFL Store…</Text></View>} sharedCookiesEnabled thirdPartyCookiesEnabled javaScriptEnabled domStorageEnabled/></View>
 </View>
}
const styles=StyleSheet.create({screen:{flex:1,backgroundColor:theme.colors.cloud50},header:{height:72,paddingHorizontal:18,paddingTop:24,backgroundColor:theme.colors.surface,flexDirection:"row",alignItems:"center",borderBottomWidth:1,borderBottomColor:theme.colors.glassBorder},brand:{flexDirection:"row",alignItems:"center",gap:9},brandLogo:{width:34,height:34,borderRadius:9},brandText:{fontSize:19,fontWeight:"900",color:theme.colors.text,letterSpacing:-1},brandSub:{fontSize:9,fontWeight:"900",letterSpacing:1.4,color:theme.colors.ember500},title:{flex:1,marginLeft:15,fontSize:17,fontWeight:"900",color:theme.colors.text},close:{fontSize:12,fontWeight:"800",color:theme.colors.textMuted},webShell:{flex:1,overflow:"hidden",backgroundColor:"#fff"},loading:{flex:1,alignItems:"center",justifyContent:"center",backgroundColor:theme.colors.cloud50},loadingText:{marginTop:8,fontSize:12,color:theme.colors.textMuted}});
