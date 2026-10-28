"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getToken } from "@/lib/api";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    setUser(JSON.parse(localStorage.getItem("height_admin_user") || "null"));
    setReady(true);
  }, [router]);

  if (!ready) {
    return <div className="auth-page muted">Loading admin...</div>;
  }

  return (
    <section className="app-shell">
      <Sidebar />
      <section className="content">
        <TopBar user={user} />
        {children}
      </section>
    </section>
  );
}
