import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_BASE, ADMIN_BASES, assetUrl as resolveAsset, refreshAccessToken } from '@/lib/api';
import { clearSession, getToken } from '@/lib/auth';

/**
 * Axios client for the BabyGrow pages (ported from the TalentBaby admin). It shares the admin's session
 * and its single in-flight token refresh with the fetch client in lib/api.ts.
 */
export const API_URL = API_BASE;
/** BabyGrow admin resources (Resource kit list contract). */
export const ADMIN = ADMIN_BASES.babygrow;
export const ASSET_ORIGIN = new URL(API_BASE).origin;

export function assetUrl(url?: string | null): string | null {
  return url ? resolveAsset(url) : null;
}

let isRedirectingToLogin = false;

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json', 'X-App-Code': 'babygrow' },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err: AxiosError) => {
    const original = err.config as (InternalAxiosRequestConfig & { _retried?: boolean }) | undefined;
    if (err.response?.status === 401 && typeof window !== 'undefined' && original && !original._retried) {
      original._retried = true;
      const token = await refreshAccessToken();
      if (token) {
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      }
      clearSession();
      if (!isRedirectingToLogin && window.location.pathname !== '/login') {
        isRedirectingToLogin = true;
        window.location.replace('/login');
      }
    }
    return Promise.reject(err);
  }
);

/** Message from the platform error envelope `{ error: { message } }`. */
export function errorMessage(err: unknown, fallback = 'Request failed.'): string {
  const e = err as { response?: { data?: { error?: { message?: string } | string } }; message?: string };
  const apiError = e?.response?.data?.error;
  return (typeof apiError === 'object' ? apiError?.message : apiError) ?? e?.message ?? fallback;
}
