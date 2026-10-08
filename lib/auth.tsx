import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type PropsWithChildren } from "react";
import { api, ApiError } from "./api";
import { clearSession, getAccessToken, getSavedAccounts, saveAccountSession, saveSession, type SessionTokens } from "./session";
import { registerPushDevice, unregisterPushDevice } from "./notifications";

export type User = { id:string; email:string; firstName?:string; lastName?:string; phone?:string|null; role?:string; status?:string; emailVerified?:boolean; avatarUrl?:string|null; termsAcceptedVersion?:string|null; termsAcceptedAt?:string|null };
type SavedAccount = Awaited<ReturnType<typeof getSavedAccounts>>[number];

type AuthContextValue = {
 user:User|null; loading:boolean; savedAccounts:SavedAccount[];
 signIn:(email:string,password:string)=>Promise<void>;
 signUp:(input:{firstName:string;lastName:string;email:string;phone:string;password:string})=>Promise<void>;
 signOut:()=>Promise<void>; refreshUser:()=>Promise<void>; exchangeHandoff:(token:string)=>Promise<void>; switchAccount:(id:string)=>Promise<void>;
};
const AuthContext=createContext<AuthContextValue|null>(null);

export function AuthProvider({children}:PropsWithChildren){
 const [user,setUser]=useState<User|null>(null);
 const [loading,setLoading]=useState(true);
 const [savedAccounts,setSavedAccounts]=useState<SavedAccount[]>([]);
 const pushTokenRef=useRef<string|null>(null);

 const refreshUser=useCallback(async()=>{const token=await getAccessToken();if(!token){setUser(null);return;}try{const result=await api<{user:User}>("/api/auth/me",{auth:true});setUser(result.user)}catch(error){if(error instanceof ApiError&&error.status===401){await clearSession();setUser(null)}else throw error}},[]);
 useEffect(()=>{getSavedAccounts().then(setSavedAccounts).catch(()=>{});refreshUser().catch(()=>setUser(null)).finally(()=>setLoading(false))},[refreshUser]);
 useEffect(()=>{if(!user)return;let cancelled=false;const timer=setTimeout(()=>{registerPushDevice().then(token=>{if(!cancelled)pushTokenRef.current=token}).catch(()=>{})},1200);return()=>{cancelled=true;clearTimeout(timer)}},[user?.id]);

 const establishSession=useCallback(async(result:{user:User}&SessionTokens)=>{await saveSession(result);await saveAccountSession(result.user,result);setSavedAccounts(await getSavedAccounts());setUser(result.user)},[]);
 const exchangeHandoff=useCallback(async(token:string)=>{const result=await api<{user:User}&SessionTokens>("/api/auth/handoff/exchange",{method:"POST",body:JSON.stringify({token}),skipRefresh:true});await establishSession(result)},[establishSession]);
 const signIn=useCallback(async(email:string,password:string)=>{const result=await api<{user:User}&SessionTokens>("/api/auth/mobile/login",{method:"POST",body:JSON.stringify({email,password}),skipRefresh:true});await establishSession(result)},[establishSession]);
 const signUp=useCallback(async(input:{firstName:string;lastName:string;email:string;phone:string;password:string})=>{const result=await api<{user:User}&SessionTokens>("/api/auth/mobile/register/customer",{method:"POST",body:JSON.stringify(input),skipRefresh:true});await establishSession(result)},[establishSession]);
 const switchAccount=useCallback(async(id:string)=>{const account=(await getSavedAccounts()).find(item=>item.id===id);if(!account)return;const result=await api<{user:User}&SessionTokens>("/api/auth/mobile/refresh",{method:"POST",body:JSON.stringify({refreshToken:account.refreshToken}),skipRefresh:true});await establishSession(result)},[establishSession]);
 const signOut=useCallback(async()=>{await unregisterPushDevice(pushTokenRef.current);pushTokenRef.current=null;await clearSession();setUser(null)},[]);

 const value=useMemo(()=>({user,loading,savedAccounts,signIn,signUp,signOut,refreshUser,exchangeHandoff,switchAccount}),[user,loading,savedAccounts,signIn,signUp,signOut,refreshUser,exchangeHandoff,switchAccount]);
 return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth(){const value=useContext(AuthContext);if(!value)throw new Error("useAuth must be used inside AuthProvider");return value;}
