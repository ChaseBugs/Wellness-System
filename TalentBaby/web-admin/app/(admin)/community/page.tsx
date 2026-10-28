'use client';

import { useState } from 'react';
import { useFetch } from '@/hooks/useFetch';
import { CommunityPost } from '@/types/api';
import PageHeader from '@/components/PageHeader';
import DataTable from '@/components/DataTable';
import Pagination from '@/components/Pagination';
import { usePagination } from '@/hooks/usePagination';

const TYPE_COLOR: Record<string, string> = {
  discussion: 'bg-blue-50 text-blue-700',
  question:   'bg-purple-50 text-purple-700',
  experience: 'bg-green-50 text-green-700',
  advice:     'bg-orange-50 text-orange-700',
};

export default function CommunityPage() {
  const { data: postsRaw, loading } = useFetch<CommunityPost[]>('/community/posts');
  const posts = postsRaw ?? [];
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const filters = ['All', 'discussion', 'question', 'experience', 'advice'];

  const filtered = posts.filter((p) => {
    const matchFilter = filter === 'All' || p.post_type === filter;
    const matchSearch = p.title?.toLowerCase().includes(search.toLowerCase()) ||
                        p.content?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const { paged, page, totalPages, setPage } = usePagination(filtered);

  const columns = [
    { key: 'id', label: 'ID' },
    {
      key: 'title', label: 'Title',
      render: (p: CommunityPost) => (
        <div>
          <div className="font-medium text-slate-800 text-sm">{p.title}</div>
          <div className="text-xs text-slate-400 mt-0.5 line-clamp-1 max-w-xs">{p.content}</div>
        </div>
      ),
    },
    {
      key: 'post_type', label: 'Type',
      render: (p: CommunityPost) => (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${TYPE_COLOR[p.post_type] ?? 'bg-slate-50 text-slate-600'}`}>
          {p.post_type || '—'}
        </span>
      ),
    },
    {
      key: 'like_count', label: '❤️ Likes',
      render: (p: CommunityPost) => (p.like_count ?? 0).toLocaleString(),
    },
    {
      key: 'comment_count', label: '💬 Comments',
      render: (p: CommunityPost) => (p.comment_count ?? 0).toLocaleString(),
    },
    {
      key: 'is_pinned', label: 'Pinned',
      render: (p: CommunityPost) => p.is_pinned ? (
        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">📌 Pinned</span>
      ) : '—',
    },
    {
      key: 'created_at', label: 'Posted',
      render: (p: CommunityPost) => p.created_at ? new Date(p.created_at).toLocaleDateString() : '—',
    },
  ];

  return (
    <div className="p-8">
      <PageHeader
        title="Community"
        subtitle={`${posts.length} posts`}
      />

      {/* Stats strip */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Posts',     value: posts.length },
          { label: 'Questions',       value: posts.filter((p) => p.post_type === 'question').length },
          { label: 'Discussions',     value: posts.filter((p) => p.post_type === 'discussion').length },
          { label: 'Total Likes',     value: posts.reduce((s, p) => s + (p.like_count ?? 0), 0) },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
            <div className="text-xl font-bold text-slate-800">{s.value.toLocaleString()}</div>
            <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
        <div className="p-5 border-b border-slate-100 flex flex-wrap gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search posts…"
            className="px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 w-64"
          />
          <div className="flex gap-1.5">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${
                  filter === f ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <DataTable columns={columns} data={paged} loading={loading} />
        <Pagination page={page} totalPages={totalPages} onPage={setPage} />
        <div className="px-5 py-3 text-xs text-slate-400 border-t border-slate-50">
          {filtered.length} of {posts.length} posts
        </div>
      </div>
    </div>
  );
}
