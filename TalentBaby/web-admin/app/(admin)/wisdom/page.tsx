'use client';

import { useState, useCallback } from 'react';
import { useFetch } from '@/hooks/useFetch';
import { useMutation } from '@/hooks/useMutation';
import { Article } from '@/types/api';
import PageHeader from '@/components/PageHeader';
import Modal from '@/components/Modal';
import DataTable from '@/components/DataTable';
import Pagination from '@/components/Pagination';
import { usePagination } from '@/hooks/usePagination';

const CATEGORIES = ['All', 'Relationship', 'Nutrition & Food', 'Growth & Development', 'Health & Safety', 'Parenting'];

const CATEGORY_COLORS: Record<string, string> = {
  'Relationship':         'bg-pink-50 text-pink-700',
  'Nutrition & Food':     'bg-green-50 text-green-700',
  'Growth & Development': 'bg-blue-50 text-blue-700',
  'Health & Safety':      'bg-red-50 text-red-700',
  'Parenting':            'bg-purple-50 text-purple-700',
};

const EMPTY_FORM = {
  title: '',
  content: '',
  category: 'Parenting',
  author: '',
  image_url: '',
  reading_time_minutes: '',
  is_featured: false,
  doctor_name: '',
  doctor_credentials: '',
  doctor_verified: false,
  age_min_months: '0',
  age_max_months: '60',
};

type FormState = typeof EMPTY_FORM;

function ArticleModal({
  article,
  onClose,
  onSaved,
}: {
  article: Article | null; // null = create mode
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!article;
  const [form, setForm] = useState<FormState>(
    article
      ? {
          title: article.title ?? '',
          content: article.content ?? '',
          category: article.category ?? 'Parenting',
          author: article.author ?? '',
          image_url: article.image_url ?? '',
          reading_time_minutes: String(article.reading_time_minutes ?? ''),
          is_featured: article.is_featured ?? false,
          doctor_name: article.doctor_name ?? '',
          doctor_credentials: article.doctor_credentials ?? '',
          doctor_verified: article.doctor_verified ?? false,
          age_min_months: String(article.age_min_months ?? 0),
          age_max_months: String(article.age_max_months ?? 60),
        }
      : EMPTY_FORM,
  );

  const createMutation = useMutation<Article>('post', '/articles');
  const updateMutation = useMutation<Article>('put', `/articles/${article?.id}`);
  const saving = createMutation.loading || updateMutation.loading;
  const mutError = createMutation.error || updateMutation.error;

  function set(key: keyof FormState, value: string | boolean) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSave() {
    const payload = {
      title: form.title,
      content: form.content,
      category: form.category,
      author: form.author || undefined,
      image_url: form.image_url || undefined,
      reading_time_minutes: form.reading_time_minutes ? Number(form.reading_time_minutes) : undefined,
      is_featured: form.is_featured,
      doctor_name: form.doctor_name || undefined,
      doctor_credentials: form.doctor_credentials || undefined,
      doctor_verified: form.doctor_verified,
      age_min_months: Number(form.age_min_months),
      age_max_months: Number(form.age_max_months),
    };
    const result = isEdit
      ? await updateMutation.mutate(payload)
      : await createMutation.mutate(payload);
    if (result) { onSaved(); onClose(); }
  }

  return (
    <Modal onClose={onClose} maxWidth="max-w-4xl">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <h2 className="text-base font-semibold text-slate-800">
          {isEdit ? 'Edit Article' : 'New Wisdom Article'}
        </h2>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">&times;</button>
      </div>

        <div className="px-8 py-6 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Title *</label>
            <input
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
          </div>

          {/* Category */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Category *</label>
              <select
                value={form.category}
                onChange={(e) => set('category', e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
              >
                {CATEGORIES.slice(1).map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Author</label>
              <input
                value={form.author}
                onChange={(e) => set('author', e.target.value)}
                placeholder="BabyG Editorial Team"
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
              />
            </div>
          </div>

          {/* Doctor info */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Doctor Name</label>
              <input
                value={form.doctor_name}
                onChange={(e) => set('doctor_name', e.target.value)}
                placeholder="e.g. Kim Ji-yeon"
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Credentials</label>
              <input
                value={form.doctor_credentials}
                onChange={(e) => set('doctor_credentials', e.target.value)}
                placeholder="e.g. Pediatric Nutritionist"
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
              />
            </div>
            <div className="flex flex-col justify-end gap-3 pb-0.5">
              <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.doctor_verified}
                  onChange={(e) => set('doctor_verified', e.target.checked)}
                  className="w-4 h-4 accent-purple-600"
                />
                Doctor Verified
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_featured}
                  onChange={(e) => set('is_featured', e.target.checked)}
                  className="w-4 h-4 accent-amber-500"
                />
                Featured
              </label>
            </div>
          </div>

          {/* Age range + read time */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Age Min (months)</label>
              <input
                type="number" min={0}
                value={form.age_min_months}
                onChange={(e) => set('age_min_months', e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Age Max (months)</label>
              <input
                type="number" min={0}
                value={form.age_max_months}
                onChange={(e) => set('age_max_months', e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Read Time (min)</label>
              <input
                type="number" min={1}
                value={form.reading_time_minutes}
                onChange={(e) => set('reading_time_minutes', e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
              />
            </div>
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Image URL</label>
            <input
              value={form.image_url}
              onChange={(e) => set('image_url', e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Content *</label>
            <textarea
              rows={12}
              value={form.content}
              onChange={(e) => set('content', e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 resize-y"
            />
          </div>

          {mutError && (
            <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{mutError}</p>
          )}
        </div>

        <div className="flex justify-end gap-3 px-8 py-5 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-xl border border-slate-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !form.title || !form.content}
            className="px-5 py-2 text-sm bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50"
          >
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Article'}
          </button>
        </div>
    </Modal>
  );
}

export default function WisdomPage() {
  const { data: raw, loading, refetch } = useFetch<Article[]>('/articles');
  const all = (raw ?? [])
    .filter((a) => a.doctor_name)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const [search, setSearch]     = useState('');
  const [category, setCategory] = useState('All');
  const [modal, setModal]       = useState<{ open: boolean; article: Article | null }>({ open: false, article: null });
  const [deleteConfirm, setDeleteConfirm] = useState<Article | null>(null);

  const deleteMutation = useMutation('delete', deleteConfirm ? `/articles/${deleteConfirm.id}` : '/articles');

  const filtered = all.filter((a) => {
    const matchCat = category === 'All' || a.category === category;
    const q = search.toLowerCase();
    const matchQ = !q || a.title?.toLowerCase().includes(q) || a.doctor_name?.toLowerCase().includes(q);
    return matchCat && matchQ;
  });

  const { paged, page, totalPages, setPage } = usePagination(filtered);

  const handleDelete = useCallback(async () => {
    if (!deleteConfirm) return;
    await deleteMutation.mutate();
    setDeleteConfirm(null);
    refetch();
  }, [deleteConfirm, deleteMutation, refetch]);

  const columns = [
    { key: 'id', label: 'ID' },
    {
      key: 'title', label: 'Title',
      render: (a: Article) => (
        <span className="font-medium text-slate-800 leading-snug">{a.title}</span>
      ),
    },
    {
      key: 'category', label: 'Category',
      render: (a: Article) => (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${CATEGORY_COLORS[a.category ?? ''] ?? 'bg-slate-100 text-slate-600'}`}>
          {a.category ?? '—'}
        </span>
      ),
    },
    {
      key: 'doctor_name', label: 'Vetted By',
      render: (a: Article) =>
        a.doctor_name ? (
          <div className="text-xs">
            <div className="font-medium text-slate-700">Dr. {a.doctor_name}</div>
            <div className="text-slate-400">{a.doctor_credentials}</div>
          </div>
        ) : <span className="text-slate-300">—</span>,
    },
    {
      key: 'doctor_verified', label: 'Verified',
      render: (a: Article) => a.doctor_verified
        ? <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">Verified</span>
        : <span className="text-slate-300 text-xs">—</span>,
    },
    {
      key: 'age_min_months', label: 'Age Range',
      render: (a: Article) => (
        <span className="text-xs text-slate-600">
          {a.age_min_months ?? 0}–{a.age_max_months ?? 60} mo
        </span>
      ),
    },
    {
      key: 'reading_time_minutes', label: 'Read',
      render: (a: Article) => a.reading_time_minutes ? `${a.reading_time_minutes} min` : '—',
    },
    {
      key: 'view_count', label: 'Views',
      render: (a: Article) => (a.view_count ?? 0).toLocaleString(),
    },
    {
      key: 'is_featured', label: 'Featured',
      render: (a: Article) => a.is_featured
        ? <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700">Featured</span>
        : <span className="text-slate-300">—</span>,
    },
    {
      key: 'actions', label: '',
      render: (a: Article) => (
        <button
          onClick={(e) => { e.stopPropagation(); setDeleteConfirm(a); }}
          className="px-2 py-1 text-xs text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          Delete
        </button>
      ),
    },
  ];

  const stats = CATEGORIES.slice(1).map((cat) => ({
    cat,
    count: all.filter((a) => a.category === cat).length,
  }));

  return (
    <div className="p-8">
      <PageHeader
        title="Wisdom & Insights"
        subtitle={`${all.length} doctor-vetted articles across 5 categories`}
        action={
          <button
            onClick={() => setModal({ open: true, article: null })}
            className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-xl hover:bg-purple-700 transition-colors"
          >
            + New Article
          </button>
        }
      />

      {/* Category stat chips */}
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
          <button onClick={() => setCategory('All')} className="px-3 py-1.5 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-600">
            Clear ×
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
        <div className="p-5 border-b border-slate-100 flex items-center gap-3">
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by title or doctor name…"
            className="w-full max-w-sm px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
          />
          <span className="text-xs text-slate-400 ml-auto whitespace-nowrap">
            {filtered.length} of {all.length}
          </span>
        </div>

        <DataTable
          columns={columns}
          data={paged}
          loading={loading}
          onRowClick={(a: Article) => setModal({ open: true, article: a })}
        />
        <Pagination page={page} totalPages={totalPages} onPage={setPage} />
      </div>

      {/* Edit / Create modal */}
      {modal.open && (
        <ArticleModal
          article={modal.article}
          onClose={() => setModal({ open: false, article: null })}
          onSaved={refetch}
        />
      )}

      {/* Delete confirmation */}
      {deleteConfirm && (
        <Modal onClose={() => setDeleteConfirm(null)} maxWidth="max-w-sm">
          <div className="p-6">
            <h3 className="text-sm font-semibold text-slate-800 mb-2">Delete Article?</h3>
            <p className="text-xs text-slate-500 mb-5">
              &ldquo;{deleteConfirm.title}&rdquo; will be permanently removed.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-xl border border-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteMutation.loading}
                className="px-4 py-2 text-sm bg-red-500 text-white rounded-xl hover:bg-red-600 disabled:opacity-50"
              >
                {deleteMutation.loading ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
