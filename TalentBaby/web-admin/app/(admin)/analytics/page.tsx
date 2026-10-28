'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import PageHeader from '@/components/PageHeader';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const COLORS = ['#a855f7', '#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const feedingTypeData = [
  { name: 'Breastfeeding', value: 42 },
  { name: 'Formula',       value: 28 },
  { name: 'Solid',         value: 18 },
  { name: 'Mixed',         value: 8  },
  { name: 'Pump',          value: 4  },
];

const sleepData = [
  { day: 'Mon', hours: 14 }, { day: 'Tue', hours: 13.5 },
  { day: 'Wed', hours: 15 }, { day: 'Thu', hours: 12   },
  { day: 'Fri', hours: 14 }, { day: 'Sat', hours: 13   },
  { day: 'Sun', hours: 15.5 },
];

const talentData = [
  { talent: 'Creativity',   score: 72 },
  { talent: 'Music',        score: 65 },
  { talent: 'Logic',        score: 80 },
  { talent: 'Language',     score: 68 },
  { talent: 'Physical',     score: 75 },
  { talent: 'Social',       score: 60 },
  { talent: 'Curiosity',    score: 85 },
];

export default function AnalyticsPage() {
  const [babies, setBabies]       = useState<{ id: number; name: string }[]>([]);
  const [selectedBaby, setSelectedBaby] = useState<number | null>(null);
  const [growthReport, setGrowthReport] = useState<{ weight_records?: unknown[]; height_records?: unknown[] } | null>(null);
  const [loadingReport, setLoadingReport] = useState(false);

  useEffect(() => {
    api.get('/babies')
      .then((res) => {
        const list = res.data.data || [];
        setBabies(list);
        if (list.length > 0) setSelectedBaby(list[0].id);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedBaby) return;
    setLoadingReport(true);
    api.get(`/reports/baby/${selectedBaby}/growth`)
      .then((res) => setGrowthReport(res.data.data || null))
      .catch(() => setGrowthReport(null))
      .finally(() => setLoadingReport(false));
  }, [selectedBaby]);

  return (
    <div className="p-8">
      <PageHeader title="Analytics & Reports" subtitle="Insights across all data" />

      {/* Baby selector */}
      {babies.length > 0 && (
        <div className="mb-6 flex items-center gap-3">
          <span className="text-sm text-slate-600 font-medium">Baby profile:</span>
          <select
            value={selectedBaby ?? ''}
            onChange={(e) => setSelectedBaby(Number(e.target.value))}
            className="px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
          >
            {babies.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
          {loadingReport && <span className="text-xs text-slate-400">Loading report…</span>}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
        {/* Sleep Patterns */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h2 className="font-semibold text-slate-700 mb-5">Sleep Hours (This Week)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={sleepData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <YAxis domain={[10, 17]} tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <Tooltip formatter={(v) => [`${v}h`, 'Sleep']} />
              <Line type="monotone" dataKey="hours" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Feeding Distribution */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h2 className="font-semibold text-slate-700 mb-5">Feeding Type Distribution</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={feedingTypeData}
                cx="50%" cy="50%"
                innerRadius={55} outerRadius={90}
                dataKey="value" nameKey="name"
                paddingAngle={3}
                label={({ name, percent }: { name?: string; percent?: number }) => `${name ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {feedingTypeData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => [`${v}%`, '']} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Talent Scores */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h2 className="font-semibold text-slate-700 mb-5">Talent Assessment Scores</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={talentData} barSize={24}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="talent" tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <Tooltip formatter={(v) => [`${v}/100`, 'Score']} />
              <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                {talentData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Growth Report */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h2 className="font-semibold text-slate-700 mb-5">Growth Report</h2>
          {!selectedBaby ? (
            <div className="flex items-center justify-center h-40 text-slate-400 text-sm">
              Select a baby profile to view growth report
            </div>
          ) : loadingReport ? (
            <div className="flex items-center justify-center h-40 text-slate-400 text-sm">
              Loading…
            </div>
          ) : growthReport ? (
            <div className="space-y-3">
              {[
                { label: 'Weight Records', value: (growthReport.weight_records as unknown[])?.length ?? 0 },
                { label: 'Height Records', value: (growthReport.height_records as unknown[])?.length ?? 0 },
              ].map((r) => (
                <div key={r.label} className="flex items-center justify-between py-2 border-b border-slate-50">
                  <span className="text-sm text-slate-600">{r.label}</span>
                  <span className="text-sm font-semibold text-slate-800">{r.value}</span>
                </div>
              ))}
              <div className="pt-2 text-xs text-slate-400">
                Full growth details available in the Growth Tracking section of the mobile app.
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-40 text-slate-400 text-sm">
              No growth records found for this baby
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
