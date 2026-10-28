'use client';

import { useState, useCallback } from 'react';
import { useFetch } from '@/hooks/useFetch';
import { MilestoneDefinition, MilestoneType } from '@/types/api';
import PageHeader from '@/components/PageHeader';
import Modal from '@/components/Modal';
import Pagination from '@/components/Pagination';
import { usePagination } from '@/hooks/usePagination';
import { api } from '@/lib/api';

// ─── Constants ────────────────────────────────────────────────────────────────

const TYPES: { value: MilestoneType | 'all'; label: string; color: string }[] = [
  { value: 'all',              label: 'All Types',          color: 'bg-slate-100 text-slate-700' },
  { value: 'physical',         label: 'Physical',           color: 'bg-green-50 text-green-700' },
  { value: 'cognitive',        label: 'Cognitive',          color: 'bg-purple-50 text-purple-700' },
  { value: 'communication',    label: 'Communication',      color: 'bg-orange-50 text-orange-700' },
  { value: 'social_emotional', label: 'Social & Emotional', color: 'bg-pink-50 text-pink-700' },
];

const TYPE_COLOR: Record<MilestoneType, string> = {
  physical:         'bg-green-50 text-green-700',
  cognitive:        'bg-purple-50 text-purple-700',
  communication:    'bg-orange-50 text-orange-700',
  social_emotional: 'bg-pink-50 text-pink-700',
};

const TYPE_LABEL: Record<MilestoneType, string> = {
  physical:         'Physical',
  cognitive:        'Cognitive',
  communication:    'Communication',
  social_emotional: 'Social & Emotional',
};

const YEAR_GROUPS = [
  { label: 'Year 1', months: Array.from({ length: 12 }, (_, i) => i + 1) },
  { label: 'Year 2', months: Array.from({ length: 12 }, (_, i) => i + 13) },
  { label: 'Year 3', months: Array.from({ length: 12 }, (_, i) => i + 25) },
];

const EMPTY_FORM = {
  month: '2',
  milestone_type: 'physical' as MilestoneType,
  title: '',
  description: '',
  question: '',
  related_activity: '',
  display_order: '0',
  doctor_verified: false,
};
type FormState = typeof EMPTY_FORM;

// ─── Milestone Form Modal ─────────────────────────────────────────────────────

function MilestoneModal({
  def,
  filterMonth,
  onClose,
  onSaved,
}: {
  def: MilestoneDefinition | null;
  filterMonth: number | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!def;
  const [form, setForm] = useState<FormState>(
    def
      ? {
          month: String(def.month),
          milestone_type: def.milestone_type,
          title: def.title,
          description: def.description,
          question: def.question ?? '',
          related_activity: def.related_activity ?? '',
          display_order: String(def.display_order),
          doctor_verified: def.doctor_verified,
        }
      : { ...EMPTY_FORM, month: filterMonth ? String(filterMonth) : '2' }
  );
  const [saving, setSaving] = useState(false);
  const [mutError, setMutError] = useState<string | null>(null);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(f => ({ ...f, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    setMutError(null);
    try {
      const payload = {
        month: Number(form.month),
        milestone_type: form.milestone_type,
        title: form.title.trim(),
        description: form.description.trim(),
        question: form.question.trim() || undefined,
        related_activity: form.related_activity.trim() || undefined,
        display_order: Number(form.display_order),
        doctor_verified: form.doctor_verified,
      };
      if (isEdit) {
        await api.put(`/milestone-definitions/${def!.id}`, payload);
      } else {
        await api.post('/milestone-definitions', payload);
      }
      onSaved();
      onClose();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
        ?? (err as Error)?.message ?? 'Save failed';
      setMutError(msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal onClose={onClose}>
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <h2 className="text-lg font-bold text-slate-800">
          {isEdit ? 'Edit Milestone' : 'New Milestone Definition'}
        </h2>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">&times;</button>
      </div>

        <div className="px-6 py-5 space-y-4">
          {mutError && (
            <div className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2">{mutError}</div>
          )}

          {/* Month + Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Month *</label>
              <div className="space-y-2">
                {YEAR_GROUPS.map(g => (
                  <div key={g.label}>
                    <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">{g.label}</div>
                    <div className="flex flex-wrap gap-1">
                      {g.months.map(m => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => set('month', String(m))}
                          className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                            Number(form.month) === m
                              ? 'bg-purple-600 text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1 block">Type *</label>
                <div className="space-y-1">
                  {TYPES.filter(t => t.value !== 'all').map(t => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => set('milestone_type', t.value as MilestoneType)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                        form.milestone_type === t.value
                          ? t.color + ' ring-2 ring-offset-1 ring-purple-400'
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1 block">Display Order</label>
                <input
                  type="number"
                  min={0}
                  value={form.display_order}
                  onChange={e => set('display_order', e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1 block">Title *</label>
            <input
              value={form.title}
              onChange={e => set('title', e.target.value)}
              placeholder="Brief milestone title"
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1 block">Description *</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="What the baby does at this milestone"
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm resize-none"
            />
          </div>

          {/* Question */}
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1 block">
              Question{' '}
              <span className="font-normal text-slate-400">(shown to parent — Yes / No / Almost)</span>
            </label>
            <textarea
              rows={2}
              value={form.question}
              onChange={e => set('question', e.target.value)}
              placeholder="Does your baby…?"
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm resize-none"
            />
          </div>

          {/* Related Activity */}
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1 block">Related Activity</label>
            <input
              value={form.related_activity}
              onChange={e => set('related_activity', e.target.value)}
              placeholder="e.g. Tummy Time L1"
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm"
            />
          </div>

          {/* Doctor Verified */}
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={form.doctor_verified}
              onChange={e => set('doctor_verified', e.target.checked)}
              className="w-4 h-4 rounded accent-purple-600"
            />
            <span className="text-sm font-medium text-slate-700">Doctor Verified</span>
            <span className="text-xs text-slate-400">— content reviewed by a medical professional</span>
          </label>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !form.title.trim() || !form.description.trim()}
            className="px-5 py-2 rounded-xl text-sm font-semibold bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50"
          >
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create'}
          </button>
        </div>
    </Modal>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MilestonesPage() {
  const [filterMonth, setFilterMonth] = useState<number | null>(null);
  const [filterType, setFilterType]   = useState<MilestoneType | 'all'>('all');
  const [modal, setModal] = useState<{ open: boolean; def: MilestoneDefinition | null }>({ open: false, def: null });

  const params = new URLSearchParams();
  if (filterMonth) params.set('month', String(filterMonth));
  if (filterType !== 'all') params.set('milestone_type', filterType);
  const queryString = params.toString();

  const { data: rows, loading, error, refetch } = useFetch<MilestoneDefinition[]>(
    `/milestone-definitions${queryString ? '?' + queryString : ''}`
  );

  const { paged, page, totalPages, setPage } = usePagination(rows ?? []);

  const openCreate = useCallback(() => setModal({ open: true, def: null }), []);
  const openEdit   = useCallback((d: MilestoneDefinition) => setModal({ open: true, def: d }), []);
  const closeModal = useCallback(() => setModal({ open: false, def: null }), []);

  async function doDelete(def: MilestoneDefinition) {
    if (!confirm(`Delete "${def.title}"? All baby progress records linked to it will also be removed.`)) return;
    try {
      await api.delete(`/milestone-definitions/${def.id}`);
      refetch();
    } catch {
      alert('Delete failed. Please try again.');
    }
  }

  return (
    <div className="p-8">
      <PageHeader
        title="Milestones"
        subtitle="Manage milestone definitions by month and type"
        action={
          <button
            onClick={openCreate}
            className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-xl hover:bg-purple-700 transition-colors"
          >
            + New Milestone
          </button>
        }
      />

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-6 space-y-3">
        <div>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Filter by Month</div>
          <div className="flex flex-wrap gap-1.5 items-center">
            <button
              onClick={() => { setFilterMonth(null); setPage(1); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                filterMonth === null ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All
            </button>
            {YEAR_GROUPS.map(g => (
              <div key={g.label} className="flex items-center gap-1">
                <span className="text-[10px] font-bold text-slate-300 px-1">{g.label}</span>
                {g.months.map(m => (
                  <button
                    key={m}
                    onClick={() => { setFilterMonth(m); setPage(1); }}
                    className={`w-8 h-8 rounded-xl text-xs font-medium transition-colors ${
                      filterMonth === m ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {TYPES.map(t => (
            <button
              key={t.value}
              onClick={() => { setFilterType(t.value); setPage(1); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                filterType === t.value
                  ? t.value === 'all'
                    ? 'bg-slate-700 text-white'
                    : t.color + ' ring-2 ring-offset-1 ring-purple-400'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      {rows && rows.length > 0 && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          {(['physical', 'cognitive', 'communication', 'social_emotional'] as MilestoneType[]).map(t => {
            const count = rows.filter(r => r.milestone_type === t).length;
            return (
              <div key={t} className={`rounded-2xl px-4 py-3 border border-slate-100 ${TYPE_COLOR[t]}`}>
                <div className="text-2xl font-bold">{count}</div>
                <div className="text-xs font-semibold mt-0.5 opacity-80">{TYPE_LABEL[t]}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading && (
          <div className="flex justify-center items-center py-20 text-slate-400 text-sm">Loading…</div>
        )}
        {error && (
          <div className="text-sm text-red-600 text-center py-8">{error}</div>
        )}
        {!loading && !error && paged.length === 0 && (
          <div className="text-sm text-slate-400 text-center py-16">
            No milestones found.{' '}
            <button onClick={openCreate} className="text-purple-600 font-medium hover:underline">
              Create one
            </button>
          </div>
        )}
        {!loading && paged.length > 0 && (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs text-slate-400 font-semibold uppercase tracking-wide">
                <th className="text-left px-5 py-3 w-12">Mo.</th>
                <th className="text-left px-3 py-3 w-40">Type</th>
                <th className="text-left px-3 py-3">Title / Description</th>
                <th className="text-left px-3 py-3 w-40">Related Activity</th>
                <th className="text-center px-3 py-3 w-20">Verified</th>
                <th className="text-center px-3 py-3 w-12">Ord</th>
                <th className="px-5 py-3 w-24"></th>
              </tr>
            </thead>
            <tbody>
              {paged.map(def => (
                <tr key={def.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3 font-bold text-slate-700">{def.month}</td>
                  <td className="px-3 py-3">
                    <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${TYPE_COLOR[def.milestone_type]}`}>
                      {TYPE_LABEL[def.milestone_type]}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="font-semibold text-slate-800">{def.title}</div>
                    <div className="text-xs text-slate-400 mt-0.5 line-clamp-2">{def.description}</div>
                    {def.question && (
                      <div className="text-xs text-blue-500 mt-0.5 italic line-clamp-1">{def.question}</div>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    {def.related_activity ? (
                      <span className="inline-block px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs">
                        {def.related_activity}
                      </span>
                    ) : (
                      <span className="text-slate-300 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-center">
                    {def.doctor_verified ? (
                      <span title="Doctor verified" className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-bold">✓</span>
                    ) : (
                      <span className="text-slate-300 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-slate-400 text-xs text-center">{def.display_order}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => openEdit(def)}
                        className="text-xs font-medium text-purple-600 hover:text-purple-800 px-2 py-1 rounded-lg hover:bg-purple-50 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => doDelete(def)}
                        className="text-xs font-medium text-red-500 hover:text-red-700 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-4">
          <Pagination page={page} totalPages={totalPages} onPage={setPage} />
        </div>
      )}

      {modal.open && (
        <MilestoneModal
          def={modal.def}
          filterMonth={filterMonth}
          onClose={closeModal}
          onSaved={refetch}
        />
      )}
    </div>
  );
}
