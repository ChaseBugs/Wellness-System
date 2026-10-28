"use client";

import { LogOut, Maximize2, Minimize2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { clearSession, getUser } from "@/lib/auth";

export default function TopBar() {
  const router = useRouter();
  const user = getUser();
  const [density, setDensity] = useState<"comfy" | "compact">("comfy");

  useEffect(() => {
    const saved = (typeof window !== "undefined" ? localStorage.getItem("admin.density") : null) as "comfy" | "compact" | null;
    const value = saved ?? "comfy";
    setDensity(value);
    if (typeof document !== "undefined") document.body.dataset.density = value;
  }, []);

  function toggleDensity() {
    const next = density === "comfy" ? "compact" : "comfy";
    setDensity(next);
    document.body.dataset.density = next;
    localStorage.setItem("admin.density", next);
  }

  function logout() {
    clearSession();
    router.replace("/login");
  }

  return (
    <header className="topbar">
      <div>
        <strong>Foodvisor Workspace</strong>
        <span>Nutrition content operations</span>
      </div>
      <div className="topbar-actions">
        <button onClick={toggleDensity} type="button" className="density-toggle" title={`Switch to ${density === "comfy" ? "compact" : "comfy"} density`}>
          {density === "comfy" ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          {density === "comfy" ? "Compact" : "Comfy"}
        </button>
        <div>
          <strong>{user?.name || "Admin"}</strong>
          <span>{user?.email || ""}</span>
        </div>
        <button onClick={logout} type="button">
          <LogOut size={15} />
          Sign out
        </button>
      </div>
    </header>
  );
}
