import { Stack, useLocalSearchParams } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { WebView } from "react-native-webview";
import { useRef } from "react";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "@/lib/theme";

export default function WebViewScreen(){
 const {url,title}=useLocalSearchParams<{url:string;title?:string}>();
 const web=useRef<WebView>(null);
 return <View style={styles.screen}><Stack.Screen options={{headerShown:false}}/><View style={styles.header}><Pressable onPress={()=>web.current?.goBack()}><Ionicons name="arrow-back" size={21} color={theme.colors.text}/></Pressable><Text numberOfLines={1} style={styles.title}>{title||"TTFL Store"}</Text><View style={styles.actions}><Pressable onPress={()=>web.current?.reload()}><Ionicons name="refresh" size={18} color={theme.colors.text}/></Pressable></View></View><WebView ref={web} source={{uri:url||"https://www.ttflstore.name.ng"}} style={styles.web} javaScriptEnabled domStorageEnabled sharedCookiesEnabled thirdPartyCookiesEnabled startInLoadingState/></View>
}
const styles=StyleSheet.create({screen:{flex:1,backgroundColor:theme.colors.cloud50},header:{height:72,paddingHorizontal:16,paddingTop:25,flexDirection:"row",alignItems:"center",backgroundColor:theme.colors.surface,borderBottomWidth:1,borderBottomColor:theme.colors.glassBorder},title:{flex:1,marginLeft:13,fontSize:14,fontWeight:"900",color:theme.colors.text},actions:{width:34,alignItems:"flex-end"},web:{flex:1,backgroundColor:"#fff"}});
