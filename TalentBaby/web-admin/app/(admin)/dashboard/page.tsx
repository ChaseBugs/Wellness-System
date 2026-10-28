'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, LabelList,
} from 'recharts';

interface StatCard { label: string; value: number | string; icon: string; color: string }

const CATEGORY_COLORS: Record<string, string> = {
  physical:      '#3b82f6',
  cognitive:     '#a855f7',
  communication: '#14b8a6',
  social:        '#f43f5e',
};

const SUB_CATEGORIES: Record<string, string[]> = {
  physical:      ['Gross Motor', 'Fine Motor', 'Bilateral Coordination', 'Finger Dexterity', 'Hand-Eye-Spatial'],
  cognitive:     ['Memory and Attention', 'Concept Learning', 'Articulation & Reasoning', 'Thinking Expansion', 'Early Knowledge', 'Imagination'],
  communication: ['Language Comprehension', 'Speech Development', 'Thought Expression'],
  social:        ['Social Skills & Awareness', 'Self Esteem'],
};

// All sub-categories in order with their parent category color
const ALL_SUB_CATS = Object.entries(SUB_CATEGORIES).flatMap(([cat, subs]) =>
  subs.map((sub) => ({ sub, cat }))
);

interface Activity {
  id: number;
  category: string;
  sub_category?: string | null;
}

export default function DashboardPage() {
  const [stats, setStats] = useState({ users: 0, babies: 0, activities: 0, articles: 0 });
  const [catData,    setCatData]    = useState<{ category: string; count: number }[]>([]);
  const [subCatData, setSubCatData] = useState<{ sub: string; cat: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [babiesRes, activitiesRes, articlesRes] = await Promise.allSettled([
          api.get('/babies'),
          api.get('/activities'),   // no month filter → all activities
          api.get('/articles'),
        ]);

        // ── stat cards ──────────────────────────────────────────────────────
        const babies     = babiesRes.status     === 'fulfilled' ? (babiesRes.value.data.data?.length     ?? 0) : 0;
        const activities: Activity[] = activitiesRes.status === 'fulfilled'
          ? (activitiesRes.value.data.data ?? []) : [];
        const articles   = articlesRes.status   === 'fulfilled' ? (articlesRes.value.data.data?.length   ?? 0) : 0;

        setStats({ users: 0, babies, activities: activities.length, articles });

        // ── by category ─────────────────────────────────────────────────────
        const catMap: Record<string, number> = {};
        for (const a of activities) {
          if (a.category) catMap[a.category] = (catMap[a.category] ?? 0) + 1;
        }
        setCatData(
          Object.entries(catMap)
            .map(([category, count]) => ({ category: category.charAt(0).toUpperCase() + category.slice(1), count }))
            .sort((a, b) => b.count - a.count)
        );

        // ── by sub-category (ordered by ALL_SUB_CATS definition) ────────────
        const subMap: Record<string, number> = {};
        for (const a of activities) {
          if (a.sub_category) subMap[a.sub_category] = (subMap[a.sub_category] ?? 0) + 1;
        }
        setSubCatData(
          ALL_SUB_CATS
            .map(({ sub, cat }) => ({ sub, cat, count: subMap[sub] ?? 0 }))
            .filter((d) => d.count > 0)
        );
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const statCards: StatCard[] = [
    { label: 'Total Users',   value: stats.users,      icon: '👥', color: 'bg-blue-50 text-blue-700' },
    { label: 'Baby Profiles', value: stats.babies,     icon: '👶', color: 'bg-pink-50 text-pink-700' },
    { label: 'Activities',    value: stats.activities, icon: '🎯', color: 'bg-purple-50 text-purple-700' },
    { label: 'Articles',      value: stats.articles,   icon: '📰', color: 'bg-green-50 text-green-700' },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Welcome back! Here&apos;s what&apos;s happening.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {statCards.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl mb-4 ${s.color}`}>
              {s.icon}
            </div>
            <div className="text-2xl font-bold text-slate-800">
              {loading ? '—' : s.value.toLocaleString()}
            </div>
            <div className="text-sm text-slate-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">

        {/* ── Activities by Category ── */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h2 className="font-semibold text-slate-700 mb-1">Activities by Category</h2>
          <p className="text-xs text-slate-400 mb-5">Total across all age months</p>
          {loading ? (
            <div className="h-[360px] flex items-center justify-center text-slate-300 text-sm">Loading…</div>
          ) : catData.length === 0 ? (
            <div className="h-[360px] flex items-center justify-center text-slate-300 text-sm">No data</div>
          ) : (
            <ResponsiveContainer width="100%" height={360}>
              <BarChart data={catData} barSize={36}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="category" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} allowDecimals={false} />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} name="Activities">
                  {catData.map((d) => (
                    <Cell key={d.category} fill={CATEGORY_COLORS[d.category.toLowerCase()] ?? '#a855f7'} />
                  ))}
                  <LabelList dataKey="count" position="top" style={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}

          {/* legend */}
          <div className="flex flex-wrap gap-3 mt-4">
            {Object.entries(CATEGORY_COLORS).map(([cat, color]) => (
              <div key={cat} className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color }} />
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </div>
            ))}
          </div>
        </div>

        {/* ── Activities by Sub-Category ── */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h2 className="font-semibold text-slate-700 mb-1">Activities by Sub-Category</h2>
          <p className="text-xs text-slate-400 mb-5">Breakdown across all activity types</p>
          {loading ? (
            <div className="h-[260px] flex items-center justify-center text-slate-300 text-sm">Loading…</div>
          ) : subCatData.length === 0 ? (
            <div className="h-[260px] flex items-center justify-center text-slate-300 text-sm">No data</div>
          ) : (
            <ResponsiveContainer width="100%" height={Math.max(260, subCatData.length * 28)}>
              <BarChart
                data={subCatData}
                layout="vertical"
                barSize={14}
                margin={{ left: 8, right: 40, top: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  allowDecimals={false}
                />
                <YAxis
                  type="category"
                  dataKey="sub"
                  width={160}
                  tick={{ fontSize: 11, fill: '#475569' }}
                />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }}
                  formatter={(val) => [val, 'Activities']}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} name="Activities">
                  {subCatData.map((d, i) => (
                    <Cell key={i} fill={CATEGORY_COLORS[d.cat] ?? '#a855f7'} />
                  ))}
                  <LabelList dataKey="count" position="right" style={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h2 className="font-semibold text-slate-700 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { href: '/activities', label: 'View Activities', icon: '🎯' },
            { href: '/articles',   label: 'View Articles',   icon: '📰' },
            { href: '/recipes',    label: 'View Recipes',    icon: '🥗' },
            { href: '/stories',    label: 'View Stories',    icon: '📚' },
          ].map((q) => (
            <a
              key={q.href}
              href={q.href}
              className="flex items-center gap-3 p-4 rounded-xl border border-slate-100 hover:border-purple-200 hover:bg-purple-50 transition-colors group"
            >
              <span className="text-xl">{q.icon}</span>
              <span className="text-sm font-medium text-slate-600 group-hover:text-purple-700">{q.label}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
