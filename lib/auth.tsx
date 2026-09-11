import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type PropsWithChildren } from "react";
import { api, ApiError } from "./api";
import { clearSession, getAccessToken, saveSession, type SessionTokens } from "./session";
import { registerPushDevice, unregisterPushDevice } from "./notifications";

export type User = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string | null;
  role?: string;
  status?: string;
  emailVerified?: boolean;
  avatarUrl?: string | null;
};

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (input: { firstName: string; lastName: string; email: string; phone: string; password: string }) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const pushTokenRef = useRef<string | null>(null);

  const refreshUser = useCallback(async () => {
    const token = await getAccessToken();
    if (!token) { setUser(null); return; }
    try {
      const result = await api<{ user: User }>("/api/auth/me", { auth: true });
      setUser(result.user);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        await clearSession();
        setUser(null);
      } else {
        throw error;
      }
    }
  }, []);

  useEffect(() => {
    refreshUser().catch(() => setUser(null)).finally(() => setLoading(false));
  }, [refreshUser]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    const timer = setTimeout(() => {
      registerPushDevice().then((token) => {
        if (!cancelled) pushTokenRef.current = token;
      }).catch(() => {});
    }, 1200);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [user?.id]);

  const signIn = useCallback(async (email: string, password: string) => {
    const result = await api<{ user: User } & SessionTokens>("/api/auth/mobile/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      skipRefresh: true,
    });
    await saveSession(result);
    setUser(result.user);
  }, []);

  const signUp = useCallback(async (input: { firstName: string; lastName: string; email: string; phone: string; password: string }) => {
    const result = await api<{ user: User } & SessionTokens>("/api/auth/mobile/register/customer", {
      method: "POST",
      body: JSON.stringify(input),
      skipRefresh: true,
    });
    await saveSession(result);
    setUser(result.user);
  }, []);

  const signOut = useCallback(async () => {
    await unregisterPushDevice(pushTokenRef.current);
    pushTokenRef.current = null;
    await clearSession();
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, loading, signIn, signUp, signOut, refreshUser }), [user, loading, signIn, signUp, signOut, refreshUser]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
