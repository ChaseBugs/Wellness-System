'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import PageHeader from '@/components/PageHeader';
import Pagination from '@/components/Pagination';
import { usePagination } from '@/hooks/usePagination';

interface Leader {
  id: number;
  full_name: string;
  email: string;
  role: string;
  total_points: number;
  doctor_grade?: string;
  doctor_specialty?: string;
  profile_picture_url?: string;
}

const RANK_COLORS = ['🥇', '🥈', '🥉'];

export default function PointsPage() {
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/user-points/leaderboard')
      .then(r => setLeaders(r.data.data ?? []))
      .catch(() => setLeaders([]))
      .finally(() => setLoading(false));
  }, []);

  const totalPoints = leaders.reduce((s, l) => s + Number(l.total_points), 0);
  const doctors = leaders.filter(l => l.role === 'doctor');
  const topUser = leaders[0];
  const { paged, page, totalPages, setPage } = usePagination(leaders);

  return (
    <div className="p-8">
      <PageHeader title="Points & Rankings" subtitle="User activity points leaderboard" />

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <div className="text-2xl font-bold text-purple-600">{totalPoints.toLocaleString()}</div>
          <div className="text-sm text-slate-500 mt-1">Total accumulated points</div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <div className="text-2xl font-bold text-amber-500">{doctors.length}</div>
          <div className="text-sm text-slate-500 mt-1">Active doctor users</div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <div className="text-2xl font-bold text-slate-800">{topUser ? Number(topUser.total_points).toLocaleString() : '—'}</div>
          <div className="text-sm text-slate-500 mt-1">#1 user points</div>
        </div>
      </div>

      {/* Point rules reference */}
      <div className="bg-purple-50 rounded-2xl p-5 mb-6 border border-purple-100">
        <h3 className="font-semibold text-purple-800 mb-3 text-sm">Point earning rules</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { action: 'Submit article', pts: '+10' },
            { action: 'Article liked', pts: '+2' },
            { action: 'Post comment', pts: '+3' },
            { action: 'Doctor comment', pts: '+5' },
            { action: 'Comment liked', pts: '+1' },
          ].map(r => (
            <div key={r.action} className="bg-white rounded-xl px-4 py-3 flex items-center justify-between">
              <span className="text-xs text-slate-600">{r.action}</span>
              <span className="text-sm font-bold text-purple-600">{r.pts}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Leaderboard */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
        <div className="p-5 border-b border-slate-100">
          <h2 className="font-semibold text-slate-700">Leaderboard Top 20</h2>
        </div>
        {loading ? (
          <div className="flex items-center justify-center h-40 text-slate-400 text-sm">Loading…</div>
        ) : (
          <div className="divide-y divide-slate-50">
            {paged.map((l, i) => {
              const globalIndex = (page - 1) * 10 + i;
              return (
              <div key={l.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition-colors">
                <div className="w-8 text-center text-lg">
                  {globalIndex < 3 ? RANK_COLORS[globalIndex] : <span className="text-sm text-slate-400 font-bold">{globalIndex + 1}</span>}
                </div>
                <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-sm flex-shrink-0">
                  {l.full_name?.[0]?.toUpperCase() ?? 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800 text-sm truncate">{l.full_name}</span>
                    {l.role === 'doctor' && (
                      <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium">
                        🩺 {l.doctor_grade}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 truncate">{l.email}</div>
                  {l.doctor_specialty && (
                    <div className="text-xs text-slate-400">{l.doctor_specialty}</div>
                  )}
                </div>
                <div className="text-right">
                  <div className="font-bold text-purple-600 text-sm">{Number(l.total_points).toLocaleString()}</div>
                  <div className="text-xs text-slate-400">pts</div>
                </div>
              </div>
            );
            })}
            {!leaders.length && (
              <div className="flex items-center justify-center h-32 text-slate-400 text-sm">No point data available.</div>
            )}
          </div>
        )}
        <Pagination page={page} totalPages={totalPages} onPage={setPage} />
      </div>
    </div>
  );
}
