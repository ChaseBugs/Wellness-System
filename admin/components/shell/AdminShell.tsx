"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";
import ToastContainer from "@/components/babygrow/Toast";
import Sidebar from "@/components/shell/Sidebar";
import TopBar from "@/components/shell/TopBar";
import { getToken, isAdmin } from "@/lib/auth";
import { sectionFor } from "@/lib/navigation";

// The session lives in localStorage: read it on the client only (null while server rendering).
const subscribe = () => () => {};
const serverSnapshot = () => null;

/**
 * One shell for every section. BabyGrow pages are Tailwind screens; everything else uses the Foodvisor
 * design system, whose element styles are scoped to `.fv` so they do not leak into the Tailwind pages.
 */
export default function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const section = sectionFor(pathname);
  const access = useSyncExternalStore(
    subscribe,
    () => (!getToken() ? "signed-out" : section.adminOnly && !isAdmin() ? "forbidden" : "ok"),
    serverSnapshot
  );

  useEffect(() => {
    if (access === "signed-out") router.replace("/login");
    // Editors cannot open the platform pages.
    if (access === "forbidden") router.replace("/foodvisor");
  }, [access, router]);

  if (access !== "ok") return <div className="auth-page muted fv">Opening admin...</div>;

  const tailwindPage = section.key === "babygrow";
  return (
    <div className="admin-shell">
      <Sidebar />
      <div className="admin-content">
        <TopBar />
        <main className={tailwindPage ? "admin-main" : "admin-main fv"}>{children}</main>
      </div>
      {tailwindPage ? <ToastContainer /> : null}
    </div>
  );
}
