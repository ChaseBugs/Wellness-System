export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export type ApiList<T = Record<string, unknown>> = {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};

export function getToken() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("height_admin_token") || "";
}

export function setSession(token: string, user: unknown) {
  localStorage.setItem("height_admin_token", token);
  localStorage.setItem("height_admin_user", JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem("height_admin_token");
  localStorage.removeItem("height_admin_user");
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers || {})
    },
    cache: "no-store"
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data as T;
}
