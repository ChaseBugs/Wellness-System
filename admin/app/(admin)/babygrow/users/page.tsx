'use client';

import { useMemo, useState } from 'react';
import { babyFromKit, userFromKit, useResourceList, type ChildRecord, type ParentRecord } from '@/lib/babygrow/resources';
import { Baby, User } from '@/types/babygrow';
import PageHeader from '@/components/babygrow/PageHeader';
import DataTable from '@/components/babygrow/DataTable';
import Modal from '@/components/babygrow/Modal';
import Pagination from '@/components/babygrow/Pagination';
import { usePagination } from '@/hooks/usePagination';

function ageLabel(birthDate: string) {
  const months = Math.floor((Date.now() - new Date(birthDate).getTime()) / (1000 * 60 * 60 * 24 * 30.44));
  if (months < 12) return `${months}mo`;
  const y = Math.floor(months / 12), m = months % 12;
  return m > 0 ? `${y}y ${m}mo` : `${y}y`;
}

function BabyCard({ baby, isActive }: { baby: Baby; isActive: boolean }) {
  return (
    <div className={`rounded-xl border p-4 ${isActive ? 'border-purple-300 bg-purple-50' : 'border-slate-100 bg-white'}`}>
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0 ${
          baby.gender === 'male' ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600'
        }`}>
          {baby.name[0]?.toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800 text-sm">{baby.name}</span>
            {isActive && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-200 text-purple-700">MAIN</span>
            )}
          </div>
          <div className="text-xs text-slate-500">
            {baby.birth_date ? ageLabel(baby.birth_date) : '—'} old · {baby.caregiver_count} caregiver{baby.caregiver_count !== 1 ? 's' : ''}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-white rounded-lg p-2 border border-slate-100">
          <div className="text-slate-400 mb-0.5">Date of Birth</div>
          <div className="font-medium text-slate-700">
            {baby.birth_date ? new Date(baby.birth_date).toLocaleDateString() : '—'}
          </div>
        </div>
        <div className="bg-white rounded-lg p-2 border border-slate-100">
          <div className="text-slate-400 mb-0.5">Gender</div>
          <div className={`font-medium capitalize ${baby.gender === 'male' ? 'text-blue-600' : 'text-pink-600'}`}>
            {baby.gender || '—'}
          </div>
        </div>
      </div>
    </div>
  );
}

function CaregiverDetail({ user, babies, onClose }: { user: User; babies: Baby[]; onClose: () => void }) {
  return (
    <Modal onClose={onClose}>
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <div>
          <h2 className="text-lg font-bold text-slate-800">{user.full_name || user.email}</h2>
          <p className="text-xs text-slate-400">{user.email}</p>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">&times;</button>
      </div>
      <div className="px-6 py-5 space-y-5">
        <div className="grid grid-cols-3 gap-3 text-xs">
          <div className="bg-slate-50 rounded-xl p-3">
            <div className="text-slate-400 mb-0.5">Relation</div>
            <div className="font-medium text-slate-700 capitalize">{user.relation_to_baby || '—'}</div>
          </div>
          <div className="bg-slate-50 rounded-xl p-3">
            <div className="text-slate-400 mb-0.5">Phone</div>
            <div className="font-medium text-slate-700">{user.phone_number || '—'}</div>
          </div>
          <div className="bg-slate-50 rounded-xl p-3">
            <div className="text-slate-400 mb-0.5">Joined</div>
            <div className="font-medium text-slate-700">{new Date(user.created_at).toLocaleDateString()}</div>
          </div>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-700 mb-2">Babies they own</h3>
          {babies.length === 0 ? (
            <p className="text-xs text-slate-400">
              {user.child_count > 0 ? 'Only shared babies (owned by another caregiver).' : 'No babies yet.'}
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {babies.map((b) => <BabyCard key={b.id} baby={b} isActive={b.id === user.active_baby_id} />)}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

/**
 * BabyGrow caregivers: Wellness accounts with a BabyGrow profile or a shared baby. Accounts are created
 * by signing up in the app and shared across the Wellness apps, so this view is read-only.
 */
export default function UsersPage() {
  const { items: users, loading } = useResourceList<ParentRecord, User>('parents', { sort: '-createdAt' }, userFromKit);
  const { items: babies } = useResourceList<ChildRecord, Baby>('children', {}, babyFromKit);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<User | null>(null);

  const babiesByOwner = useMemo(() => {
    const map = new Map<string, Baby[]>();
    for (const b of babies) map.set(b.owner_email, [...(map.get(b.owner_email) ?? []), b]);
    return map;
  }, [babies]);

  const q = search.toLowerCase();
  const filtered = users.filter((u) => !q || u.full_name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q));
  const { paged, page, totalPages, setPage } = usePagination(filtered);

  const columns = [
    {
      key: 'full_name', label: 'Name',
      render: (u: User) => (
        <button onClick={() => setSelected(u)} className="flex items-center gap-2.5 text-left min-w-0">
          <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-sm font-bold flex-shrink-0">
            {u.full_name?.[0]?.toUpperCase() || u.email[0]?.toUpperCase() || 'U'}
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-slate-800 text-sm truncate">{u.full_name || '—'}</div>
            <div className="text-xs text-slate-400 truncate">{u.email}</div>
          </div>
        </button>
      ),
    },
    {
      key: 'relation_to_baby', label: 'Relation',
      render: (u: User) => <span className="text-xs text-slate-600 capitalize">{u.relation_to_baby || '—'}</span>,
    },
    {
      key: 'child_count', label: 'Babies',
      render: (u: User) => <span className="text-xs text-slate-600">{u.child_count}</span>,
    },
    {
      key: 'created_at', label: 'Joined',
      render: (u: User) => <span className="text-xs text-slate-500">{new Date(u.created_at).toLocaleDateString()}</span>,
    },
  ];

  return (
    <div className="p-8">
      <PageHeader title="Caregivers" subtitle="Parents and caregivers using BabyGrow (accounts are created in the app)" />

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
        <div className="p-5 border-b border-slate-100">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="w-full max-w-sm px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
          />
        </div>
        <DataTable columns={columns} data={paged} loading={loading} />
        <Pagination page={page} totalPages={totalPages} onPage={setPage} />
        <div className="px-5 py-3 text-xs text-slate-400 border-t border-slate-50">
          {filtered.length} caregiver{filtered.length !== 1 ? 's' : ''}
        </div>
      </div>

      {selected && (
        <CaregiverDetail user={selected} babies={babiesByOwner.get(selected.email) ?? []} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
