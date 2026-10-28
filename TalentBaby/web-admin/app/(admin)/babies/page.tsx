'use client';

import { useState } from 'react';
import { useFetch } from '@/hooks/useFetch';
import { api } from '@/lib/api';
import { Baby } from '@/types/api';
import PageHeader from '@/components/PageHeader';
import Modal from '@/components/Modal';
import DataTable from '@/components/DataTable';
import Pagination from '@/components/Pagination';
import { usePagination } from '@/hooks/usePagination';

function ageLabel(birthDate: string) {
  const months = Math.floor((Date.now() - new Date(birthDate).getTime()) / (1000 * 60 * 60 * 24 * 30.44));
  if (months < 12) return `${months}mo`;
  const y = Math.floor(months / 12), m = months % 12;
  return m > 0 ? `${y}y ${m}mo` : `${y}y`;
}

// ─── Add Baby Modal ───────────────────────────────────────────────────────────

interface BabyFormData {
  name: string;
  birth_date: string;
  gender: 'male' | 'female' | '';
  birth_weight_kg: string;
  birth_height_cm: string;
}

const EMPTY_FORM: BabyFormData = {
  name: '',
  birth_date: '',
  gender: '',
  birth_weight_kg: '',
  birth_height_cm: '',
};

function AddBabyModal({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<BabyFormData>({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = <K extends keyof BabyFormData>(k: K, v: BabyFormData[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  async function handleSave() {
    if (!form.name.trim()) { setError('Name is required.'); return; }
    if (!form.birth_date)  { setError('Date of birth is required.'); return; }
    setSaving(true);
    setError('');
    try {
      const payload: Record<string, unknown> = {
        name: form.name.trim(),
        birth_date: form.birth_date,
      };
      if (form.gender)           payload.gender            = form.gender;
      if (form.birth_weight_kg)  payload.birth_weight_kg   = Number(form.birth_weight_kg);
      if (form.birth_height_cm)  payload.birth_height_cm   = Number(form.birth_height_cm);
      await api.post('/babies', payload);
      onSaved();
      onClose();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string | { message?: string } } }; message?: string };
      setError(
        (typeof e?.response?.data?.error === 'object'
          ? e?.response?.data?.error?.message
          : e?.response?.data?.error as string)
        ?? e?.message ?? 'Failed to save.'
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal onClose={onClose} maxWidth="max-w-md">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <h2 className="text-base font-semibold text-slate-800">Add Baby</h2>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">&times;</button>
      </div>

      <div className="px-6 py-5 space-y-4">
        {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Name *</label>
          <input
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="e.g. Lena"
            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Date of Birth *</label>
          <input
            type="date"
            value={form.birth_date}
            onChange={(e) => set('birth_date', e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">Gender</label>
          <div className="flex gap-2">
            {(['male', 'female'] as const).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => set('gender', form.gender === g ? '' : g)}
                className={`flex-1 py-2 rounded-xl text-sm font-medium border capitalize transition-colors ${
                  form.gender === g
                    ? g === 'male'
                      ? 'bg-blue-500 text-white border-transparent'
                      : 'bg-pink-500 text-white border-transparent'
                    : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                }`}
              >
                {g === 'male' ? '👦 Boy' : '👧 Girl'}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Birth Weight (kg)</label>
            <input
              type="number"
              min={0}
              step={0.01}
              value={form.birth_weight_kg}
              onChange={(e) => set('birth_weight_kg', e.target.value)}
              placeholder="e.g. 3.2"
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Birth Height (cm)</label>
            <input
              type="number"
              min={0}
              step={0.1}
              value={form.birth_height_cm}
              onChange={(e) => set('birth_height_cm', e.target.value)}
              placeholder="e.g. 50"
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-xl border border-slate-200"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2 text-sm font-medium text-white bg-purple-600 rounded-xl hover:bg-purple-700 disabled:opacity-50 transition-colors"
        >
          {saving ? 'Saving…' : 'Add Baby'}
        </button>
      </div>
    </Modal>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BabiesPage() {
  const { data: babiesRaw, loading, refetch } = useFetch<Baby[]>('/babies/admin/all');
  const babies = babiesRaw ?? [];
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

  const filtered = babies.filter((b) =>
    b.name?.toLowerCase().includes(search.toLowerCase())
  );
  const { paged, page, totalPages, setPage } = usePagination(filtered);

  const columns = [
    {
      key: 'id', label: 'ID',
      render: (b: Baby) => <span className="text-xs text-slate-400">#{b.id}</span>,
    },
    {
      key: 'name', label: 'Name',
      render: (b: Baby) => (
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
            b.gender === 'male' ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600'
          }`}>
            {b.name[0]?.toUpperCase()}
          </div>
          <span className="font-medium text-slate-800">{b.name}</span>
        </div>
      ),
    },
    {
      key: 'birth_date', label: 'Date of Birth',
      render: (b: Baby) => b.birth_date ? new Date(b.birth_date).toLocaleDateString() : '—',
    },
    {
      key: 'age', label: 'Age',
      render: (b: Baby) => b.birth_date ? ageLabel(b.birth_date) : '—',
    },
    {
      key: 'gender', label: 'Gender',
      render: (b: Baby) => b.gender ? (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
          b.gender === 'male' ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'
        }`}>
          {b.gender}
        </span>
      ) : <span className="text-slate-300">—</span>,
    },
    {
      key: 'birth_weight_kg', label: 'Weight',
      render: (b: Baby) => b.birth_weight_kg ? `${b.birth_weight_kg} kg` : '—',
    },
    {
      key: 'birth_height_cm', label: 'Height',
      render: (b: Baby) => b.birth_height_cm ? `${b.birth_height_cm} cm` : '—',
    },
  ];

  return (
    <div className="p-8">
      <PageHeader
        title="Babies"
        subtitle="Registered baby profiles"
        action={
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-xl hover:bg-purple-700 transition-colors"
          >
            + Add Baby
          </button>
        }
      />

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
        <div className="p-5 border-b border-slate-100">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name…"
            className="w-full max-w-sm px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
          />
        </div>
        <DataTable columns={columns} data={paged} loading={loading} />
        <Pagination page={page} totalPages={totalPages} onPage={setPage} />
        <div className="px-5 py-3 text-xs text-slate-400 border-t border-slate-50">
          {filtered.length} baby profile{filtered.length !== 1 ? 's' : ''}
        </div>
      </div>

      {showModal && (
        <AddBabyModal
          onClose={() => setShowModal(false)}
          onSaved={refetch}
        />
      )}
    </div>
  );
}
