import * as SecureStore from "expo-secure-store";

const ACCESS_KEY = "ttfl.accessToken";
const REFRESH_KEY = "ttfl.refreshToken";
const SAVED_ACCOUNTS_KEY = "ttfl.savedAccounts";

export type SavedAccount = { id:string; email:string; firstName?:string; lastName?:string; role?:string; refreshToken:string };

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

export async function saveAccountSession(user: {id:string;email:string;firstName?:string;lastName?:string;role?:string}, tokens: SessionTokens) {
  const raw = await SecureStore.getItemAsync(SAVED_ACCOUNTS_KEY);
  let accounts: SavedAccount[] = []; try { accounts = raw ? JSON.parse(raw) : []; } catch {}
  const next = accounts.filter(account => account.id !== user.id);
  next.unshift({ id:user.id, email:user.email, firstName:user.firstName, lastName:user.lastName, role:user.role, refreshToken:tokens.refreshToken });
  await SecureStore.setItemAsync(SAVED_ACCOUNTS_KEY, JSON.stringify(next.slice(0,5)));
}

export async function getSavedAccounts() {
  const raw = await SecureStore.getItemAsync(SAVED_ACCOUNTS_KEY);
  try { return raw ? JSON.parse(raw) as SavedAccount[] : []; } catch { return []; }
}

export async function removeSavedAccount(id:string) {
  const accounts=await getSavedAccounts(); await SecureStore.setItemAsync(SAVED_ACCOUNTS_KEY,JSON.stringify(accounts.filter(account=>account.id!==id)));
}

export async function clearSession() {
  await Promise.all([
    SecureStore.deleteItemAsync(ACCESS_KEY),
    SecureStore.deleteItemAsync(REFRESH_KEY),
  ]);
}
