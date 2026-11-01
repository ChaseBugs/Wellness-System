"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { useDashboardStats } from "@/lib/foodvisor/useDashboardStats";
import { sectionFor, sections, type NavItem } from "@/lib/navigation";

// The two Foodvisor routes that live under the Daily Nutrition page.
const DAILY_NUTRITION_ROUTES = ["/foodvisor/daily-value-profiles", "/foodvisor/nutrient-intake-rules", "/foodvisor/nutrition-constraints"];

function isActive(item: NavItem, pathname: string, sectionHref: string) {
  if (pathname === item.href) return true;
  if (item.href === sectionHref) return false;
  if (pathname.startsWith(`${item.href}/`)) return true;
  return item.href === "/foodvisor/daily-nutrition" && DAILY_NUTRITION_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

/** Foodvisor's unverified counts only load while the Foodvisor section is open. */
function FoodvisorBadge({ statKey }: { statKey: string }) {
  const { unverified } = useDashboardStats();
  const badge = unverified[statKey] ?? 0;
  return badge > 0 ? <span className="nav-badge" aria-label={`${badge} unverified`}>{badge > 99 ? "99+" : badge}</span> : null;
}

export default function Sidebar() {
  const pathname = usePathname();
  const admin = isAdmin();
  const visible = sections.filter((section) => admin || !section.adminOnly);
  const current = sectionFor(pathname);

  return (
    <aside className="sidebar fv">
      <div className="brand">
        <span className="brand-mark">W</span>
        <div>
          <strong>Wellness Admin</strong>
          <small>{current.label}</small>
        </div>
      </div>

      <div className="app-switcher" role="navigation" aria-label="Apps">
        {visible.map(({ key, label, href, icon: Icon }) => (
          <Link className={current.key === key ? "current" : ""} href={href} key={key}>
            <Icon size={14} />
            <span>{label}</span>
          </Link>
        ))}
      </div>

      <nav className="nav">
        {current.items.map((item, index) => {
          const { group, href, label, icon: Icon, statKey } = item;
          const showGroup = group && group !== current.items[index - 1]?.group;
          return (
            <div key={href}>
              {showGroup ? <div className="nav-group">{group}</div> : null}
              <Link className={isActive(item, pathname, current.href) ? "active" : ""} href={href}>
                <Icon size={17} />
                <span>{label}</span>
                {statKey && current.key === "foodvisor" ? <FoodvisorBadge statKey={statKey} /> : null}
              </Link>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
