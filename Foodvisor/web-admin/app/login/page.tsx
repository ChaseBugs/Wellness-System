"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { setSession } from "@/lib/auth";

const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@foodvisor.local";
const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "Admin123!";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") || "");
    const password = String(form.get("password") || "");

    if (email !== adminEmail || password !== adminPassword) {
      setError("Invalid admin credentials");
      return;
    }

    setSession({ email, name: "Foodvisor Admin" });
    router.replace("/");
  }

  return (
    <main className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <div className="brand compact">
          <span className="brand-mark">F</span>
          <div>
            <strong>Foodvisor</strong>
            <small>Admin Panel</small>
          </div>
        </div>
        <h1>Sign in</h1>
        <p className="muted">Review food data, daily values, recipes, activities, users, and logs.</p>
        {error ? <div className="error no-margin">{error}</div> : null}
        <label className="auth-field">
          <span>Email</span>
          <input name="email" defaultValue={adminEmail} type="email" required />
        </label>
        <label className="auth-field">
          <span>Password</span>
          <input name="password" defaultValue={adminPassword} type="password" required />
        </label>
        <button className="primary auth-submit" type="submit">Sign in</button>
      </form>
    </main>
  );
}
