import { clearSession, getAccessToken, getRefreshToken, saveSession } from "./session";

const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? "https://ttfl-store-backend.onrender.com").replace(/\/$/, "");

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

export type RequestOptions = RequestInit & { auth?: boolean; skipRefresh?: boolean };

async function rawRequest<T>(path: string, options: RequestOptions = {}, accessToken?: string | null): Promise<T> {
  if (!API_URL) throw new Error("EXPO_PUBLIC_API_URL is not configured.");

  const { auth: _auth, skipRefresh: _skipRefresh, headers, body, ...rest } = options;
  const response = await fetch(`${API_URL}${path}`, {
    ...rest,
    body,
    headers: {
      Accept: "application/json",
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(headers ?? {}),
    },
  });

  const text = await response.text();
  let payload: any = null;
  try { payload = text ? JSON.parse(text) : null; } catch { payload = null; }

  if (!response.ok) {
    throw new ApiError(payload?.message ?? payload?.error?.message ?? `Request failed (${response.status})`, response.status, payload?.code ?? payload?.error?.code);
  }
  return payload as T;
}

export async function api<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const token = await getAccessToken();
  try {
    return await rawRequest<T>(path, options, token);
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401 || options.skipRefresh || path.startsWith("/api/auth/mobile/")) throw error;
    const refreshToken = await getRefreshToken();
    if (!refreshToken) { await clearSession(); throw error; }
    try {
      const refreshed = await rawRequest<{ accessToken: string; refreshToken: string }>("/api/auth/mobile/refresh", { method: "POST", body: JSON.stringify({ refreshToken }), skipRefresh: true });
      await saveSession(refreshed);
      return await rawRequest<T>(path, options, refreshed.accessToken);
    } catch (refreshError) {
      await clearSession();
      throw refreshError;
    }
  }
}

export const apiUrl = () => API_URL;
