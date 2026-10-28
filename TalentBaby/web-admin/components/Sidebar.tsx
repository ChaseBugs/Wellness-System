'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getUser } from '@/lib/auth';

const nav = [
  { group: null,        href: '/dashboard',       label: 'Dashboard',       icon: '📊' },
  { group: 'Users',    href: '/users',           label: 'Users',           icon: '👥' },
  { group: 'Users',    href: '/babies',          label: 'Babies',          icon: '👶' },
  { group: 'Users',    href: '/doctors',         label: 'Doctors',         icon: '🩺' },
  { group: 'Users',    href: '/points',          label: 'Points & Ranks',  icon: '🏆' },
  { group: 'Content',   href: '/activities',       label: 'Activities',      icon: '🎯' },
  { group: 'Content',   href: '/milestones',        label: 'Milestones',       icon: '🏅' },
  { group: 'Content',   href: '/milestones/babies', label: 'Milestone Progress',icon: '📋' },
  { group: 'Content',   href: '/wisdom',           label: 'Wisdom & Insights',icon: '💡' },
  { group: 'Content',   href: '/messages',         label: 'Admin Messages',  icon: '📣' },
  { group: 'Content',   href: '/user-articles',    label: 'User Articles',   icon: '✍️' },
  { group: 'Content',   href: '/recipes',          label: 'Recipes',         icon: '🍽️' },
  { group: 'Content',   href: '/stories',          label: 'Stories',         icon: '📚' },
  { group: 'Content',   href: '/expert-classes',   label: 'Expert Classes',  icon: '🎓' },
  { group: 'Content',   href: '/guides',           label: 'Guides',          icon: '📖' },
  { group: 'Nutrition', href: '/nutrition',         label: 'Nutrition Foods', icon: '🥗' },
  { group: 'Nutrition', href: '/calorie/foods',    label: 'Food DB',         icon: '🥦' },
  { group: 'Nutrition', href: '/calorie/analysis', label: 'Calorie Analysis',icon: '🔥' },
  { group: 'Community', href: '/family',           label: 'Family Sharing',  icon: '👨‍👩‍👧' },
  { group: 'Community', href: '/community',        label: 'Community',       icon: '💬' },
  { group: 'Reports',   href: '/analytics',        label: 'Analytics',       icon: '📈' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const user = getUser();

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-slate-100 flex flex-col shadow-sm">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🍼</span>
          <div>
            <div className="font-bold text-slate-800 text-sm">Talent Baby</div>
            <div className="text-xs text-slate-400">Admin Panel</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto scrollbar-thin">
        {(() => {
          const items: React.ReactNode[] = [];
          let lastGroup: string | null = undefined as unknown as string | null;
          nav.forEach(({ group, href, label, icon }) => {
            if (group !== lastGroup) {
              if (group) {
                items.push(
                  <div key={`g-${group}`} className="px-3 pt-4 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {group}
                  </div>
                );
              }
              lastGroup = group;
            }
            const active = pathname === href || (
              href !== '/dashboard' &&
              pathname.startsWith(href) &&
              !nav.some(n => n.href !== href && n.href.startsWith(href) && pathname.startsWith(n.href))
            );
            items.push(
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  active
                    ? 'bg-purple-50 text-purple-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span className="text-base">{icon}</span>
                {label}
              </Link>
            );
          });
          return items;
        })()}
      </nav>

      {/* User */}
      <div className="px-4 py-4 border-t border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-sm">
            {user?.full_name?.[0]?.toUpperCase() || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-slate-700 truncate">{user?.full_name || 'Admin'}</div>
            <div className="text-xs text-slate-400 truncate">{user?.email || ''}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
