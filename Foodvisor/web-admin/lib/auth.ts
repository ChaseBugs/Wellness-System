export type AdminUser = {
  email: string;
  name: string;
};

const tokenKey = "foodvisor_admin_token";
const userKey = "foodvisor_admin_user";

export function getToken() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(tokenKey) || "";
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

export function setSession(user: AdminUser) {
  localStorage.setItem(tokenKey, "local-admin-session");
  localStorage.setItem(userKey, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(tokenKey);
  localStorage.removeItem(userKey);
}
