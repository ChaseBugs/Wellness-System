"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, setSession } from "@/lib/api";

type LoginResponse = {
  token: string;
  user: {
    role: string;
  };
};

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(event.currentTarget);
    try {
      const data = await apiFetch<LoginResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify(Object.fromEntries(form.entries()))
      });

      if (data.user.role !== "admin") {
        throw new Error("Admin account required");
      }

      setSession(data.token, data.user);
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <h1>Height Increase Admin</h1>
        <p className="muted">Manage mobile workouts, user reports, article content, banners, and app settings.</p>
        {error ? <div className="error">{error}</div> : null}
        <div className="field">
          <label>Email</label>
          <input defaultValue="admin@height.local" name="email" required type="email" />
        </div>
        <div className="field">
          <label>Password</label>
          <input defaultValue="Admin123!" name="password" required type="password" />
        </div>
        <div className="field">
          <button className="btn primary" disabled={loading} type="submit">
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </div>
      </form>
    </main>
  );
}
