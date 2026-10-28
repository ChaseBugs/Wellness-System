"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "@/lib/resources";

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-mark">HI</span>
        <div>
          <strong>Height Increase</strong>
          <small>Admin Panel</small>
        </div>
      </div>
      <nav className="nav">
        {navItems.map(([key, title]) => {
          const href = key === "dashboard" ? "/dashboard" : `/${key}`;
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link className={active ? "active" : ""} href={href} key={key}>
              {title}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
