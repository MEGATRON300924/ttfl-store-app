import { Link, router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { theme } from "@/lib/theme";

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email,setEmail]=useState(""); const [password,setPassword]=useState(""); const [error,setError]=useState(""); const [busy,setBusy]=useState(false);

  async function submit(){
    setError("");
    const normalizedEmail=email.trim().toLowerCase();
    if(!normalizedEmail||!password) return setError("Enter your email and password.");
    if(!/^\S+@\S+\.\S+$/.test(normalizedEmail)) return setError("Enter a valid email address.");
    setBusy(true);
    try { await signIn(normalizedEmail,password); router.replace("/(tabs)/home"); }
    catch(err){ setError(err instanceof ApiError?err.message:"Unable to sign in right now."); }
    finally{ setBusy(false); }
  }

  return <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS==="ios"?"padding":undefined}>
    <View style={styles.shell}>
      <View style={styles.form}>
        <Text style={styles.title}>Log in to TTFL Store</Text>
        <Text style={styles.subtitle}>Access your account, orders and shopping tools.</Text>
        <View style={styles.divider}><View style={styles.line}/><Text style={styles.or}>continue with email</Text><View style={styles.line}/></View>
        <Field label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} autoComplete="email"/>
        <View style={styles.field}>
          <View style={styles.labelRow}><Text style={styles.label}>Password</Text><Pressable onPress={()=>router.push("/(auth)/forgot-password")}><Text style={styles.forgot}>Forgot password?</Text></Pressable></View>
          <TextInput value={password} onChangeText={setPassword} style={styles.input} secureTextEntry autoCapitalize="none" autoCorrect={false} autoComplete="password" onSubmitEditing={submit}/>
        </View>
        {!!error&&<Text style={styles.error}>{error}</Text>}
        <Pressable onPress={submit} disabled={busy} style={({pressed})=>[styles.button,pressed&&styles.pressed,busy&&styles.disabled]}>{busy?<ActivityIndicator color="#fff"/>:<Text style={styles.buttonText}>Log in</Text>}</Pressable>
        <Text style={styles.footer}>New here? <Link href="/(auth)/register" style={styles.link}>Create an account</Link></Text>
        <Text style={styles.footer2}>Want to sell? <Link href="/sell" style={styles.link}>Become a vendor</Link></Text>
      </View>
    </View>
  </KeyboardAvoidingView>;
}
function Field({label,...props}:{label:string}&React.ComponentProps<typeof TextInput>){return <View style={styles.field}><Text style={styles.label}>{label}</Text><TextInput {...props} style={styles.input}/></View>}
const styles=StyleSheet.create({
 screen:{flex:1,backgroundColor:theme.colors.cloud50},shell:{flex:1,justifyContent:"center",paddingHorizontal:18},form:{width:"100%",maxWidth:420,alignSelf:"center"},
 title:{fontSize:21,fontWeight:"800",color:theme.colors.graphite900},subtitle:{fontSize:13,color:theme.colors.graphite600,marginTop:5},
 divider:{flexDirection:"row",alignItems:"center",gap:10,marginVertical:22},line:{flex:1,height:1,backgroundColor:theme.colors.graphite200},or:{fontSize:11,color:theme.colors.graphite400},
 field:{marginBottom:15},labelRow:{flexDirection:"row",alignItems:"center",justifyContent:"space-between"},label:{fontSize:13,fontWeight:"600",color:theme.colors.graphite700,marginBottom:5},forgot:{fontSize:11,color:theme.colors.ember600,fontWeight:"600",marginBottom:5},
 input:{height:44,borderWidth:1,borderColor:theme.colors.graphite200,borderRadius:7,paddingHorizontal:12,fontSize:14,color:theme.colors.graphite900,backgroundColor:"#fff"},
 error:{backgroundColor:theme.colors.ember100,color:theme.colors.ember700,borderRadius:7,paddingHorizontal:12,paddingVertical:9,fontSize:12,marginBottom:4},
 button:{height:44,borderRadius:10,backgroundColor:theme.colors.ember600,alignItems:"center",justifyContent:"center",marginTop:7},buttonText:{color:"#fff",fontSize:13,fontWeight:"700"},pressed:{opacity:.82},disabled:{opacity:.6},
 footer:{textAlign:"center",marginTop:20,fontSize:13,color:theme.colors.graphite600},footer2:{textAlign:"center",marginTop:7,fontSize:13,color:theme.colors.graphite600},link:{color:theme.colors.ember600,fontWeight:"600"}
});