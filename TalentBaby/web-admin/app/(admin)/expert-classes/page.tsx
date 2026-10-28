'use client';

import { useState } from 'react';
import { useFetch } from '@/hooks/useFetch';
import { ExpertClass } from '@/types/api';
import PageHeader from '@/components/PageHeader';
import DataTable from '@/components/DataTable';
import Pagination from '@/components/Pagination';
import { usePagination } from '@/hooks/usePagination';

const TYPE_COLOR: Record<string, string> = {
  live:      'bg-red-50 text-red-700',
  on_demand: 'bg-blue-50 text-blue-700',
};

export default function ExpertClassesPage() {
  const { data: itemsRaw, loading } = useFetch<ExpertClass[]>('/expert-classes');
  const items = itemsRaw ?? [];
  const [search, setSearch] = useState('');
  const [type, setType]     = useState('All');

  const filtered = items.filter((c) => {
    const matchType   = type === 'All' || c.class_type === type;
    const matchSearch = c.title?.toLowerCase().includes(search.toLowerCase()) ||
                        c.instructor_name?.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  const { paged, page, totalPages, setPage } = usePagination(filtered);

  const columns = [
    { key: 'id',    label: 'ID' },
    { key: 'title', label: 'Title' },
    { key: 'instructor_name', label: 'Instructor' },
    {
      key: 'class_type', label: 'Type',
      render: (c: ExpertClass) => (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${TYPE_COLOR[c.class_type] ?? 'bg-slate-50 text-slate-600'}`}>
          {c.class_type?.replace('_', ' ') || '—'}
        </span>
      ),
    },
    { key: 'category', label: 'Category' },
    {
      key: 'duration_minutes', label: 'Duration',
      render: (c: ExpertClass) => c.duration_minutes ? `${c.duration_minutes} min` : '—',
    },
    {
      key: 'scheduled_time', label: 'Scheduled',
      render: (c: ExpertClass) =>
        c.scheduled_time ? new Date(c.scheduled_time).toLocaleString() : '—',
    },
    {
      key: 'is_premium', label: 'Premium',
      render: (c: ExpertClass) => c.is_premium ? (
        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700">💎 Premium</span>
      ) : (
        <span className="text-slate-400 text-xs">Free</span>
      ),
    },
  ];

  return (
    <div className="p-8">
      <PageHeader title="Expert Classes" subtitle={`${items.length} classes`} />

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
        <div className="p-5 border-b border-slate-100 flex flex-wrap gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title or instructor…"
            className="px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 w-64"
          />
          {['All', 'live', 'on_demand'].map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${
                type === t ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t.replace('_', ' ')}
            </button>
          ))}
        </div>
        <DataTable columns={columns} data={paged} loading={loading} />
        <Pagination page={page} totalPages={totalPages} onPage={setPage} />
        <div className="px-5 py-3 text-xs text-slate-400 border-t border-slate-50">
          {filtered.length} of {items.length} classes
        </div>
      </div>
    </div>
  );
}
