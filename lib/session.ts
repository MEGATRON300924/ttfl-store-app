import * as SecureStore from "expo-secure-store";

const ACCESS_KEY = "ttfl.accessToken";
const REFRESH_KEY = "ttfl.refreshToken";
const SAVED_ACCOUNTS_KEY = "ttfl.savedAccounts";\n\nexport type SavedAccount = { id:string; email:string; firstName?:string; lastName?:string; role?:string; refreshToken:string };

export type SessionTokens = { accessToken: string; refreshToken: string };

export async function getAccessToken() {
  return SecureStore.getItemAsync(ACCESS_KEY);
}

export async function getRefreshToken() {
  return SecureStore.getItemAsync(REFRESH_KEY);
}

export async function saveSession(tokens: SessionTokens) {
  await Promise.all([
    SecureStore.setItemAsync(ACCESS_KEY, tokens.accessToken),
    SecureStore.setItemAsync(REFRESH_KEY, tokens.refreshToken),
  ]);
}

export async function saveAccountSession(user: {id:string;email:string;firstName?:string;lastName?:string;role?:string}, tokens: SessionTokens) {\n  const raw = await SecureStore.getItemAsync(SAVED_ACCOUNTS_KEY);\n  let accounts: SavedAccount[] = []; try { accounts = raw ? JSON.parse(raw) : []; } catch {}\n  const next = accounts.filter(account => account.id !== user.id);\n  next.unshift({ id:user.id, email:user.email, firstName:user.firstName, lastName:user.lastName, role:user.role, refreshToken:tokens.refreshToken });\n  await SecureStore.setItemAsync(SAVED_ACCOUNTS_KEY, JSON.stringify(next.slice(0,5)));\n}\n\nexport async function getSavedAccounts() {\n  const raw = await SecureStore.getItemAsync(SAVED_ACCOUNTS_KEY);\n  try { return raw ? JSON.parse(raw) as SavedAccount[] : []; } catch { return []; }\n}\n\nexport async function removeSavedAccount(id:string) {\n  const accounts=await getSavedAccounts(); await SecureStore.setItemAsync(SAVED_ACCOUNTS_KEY,JSON.stringify(accounts.filter(account=>account.id!==id)));\n}\n\nexport async function clearSession() {
  await Promise.all([
    SecureStore.deleteItemAsync(ACCESS_KEY),
    SecureStore.deleteItemAsync(REFRESH_KEY),
  ]);
}
