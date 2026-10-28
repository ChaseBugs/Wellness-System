"use client";

import { useRouter } from "next/navigation";
import { clearSession } from "@/lib/api";

export default function TopBar({ user }: { user: Record<string, unknown> | null }) {
  const router = useRouter();

  function logout() {
    clearSession();
    router.replace("/login");
  }

  return (
    <header className="topbar">
      <div>
        <strong>{String(user?.name || "Admin")}</strong>
        <div className="muted">{String(user?.email || "Height Increase workspace")}</div>
      </div>
      <button className="btn ghost" onClick={logout} type="button">
        Sign out
      </button>
    </header>
  );
}
