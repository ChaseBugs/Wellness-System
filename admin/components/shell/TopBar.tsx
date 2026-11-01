"use client";

import { LogOut, Maximize2, Minimize2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { clearSession, getUser } from "@/lib/auth";
import { sectionFor } from "@/lib/navigation";

const SUBTITLES: Record<string, string> = {
  platform: "Accounts, subscriptions, review and growth across every app",
  foodvisor: "Nutrition content operations",
  babygrow: "Baby development content and families",
  height: "Training content, reports and app settings"
};

export default function TopBar() {
  const router = useRouter();
  const pathname = usePathname();
  const section = sectionFor(pathname);
  const user = getUser();
  // AdminShell renders this only on the client, so localStorage is available here.
  const [density, setDensity] = useState<"comfy" | "compact">(
    () => (localStorage.getItem("admin.density") as "comfy" | "compact" | null) ?? "comfy"
  );

  useEffect(() => {
    document.body.dataset.density = density;
  }, [density]);

  function toggleDensity() {
    const next = density === "comfy" ? "compact" : "comfy";
    setDensity(next);
    localStorage.setItem("admin.density", next);
  }

  function logout() {
    clearSession();
    router.replace("/login");
  }

  return (
    <header className="topbar fv">
      <div>
        <strong>{section.label}</strong>
        <span>{SUBTITLES[section.key]}</span>
      </div>
      <div className="topbar-actions">
        <button onClick={toggleDensity} type="button" className="density-toggle" title={`Switch to ${density === "comfy" ? "compact" : "comfy"} density`}>
          {density === "comfy" ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          {density === "comfy" ? "Compact" : "Comfy"}
        </button>
        <div>
          <strong>{user?.name || "Admin"}</strong>
          <span>{user ? `${user.email} · ${user.role}` : ""}</span>
        </div>
        <button onClick={logout} type="button">
          <LogOut size={15} />
          Sign out
        </button>
      </div>
    </header>
  );
}
