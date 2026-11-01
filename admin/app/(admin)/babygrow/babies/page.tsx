'use client';

import { useState } from 'react';
import { babyFromKit, useResourceList, type ChildRecord } from '@/lib/babygrow/resources';
import { Baby } from '@/types/babygrow';
import PageHeader from '@/components/babygrow/PageHeader';
import DataTable from '@/components/babygrow/DataTable';
import Pagination from '@/components/babygrow/Pagination';
import { usePagination } from '@/hooks/usePagination';

function ageLabel(birthDate: string) {
  const months = Math.floor((Date.now() - new Date(birthDate).getTime()) / (1000 * 60 * 60 * 24 * 30.44));
  if (months < 12) return `${months}mo`;
  const y = Math.floor(months / 12), m = months % 12;
  return m > 0 ? `${y}y ${m}mo` : `${y}y`;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

// Children are created by caregivers in the app; the admin lists them with their owner.
export default function BabiesPage() {
  const { items: babies, loading } = useResourceList<ChildRecord, Baby>('children', { sort: '-createdAt' }, babyFromKit);
  const [search, setSearch] = useState('');

  const q = search.toLowerCase();
  const filtered = babies.filter((b) =>
    b.name?.toLowerCase().includes(q) || b.owner_email?.toLowerCase().includes(q)
  );
  const { paged, page, totalPages, setPage } = usePagination(filtered);

  const columns = [
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
    {
      key: 'owner_email', label: 'Owner',
      render: (b: Baby) => (
        <div className="min-w-0">
          <div className="text-xs text-slate-700 truncate">{b.owner_name || '—'}</div>
          <div className="text-xs text-slate-400 truncate">{b.owner_email}</div>
        </div>
      ),
    },
    {
      key: 'caregiver_count', label: 'Caregivers',
      render: (b: Baby) => <span className="text-xs text-slate-600">{b.caregiver_count}</span>,
    },
  ];

  return (
    <div className="p-8">
      <PageHeader title="Babies" subtitle="Baby profiles created by caregivers in the app" />

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
        <div className="p-5 border-b border-slate-100">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or owner email…"
            className="w-full max-w-sm px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
          />
        </div>
        <DataTable columns={columns} data={paged} loading={loading} />
        <Pagination page={page} totalPages={totalPages} onPage={setPage} />
        <div className="px-5 py-3 text-xs text-slate-400 border-t border-slate-50">
          {filtered.length} baby profile{filtered.length !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
}
