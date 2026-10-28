"use client";

import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import AuthGuard from "@/components/AuthGuard";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="admin-shell">
        <Sidebar />
        <div className="admin-content">
          <TopBar />
          <main className="admin-main">{children}</main>
        </div>
      </div>
    </AuthGuard>
  );
}
