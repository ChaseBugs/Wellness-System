'use client';

import { useState } from 'react';
import { useFetch } from '@/hooks/useFetch';
import { Story } from '@/types/api';
import PageHeader from '@/components/PageHeader';
import DataTable from '@/components/DataTable';
import Pagination from '@/components/Pagination';
import { usePagination } from '@/hooks/usePagination';

const STORY_CATEGORIES = [
  'Adventure', 'Animals', 'Bedtime', 'Fantasy',
  'Family', 'Nature', 'Nice', 'Smart', 'Famous', 'Tidy', 'Discipline',
];

const CATEGORY_COLORS: Record<string, string> = {
  Adventure:  'bg-orange-50 text-orange-700',
  Animals:    'bg-green-50 text-green-700',
  Bedtime:    'bg-indigo-50 text-indigo-700',
  Fantasy:    'bg-purple-50 text-purple-700',
  Family:     'bg-pink-50 text-pink-700',
  Nature:     'bg-teal-50 text-teal-700',
  Nice:       'bg-rose-50 text-rose-700',
  Smart:      'bg-blue-50 text-blue-700',
  Famous:     'bg-amber-50 text-amber-700',
  Tidy:       'bg-cyan-50 text-cyan-700',
  Discipline: 'bg-slate-100 text-slate-700',
};

export default function StoriesPage() {
  const { data: itemsRaw, loading } = useFetch<Story[]>('/stories');
  const items = itemsRaw ?? [];

  const [search, setSearch]     = useState('');
  const [category, setCategory] = useState('All');

  const filtered = items.filter((s) => {
    const matchCat = category === 'All' || s.category === category;
    const q = search.toLowerCase();
    const matchQ = !q || s.title?.toLowerCase().includes(q) || s.category?.toLowerCase().includes(q);
    return matchCat && matchQ;
  });

  const { paged, page, totalPages, setPage } = usePagination(filtered);

  const stats = STORY_CATEGORIES.map((cat) => ({
    cat,
    count: items.filter((s) => s.category === cat).length,
  })).filter((s) => s.count > 0);

  const columns = [
    { key: 'id',    label: 'ID' },
    { key: 'title', label: 'Title',
      render: (s: Story) => <span className="font-medium text-slate-800">{s.title}</span> },
    {
      key: 'category', label: 'Category',
      render: (s: Story) => (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
          CATEGORY_COLORS[s.category ?? ''] ?? 'bg-slate-100 text-slate-600'
        }`}>
          {s.category || '—'}
        </span>
      ),
    },
    { key: 'author', label: 'Author',
      render: (s: Story) => <span className="text-xs text-slate-600">{s.author || '—'}</span> },
    {
      key: 'age', label: 'Age Range',
      render: (s: Story) =>
        s.age_min_months != null ? `${s.age_min_months}–${s.age_max_months ?? '+'} mo` : '—',
    },
    {
      key: 'duration_minutes', label: 'Duration',
      render: (s: Story) => s.duration_minutes ? `${s.duration_minutes} min` : '—',
    },
    {
      key: 'audio_url', label: 'Audio',
      render: (s: Story) => s.audio_url ? (
        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">🎵 Available</span>
      ) : (
        <span className="text-slate-300 text-xs">—</span>
      ),
    },
    {
      key: 'is_featured', label: 'Featured',
      render: (s: Story) => s.is_featured ? (
        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700">⭐ Featured</span>
      ) : <span className="text-slate-300">—</span>,
    },
  ];

  return (
    <div className="p-8">
      <PageHeader title="Bedtime Stories" subtitle={`${items.length} stories across ${stats.length} categories`} />

      {/* Category chip filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        {stats.map(({ cat, count }) => (
          <button
            key={cat}
            onClick={() => { setCategory(cat === category ? 'All' : cat); setPage(1); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
              category === cat
                ? `${CATEGORY_COLORS[cat] ?? 'bg-slate-100 text-slate-600'} border-transparent shadow-sm`
                : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
            }`}
          >
            {cat} <span className="ml-1 opacity-60">{count}</span>
          </button>
        ))}
        {category !== 'All' && (
          <button
            onClick={() => setCategory('All')}
            className="px-3 py-1.5 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-600"
          >
            Clear ×
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
        <div className="p-5 border-b border-slate-100 flex items-center gap-3">
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by title or category…"
            className="w-full max-w-sm px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
          />
          <span className="ml-auto text-xs text-slate-400 whitespace-nowrap">
            {filtered.length} of {items.length} stories
          </span>
        </div>

        <DataTable columns={columns} data={paged} loading={loading} />
        <Pagination page={page} totalPages={totalPages} onPage={setPage} />
      </div>
    </div>
  );
}
