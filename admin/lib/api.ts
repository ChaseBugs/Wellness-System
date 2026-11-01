import { clearSession, getRefreshToken, getToken, setTokens } from "@/lib/auth";

/** Wellness Platform API root, e.g. http://localhost:4500/api/v1 */
export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4500/api/v1";
/** Foodvisor admin resources live under /apps/foodvisor/admin; resource pages pass paths relative to it. */
export const API_URL = `${API_BASE}/apps/foodvisor/admin`;
/** Origin that serves uploaded and migrated images (`/static/...`). */
export const ASSET_ORIGIN = new URL(API_BASE).origin;

export function assetUrl(src: string) {
  return src.startsWith("/") ? `${ASSET_ORIGIN}${src}` : src;
}

export type FieldType = "text" | "number" | "textarea" | "select" | "date" | "tags" | "boolean";

export type ResourceField = {
  name: string;
  label: string;
  type: FieldType;
  options?: string[];
  required?: boolean;
};

export type ResourceColumn = {
  key: string;
  label: string;
  kind?: "image" | "boolean" | "date";
};

type ApiEnvelope<T> = {
  success?: boolean;
  data?: T;
  error?: {
    code?: string;
    message?: string;
    details?: unknown;
    reqId?: string;
  };
  meta?: Record<string, unknown>;
};

export class ApiError extends Error {
  code?: string;
  details?: unknown;
  reqId?: string;
  status?: number;
  constructor(message: string, opts: { code?: string; details?: unknown; reqId?: string; status?: number } = {}) {
    super(message);
    this.name = "ApiError";
    this.code = opts.code;
    this.details = opts.details;
    this.reqId = opts.reqId;
    this.status = opts.status;
  }
}

function isEnvelope<T>(value: unknown): value is ApiEnvelope<T> {
  return Boolean(value && typeof value === "object" && "success" in value);
}

function send(url: string, init: RequestInit | undefined, token: string) {
  return fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {})
    },
    cache: "no-store"
  });
}

let refreshing: Promise<string | null> | null = null;

/**
 * Access tokens are short-lived: on 401, rotate the refresh token once and retry. Every client in this
 * admin (fetch and the BabyGrow axios instance) shares this single in-flight refresh, because reusing a
 * rotated refresh token makes the platform revoke all of the account's sessions.
 */
export function refreshAccessToken(): Promise<string | null> {
  refreshing ??= (async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return null;
    const response = await send(`${API_BASE}/auth/refresh`, { method: "POST", body: JSON.stringify({ refreshToken }) }, "");
    if (!response.ok) return null;
    const body = (await response.json()) as ApiEnvelope<{ accessToken: string; refreshToken: string }>;
    if (!body.data) return null;
    setTokens(body.data);
    return body.data.accessToken;
  })().finally(() => {
    refreshing = null;
  });
  return refreshing;
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  let response = await send(url, init, getToken());
  if (response.status === 401 && getRefreshToken()) {
    const token = await refreshAccessToken();
    if (token) response = await send(url, init, token);
  }

  if (response.status === 401 && typeof window !== "undefined") {
    clearSession();
    window.location.replace("/login");
  }

  if (!response.ok) {
    const body: ApiEnvelope<unknown> = await response.json().catch(() => ({}));
    const e = body.error;
    throw new ApiError(e?.message ?? `Request failed: ${response.status}`, {
      code: e?.code,
      details: e?.details,
      reqId: e?.reqId,
      status: response.status
    });
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const body = await response.json();
  if (isEnvelope<T>(body)) {
    if (body.success === false) {
      throw new ApiError(body.error?.message ?? `Request failed: ${response.status}`, {
        code: body.error?.code,
        details: body.error?.details,
        reqId: body.error?.reqId,
        status: response.status
      });
    }
    return body.data as T;
  }

  return body as T;
}

/** Foodvisor admin resources: `apiFetch("/foods?page=1")` -> /apps/foodvisor/admin/foods?page=1 */
export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  return request<T>(`${API_URL}${path}`, init);
}

/** Any other platform endpoint: `platformFetch("/media/images", ...)` -> /api/v1/media/images */
export async function platformFetch<T>(path: string, init?: RequestInit): Promise<T> {
  return request<T>(`${API_BASE}${path}`, init);
}

/** Resource-kit roots, relative to API_BASE. `ResourceManager` takes one as `apiBase`. */
export const ADMIN_BASES = {
  platform: "/admin",
  foodvisor: "/apps/foodvisor/admin",
  babygrow: "/apps/babygrow/admin",
  height: "/apps/height-increase/admin"
} as const;

export async function bulkVerify(endpoint: string, ids: string[], doctorVerified: boolean, apiBase: string = ADMIN_BASES.foodvisor) {
  return platformFetch<{ matched: number; modified: number }>(`${apiBase}${endpoint}/bulk-verify`, {
    method: "PATCH",
    body: JSON.stringify({ ids, doctorVerified })
  });
}

export async function bulkDelete(endpoint: string, ids: string[], apiBase: string = ADMIN_BASES.foodvisor) {
  return platformFetch<{ deleted: number }>(`${apiBase}${endpoint}/bulk`, {
    method: "DELETE",
    body: JSON.stringify({ ids })
  });
}
