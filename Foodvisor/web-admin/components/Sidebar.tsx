"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "@/lib/navigation";
import { useDashboardStats } from "@/lib/useDashboardStats";

export default function Sidebar() {
  const pathname = usePathname();
  const { unverified } = useDashboardStats();
  let lastGroup: string | null | undefined;

  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-mark">F</span>
        <div>
          <strong>Foodvisor</strong>
          <small>Admin Panel</small>
        </div>
      </div>

      <nav className="nav">
        {navItems.map(({ group, href, label, icon: Icon, statKey }) => {
          const showGroup = group && group !== lastGroup;
          lastGroup = group;
          const dailyNutritionRoutes = ["/daily-value-profiles", "/nutrient-intake-rules", "/nutrition-constraints"];
          const active = pathname === href
            || (href !== "/" && pathname.startsWith(`${href}/`))
            || (href === "/daily-nutrition" && dailyNutritionRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`)));
          const badge = statKey ? unverified[statKey] ?? 0 : 0;

          return (
            <div key={href}>
              {showGroup ? <div className="nav-group">{group}</div> : null}
              <Link className={active ? "active" : ""} href={href}>
                <Icon size={17} />
                <span>{label}</span>
                {badge > 0 ? <span className="nav-badge" aria-label={`${badge} unverified`}>{badge > 99 ? "99+" : badge}</span> : null}
              </Link>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
