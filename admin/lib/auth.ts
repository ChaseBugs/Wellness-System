/** The signed-in Wellness Platform account. Only editors and admins may use this admin. */
export type AdminUser = {
  id: string;
  email: string;
  name: string;
  role: "editor" | "admin";
};

export type SessionTokens = {
  accessToken: string;
  refreshToken: string;
};

// One session for every section (platform, Foodvisor, BabyGrow, HeightIncrease).
const accessTokenKey = "wellness_admin_access_token";
const refreshTokenKey = "wellness_admin_refresh_token";
const userKey = "wellness_admin_user";

export function getToken() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(accessTokenKey) || "";
}

export function getRefreshToken() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(refreshTokenKey) || "";
}

export function getUser(): AdminUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(userKey);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AdminUser;
  } catch {
    return null;
  }
}

export function isAdmin() {
  return getUser()?.role === "admin";
}

/** Tokens come from the Wellness Platform `/auth/login`. */
export function setSession(user: AdminUser, tokens: SessionTokens) {
  localStorage.setItem(accessTokenKey, tokens.accessToken);
  localStorage.setItem(refreshTokenKey, tokens.refreshToken);
  localStorage.setItem(userKey, JSON.stringify(user));
}

export function setTokens(tokens: SessionTokens) {
  localStorage.setItem(accessTokenKey, tokens.accessToken);
  localStorage.setItem(refreshTokenKey, tokens.refreshToken);
}

export function clearSession() {
  localStorage.removeItem(accessTokenKey);
  localStorage.removeItem(refreshTokenKey);
  localStorage.removeItem(userKey);
}
