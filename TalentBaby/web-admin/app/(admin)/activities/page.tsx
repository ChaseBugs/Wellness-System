'use client';

import { useState, useCallback } from 'react';
import { useFetch } from '@/hooks/useFetch';
import { api } from '@/lib/api';
import { Activity } from '@/types/api';
import PageHeader from '@/components/PageHeader';
import Modal from '@/components/Modal';
import Pagination from '@/components/Pagination';
import { usePagination } from '@/hooks/usePagination';

// ─── Constants ────────────────────────────────────────────────────────────────

const API_BASE = 'http://localhost:5000';

const CATEGORIES = ['all', 'physical', 'cognitive', 'communication', 'social'] as const;
type Category = typeof CATEGORIES[number];

const CATEGORY_LABELS: Record<Category, string> = {
  all:           'All',
  physical:      'Physical',
  cognitive:     'Cognitive',
  communication: 'Communication',
  social:        'Social & Emotional',
};

const CATEGORY_COLORS: Record<string, string> = {
  physical:      'bg-blue-50 text-blue-700',
  cognitive:     'bg-purple-50 text-purple-700',
  communication: 'bg-teal-50 text-teal-700',
  social:        'bg-rose-50 text-rose-700',
};

const SUB_CATEGORIES: Record<string, string[]> = {
  physical:      ['Gross Motor', 'Fine Motor', 'Bilateral Coordination', 'Finger Dexterity', 'Hand-Eye-Spatial'],
  cognitive:     ['Memory and Attention', 'Concept Learning', 'Articulation & Reasoning', 'Thinking Expansion', 'Early Knowledge', 'Imagination'],
  communication: ['Language Comprehension', 'Speech Development', 'Thought Expression'],
  social:        ['Social Skills & Awareness', 'Self Esteem'],
};

const DIFFICULTY_COLOR: Record<string, string> = {
  easy:   'bg-green-50 text-green-700',
  medium: 'bg-yellow-50 text-yellow-700',
  hard:   'bg-red-50 text-red-700',
};

const YEAR_GROUPS = [
  { label: 'Year 1', months: Array.from({ length: 12 }, (_, i) => i + 1) },
  { label: 'Year 2', months: Array.from({ length: 12 }, (_, i) => i + 13) },
  { label: 'Year 3', months: Array.from({ length: 12 }, (_, i) => i + 25) },
];

function imgSrc(url?: string | null) {
  if (!url) return null;
  return url.startsWith('http') ? url : `${API_BASE}${url}`;
}

// ─── Activity Form Modal ──────────────────────────────────────────────────────

interface ActivityFormData {
  title: string;
  description: string;
  category: string;
  sub_category: string;
  month_min: string;
  month_max: string;
  duration_minutes: string;
  frequency: string;
  benefits: string;
  materials_needed: string;
  instructions: string;
  image_url: string;
  is_premium: boolean;
  doctor_verified: boolean;
}

function ActivityModal({
  initial,
  onClose,
  onSaved,
}: {
  initial?: Activity;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<ActivityFormData>({
    title:            initial?.title ?? '',
    description:      initial?.description ?? '',
    category:         initial?.category ?? 'physical',
    sub_category:     initial?.sub_category ?? '',
    month_min:        String(initial?.month_min ?? 1),
    month_max:        String(initial?.month_max ?? 3),
    duration_minutes: String(initial?.duration_minutes ?? ''),
    frequency:        initial?.frequency ?? '',
    benefits:         Array.isArray(initial?.benefits) ? initial.benefits.join('\n') : '',
    materials_needed: Array.isArray(initial?.materials_needed) ? initial.materials_needed.join('\n') : '',
    instructions:     initial?.instructions ?? '',
    image_url:        initial?.image_url ?? '',
    is_premium:       initial?.is_premium ?? false,
    doctor_verified:  initial?.doctor_verified ?? false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');
  const [imgError, setImgError] = useState(false);

  const set = (k: keyof ActivityFormData, v: string | boolean) =>
    setForm((p) => ({ ...p, [k]: v }));

  const subCats = SUB_CATEGORIES[form.category] ?? [];
  const previewSrc = imgSrc(form.image_url);

  async function submit(e: React.SyntheticEvent) {
    e.preventDefault();
    if (!form.title.trim()) { setError('Title is required.'); return; }
    setSaving(true);
    setError('');
    try {
      const payload = {
        title:            form.title.trim(),
        description:      form.description || null,
        category:         form.category,
        sub_category:     form.sub_category || null,
        month_min:        Number(form.month_min) || 1,
        month_max:        Number(form.month_max) || 36,
        duration_minutes: form.duration_minutes ? Number(form.duration_minutes) : null,
        frequency:        form.frequency || null,
        benefits:         form.benefits.split('\n').map((s) => s.trim()).filter(Boolean),
        materials_needed: form.materials_needed.split('\n').map((s) => s.trim()).filter(Boolean),
        instructions:     form.instructions || null,
        image_url:        form.image_url || null,
        is_premium:       form.is_premium,
        doctor_verified:  form.doctor_verified,
        language:         'en',
      };
      if (initial?.id) {
        await api.put(`/activities/${initial.id}`, payload);
      } else {
        await api.post('/activities', payload);
      }
      onSaved();
      onClose();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: { message?: string } | string } }; message?: string };
      setError(
        (typeof e?.response?.data?.error === 'object'
          ? e?.response?.data?.error?.message
          : e?.response?.data?.error as string)
        ?? e?.message
        ?? 'Failed to save.'
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal onClose={onClose}>
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
        <h2 className="text-base font-semibold text-slate-800">
          {initial ? 'Edit Activity' : 'Add Activity'}
        </h2>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">&times;</button>
      </div>

        <form onSubmit={submit} className="p-6 space-y-4">
          {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

          {/* ── Image preview + url ── */}
          <div className="flex gap-4 items-start">
            <div className="w-24 h-24 rounded-xl border border-slate-200 overflow-hidden bg-slate-50 flex items-center justify-center shrink-0">
              {previewSrc && !imgError ? (
                <img
                  src={previewSrc}
                  alt=""
                  className="w-full h-full object-cover"
                  onError={() => setImgError(true)}
                />
              ) : (
                <span className="text-2xl text-slate-300">🖼</span>
              )}
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-slate-600 mb-1">Image URL</label>
              <input
                value={form.image_url}
                onChange={(e) => { set('image_url', e.target.value); setImgError(false); }}
                placeholder="/images/activities/Activity_Name.png"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
              />
              <p className="text-xs text-slate-400 mt-1">
                Relative path (e.g. <code>/images/activities/Name.png</code>) or full URL
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Title *</label>
            <input
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="Activity name…"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 resize-none"
            />
          </div>

          {/* ── Category + Sub-category (activity type) ── */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Category *</label>
              <select
                value={form.category}
                onChange={(e) => {
                  const cat = e.target.value;
                  setForm((p) => ({ ...p, category: cat, sub_category: '' }));
                }}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
              >
                {CATEGORIES.filter((c) => c !== 'all').map((c) => (
                  <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Activity Type (Sub-category)</label>
              <select
                value={form.sub_category}
                onChange={(e) => set('sub_category', e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
              >
                <option value="">— Select type —</option>
                {subCats.map((sc) => (
                  <option key={sc} value={sc}>{sc}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Month Min</label>
              <input
                type="number" min={1} max={36}
                value={form.month_min}
                onChange={(e) => set('month_min', e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Month Max</label>
              <input
                type="number" min={1} max={36}
                value={form.month_max}
                onChange={(e) => set('month_max', e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Duration (min)</label>
              <input
                type="number" min={1}
                value={form.duration_minutes}
                onChange={(e) => set('duration_minutes', e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Frequency</label>
            <input
              value={form.frequency}
              onChange={(e) => set('frequency', e.target.value)}
              placeholder="e.g. Daily, 3 times per week…"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Benefits (one per line)</label>
            <textarea
              value={form.benefits}
              onChange={(e) => set('benefits', e.target.value)}
              rows={3}
              placeholder={"Strengthens grip\nDevelops hand awareness"}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-300 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Materials Needed (one per line)</label>
            <textarea
              value={form.materials_needed}
              onChange={(e) => set('materials_needed', e.target.value)}
              rows={2}
              placeholder={"Play mat\nColorful toy"}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-300 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Instructions</label>
            <textarea
              value={form.instructions}
              onChange={(e) => set('instructions', e.target.value)}
              rows={4}
              placeholder="Step-by-step instructions…"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 resize-none"
            />
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <input
                id="is_premium"
                type="checkbox"
                checked={form.is_premium}
                onChange={(e) => set('is_premium', e.target.checked)}
                className="w-4 h-4 text-purple-600 border-slate-300 rounded"
              />
              <label htmlFor="is_premium" className="text-sm text-slate-700">Premium only</label>
            </div>
            <div className="flex items-center gap-2">
              <input
                id="doctor_verified"
                type="checkbox"
                checked={form.doctor_verified}
                onChange={(e) => set('doctor_verified', e.target.checked)}
                className="w-4 h-4 text-emerald-600 border-slate-300 rounded"
              />
              <label htmlFor="doctor_verified" className="text-sm text-slate-700">
                Doctor Verified
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 text-sm font-medium text-white bg-purple-600 rounded-xl hover:bg-purple-700 disabled:opacity-50 transition-colors"
            >
              {saving ? 'Saving…' : initial ? 'Save Changes' : 'Add Activity'}
            </button>
          </div>
        </form>
    </Modal>
  );
}

// ─── Activity Card ────────────────────────────────────────────────────────────

function ActivityCard({
  activity,
  onEdit,
  onDelete,
  deleting,
}: {
  activity: Activity;
  onEdit: (a: Activity) => void;
  onDelete: (a: Activity) => void;
  deleting: boolean;
}) {
  const [imgErr, setImgErr] = useState(false);
  const src = imgSrc(activity.image_url);

  return (
    <div
      className="px-4 py-3 flex items-center gap-3 hover:bg-slate-50 transition-colors group cursor-pointer"
      onClick={() => onEdit(activity)}
    >
      {/* Thumbnail */}
      <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 shrink-0 flex items-center justify-center">
        {src && !imgErr ? (
          <img
            src={src}
            alt=""
            className="w-full h-full object-cover"
            onError={() => setImgErr(true)}
          />
        ) : (
          <span className="text-xl text-slate-300">🎯</span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-slate-800">{activity.title}</span>
          {activity.is_premium && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-600">
              Premium
            </span>
          )}
          {activity.doctor_verified ? (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700">
              ✓ Verified
            </span>
          ) : (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-400">
              Unverified
            </span>
          )}
          {activity.difficulty_level && (
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium capitalize ${DIFFICULTY_COLOR[activity.difficulty_level] ?? 'bg-slate-50 text-slate-500'}`}>
              {activity.difficulty_level}
            </span>
          )}
          {activity.duration_minutes && (
            <span className="text-[10px] text-slate-400">{activity.duration_minutes} min</span>
          )}
          {(activity.done_count ?? 0) > 0 && (
            <span className="text-[10px] text-slate-400">{activity.done_count?.toLocaleString()} done</span>
          )}
        </div>

        {/* Activity type row */}
        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
          {activity.category && (
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium capitalize ${CATEGORY_COLORS[activity.category] ?? 'bg-slate-50 text-slate-500'}`}>
              {activity.category}
            </span>
          )}
          {activity.sub_category && (
            <span className="text-[10px] text-slate-500">{activity.sub_category}</span>
          )}
        </div>

        {activity.description && (
          <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{activity.description}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(activity); }}
          className="px-2.5 py-1 text-xs text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
        >
          Edit
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(activity); }}
          disabled={deleting}
          className="px-2.5 py-1 text-xs text-red-600 bg-red-50 rounded-lg hover:bg-red-100 disabled:opacity-50 transition-colors"
        >
          {deleting ? '…' : 'Delete'}
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ActivitiesPage() {
  const [month,    setMonth]    = useState<number>(1);
  const [cat,      setCat]      = useState<Category>('all');
  const [subCat,   setSubCat]   = useState<string>('');
  const [search,   setSearch]   = useState('');
  const [modal,    setModal]    = useState<{ open: boolean; activity?: Activity }>({ open: false });
  const [deleting, setDeleting] = useState<number | null>(null);

  const params = new URLSearchParams();
  params.set('month', String(month));
  if (cat !== 'all') params.set('category', cat);
  if (subCat)        params.set('sub_category', subCat);
  if (search)        params.set('search', search);

  const { data: activitiesRaw, loading, refetch } = useFetch<Activity[]>(
    `/activities?${params.toString()}`
  );
  const activities: Activity[] = activitiesRaw ?? [];
  const { paged, page, totalPages, setPage } = usePagination(activities);

  const handleCatChange = useCallback((newCat: Category) => {
    setCat(newCat);
    setSubCat('');
  }, []);

  async function handleDelete(a: Activity) {
    if (!confirm(`Delete "${a.title}"?`)) return;
    setDeleting(a.id);
    try {
      await api.delete(`/activities/${a.id}`);
      refetch();
    } finally {
      setDeleting(null);
    }
  }

  const subCatOptions = cat !== 'all' ? (SUB_CATEGORIES[cat] ?? []) : [];

  return (
    <div className="p-8">
      <PageHeader
        title="Activities"
        subtitle={`${activities.length} activities for month ${month}`}
        action={
          <button
            onClick={() => setModal({ open: true })}
            className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-xl hover:bg-purple-700 transition-colors"
          >
            + Add Activity
          </button>
        }
      />

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100">

        {/* ── Month selector ── */}
        <div className="px-5 pt-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-medium text-slate-500 shrink-0">Month:</span>
            {YEAR_GROUPS.map((yg) => (
              <div key={yg.label} className="flex items-center gap-1 flex-wrap">
                <span className="text-[10px] text-slate-400 font-medium mr-1">{yg.label}</span>
                {yg.months.map((m) => (
                  <button
                    key={m}
                    onClick={() => setMonth(m)}
                    className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors ${
                      month === m
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* ── Category tabs ── */}
        <div className="px-5 pt-3 pb-0 border-b border-slate-100 flex gap-1 flex-wrap">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => handleCatChange(c)}
              className={`px-4 py-2.5 rounded-t-lg text-sm font-medium transition-colors border-b-2 -mb-px ${
                cat === c
                  ? 'text-purple-700 border-purple-600 bg-purple-50/50'
                  : 'text-slate-500 border-transparent hover:text-slate-700'
              }`}
            >
              {CATEGORY_LABELS[c]}
            </button>
          ))}
        </div>

        {/* ── Sub-category + search ── */}
        <div className="px-5 py-3 border-b border-slate-100 flex flex-wrap gap-3 items-center">
          {subCatOptions.length > 0 && (
            <select
              value={subCat}
              onChange={(e) => setSubCat(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
            >
              <option value="">All types</option>
              {subCatOptions.map((sc) => (
                <option key={sc} value={sc}>{sc}</option>
              ))}
            </select>
          )}
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search activities…"
            className="px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 w-52"
          />
        </div>

        {/* ── Activity list ── */}
        {loading ? (
          <div className="flex items-center justify-center h-48 text-slate-400 text-sm">Loading…</div>
        ) : activities.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
            No activities found for month {month}
            {cat !== 'all' ? ` · ${CATEGORY_LABELS[cat]}` : ''}
            {subCat ? ` · ${subCat}` : ''}
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {paged.map((a) => (
              <ActivityCard
                key={a.id}
                activity={a}
                onEdit={(act) => setModal({ open: true, activity: act })}
                onDelete={handleDelete}
                deleting={deleting === a.id}
              />
            ))}
          </div>
        )}
        <Pagination page={page} totalPages={totalPages} onPage={setPage} />

        <div className="px-5 py-3 text-xs text-slate-400 border-t border-slate-50">
          {activities.length} activities · month {month}
          {cat !== 'all' ? ` · ${CATEGORY_LABELS[cat]}` : ''}
          {subCat ? ` · ${subCat}` : ''}
        </div>
      </div>

      {modal.open && (
        <ActivityModal
          initial={modal.activity}
          onClose={() => setModal({ open: false })}
          onSaved={refetch}
        />
      )}
    </div>
  );
}
