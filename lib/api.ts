const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? "").replace(/\/$/, "");

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

export type RequestOptions = RequestInit & { auth?: boolean };

export async function api<T>(path: string, options: RequestOptions = {}): Promise<T> {
  if (!API_URL) throw new Error("EXPO_PUBLIC_API_URL is not configured.");

  const { auth: _auth, headers, body, ...rest } = options;
  const response = await fetch(`${API_URL}${path}`, {
    ...rest,
    body,
    headers: {
      Accept: "application/json",
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(headers ?? {}),
    },
  });

  const text = await response.text();
  let payload: any = null;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = null;
  }

  if (!response.ok) {
    throw new ApiError(
      payload?.message ?? payload?.error?.message ?? `Request failed (${response.status})`,
      response.status,
      payload?.code ?? payload?.error?.code,
    );
  }

  return payload as T;
}

export const apiUrl = () => API_URL;
