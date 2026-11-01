"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError, platformFetch } from "@/lib/api";
import { setSession, type AdminUser } from "@/lib/auth";

type LoginResponse = {
  user: { id: string; email: string; displayName: string | null; role: "user" | "editor" | "admin" };
  tokens: { accessToken: string; refreshToken: string };
};

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    setSubmitting(true);
    try {
      const result = await platformFetch<LoginResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: String(form.get("email") || ""), password: String(form.get("password") || "") })
      });
      if (result.user.role !== "editor" && result.user.role !== "admin") {
        setError("This account does not have admin access");
        return;
      }
      const user: AdminUser = {
        id: result.user.id,
        email: result.user.email,
        name: result.user.displayName || result.user.email,
        role: result.user.role
      };
      setSession(user, result.tokens);
      // Editors cannot open the platform pages, so they start in the first app.
      router.replace(user.role === "admin" ? "/platform" : "/foodvisor");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Sign-in failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-page fv">
      <form className="auth-card" onSubmit={submit}>
        <div className="brand compact">
          <span className="brand-mark">W</span>
          <div>
            <strong>Wellness</strong>
            <small>Admin</small>
          </div>
        </div>
        <h1>Sign in</h1>
        <p className="muted">Sign in with a Wellness Platform editor or admin account.</p>
        {error ? <div className="error no-margin">{error}</div> : null}
        <label className="auth-field">
          <span>Email</span>
          <input name="email" type="email" autoComplete="username" defaultValue="admin@wellness.local" required />
        </label>
        <label className="auth-field">
          <span>Password</span>
          <input name="password" type="password" autoComplete="current-password" required />
        </label>
        <button className="primary auth-submit" type="submit" disabled={submitting}>
          {submitting ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </main>
  );
}
