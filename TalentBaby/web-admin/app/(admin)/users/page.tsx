'use client';

import { useState, useRef, useEffect } from 'react';
import { useFetch } from '@/hooks/useFetch';
import { useMutation } from '@/hooks/useMutation';
import { UserWithBabies, Baby } from '@/types/api';
import { getUser } from '@/lib/auth';
import PageHeader from '@/components/PageHeader';
import Modal from '@/components/Modal';
import DataTable from '@/components/DataTable';
import Pagination from '@/components/Pagination';
import { usePagination } from '@/hooks/usePagination';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function ageLabel(birthDate: string) {
  const months = Math.floor(
    (Date.now() - new Date(birthDate).getTime()) / (1000 * 60 * 60 * 24 * 30.44)
  );
  if (months < 1) return '< 1mo';
  if (months < 12) return `${months}mo`;
  const y = Math.floor(months / 12), m = months % 12;
  return m > 0 ? `${y}y ${m}mo` : `${y}y`;
}

const ROLE_STYLES: Record<string, string> = {
  admin:  'bg-red-50 text-red-700',
  doctor: 'bg-blue-50 text-blue-700',
  agent:  'bg-amber-50 text-amber-700',
  user:   'bg-slate-100 text-slate-600',
};

const ROLE_LABELS: Record<string, string> = {
  admin:  'Admin',
  doctor: 'Doctor',
  agent:  'Agent',
  user:   'User',
};

const STAFF_ROLES = new Set(['admin', 'doctor', 'agent']);
const ROLE_FILTER_OPTIONS = ['All', 'user', 'doctor', 'agent', 'admin'] as const;
const RELATIONS = ['father', 'mother', 'grandmother', 'grandfather'] as const;

// ─── Baby Search Dropdown ──────────────────────────────────────────────────────

function BabySearchDropdown({
  babies,
  value,
  onChange,
}: {
  babies: Baby[];
  value: number | null;
  onChange: (id: number | null) => void;
}) {
  const [query,  setQuery]  = useState('');
  const [open,   setOpen]   = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = babies.find(b => b.id === value) ?? null;

  const filtered = query.trim()
    ? babies.filter(b => b.name.toLowerCase().includes(query.toLowerCase()))
    : babies;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <div
        className="flex items-center gap-2 w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white cursor-text focus-within:ring-2 focus-within:ring-purple-300"
        onClick={() => setOpen(true)}
      >
        {selected && !open ? (
          <span className="flex-1 text-slate-800">{selected.name}</span>
        ) : (
          <input
            autoFocus={open}
            value={query}
            onChange={e => { setQuery(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            placeholder={selected ? selected.name : 'Type to search baby…'}
            className="flex-1 outline-none bg-transparent text-slate-800 placeholder:text-slate-400"
          />
        )}
        {value && (
          <button
            type="button"
            onClick={e => { e.stopPropagation(); onChange(null); setQuery(''); }}
            className="text-slate-300 hover:text-slate-500 text-base leading-none"
          >
            ×
          </button>
        )}
      </div>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg max-h-52 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="px-4 py-3 text-xs text-slate-400">No babies found</div>
          ) : (
            filtered.map(b => (
              <button
                key={b.id}
                type="button"
                onMouseDown={() => { onChange(b.id); setQuery(''); setOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-purple-50 transition-colors ${
                  b.id === value ? 'bg-purple-50' : ''
                }`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  b.gender === 'male' ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600'
                }`}>
                  {b.name[0]?.toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-slate-800">{b.name}</div>
                  {b.birth_date && (
                    <div className="text-[10px] text-slate-400">{new Date(b.birth_date).toLocaleDateString()}</div>
                  )}
                </div>
                {b.id === value && <span className="ml-auto text-purple-500 text-xs">✓</span>}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ─── Create User Modal ─────────────────────────────────────────────────────────

const EMPTY_FORM = {
  full_name: '',
  email: '',
  password: '',
  role: 'user' as 'user' | 'agent' | 'doctor',
  is_premium: false,
  relation_to_baby: '' as typeof RELATIONS[number] | '',
  baby_id: null as number | null,
};

function CreateUserModal({
  babies,
  onClose,
  onCreated,
}: {
  babies: Baby[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const mutation = useMutation<unknown>('post', '/users/admin/create');

  function set<K extends keyof typeof EMPTY_FORM>(key: K, value: (typeof EMPTY_FORM)[K]) {
    setForm(f => ({ ...f, [key]: value }));
  }

  async function handleSave() {
    const payload: Record<string, unknown> = {
      email: form.email,
      password: form.password,
      full_name: form.full_name || undefined,
      role: form.role,
      is_premium: form.is_premium,
    };
    if (form.role === 'user') {
      if (form.relation_to_baby) payload.relation_to_baby = form.relation_to_baby;
      if (form.baby_id)          payload.baby_id          = form.baby_id;
    }
    const result = await mutation.mutate(payload);
    if (result) { onCreated(); onClose(); }
  }

  const isUser = form.role === 'user';

  return (
    <Modal onClose={onClose} maxWidth="max-w-lg">
      {/* header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <h2 className="text-base font-semibold text-slate-800">Add New User</h2>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">&times;</button>
      </div>

        <div className="px-6 py-5 space-y-4">

          {/* Role selector — first so other fields react */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Role *</label>
            <div className="flex gap-2">
              {(['user', 'agent', 'doctor'] as const).map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => set('role', r)}
                  className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-colors capitalize ${
                    form.role === r
                      ? `${ROLE_STYLES[r]} border-transparent shadow-sm`
                      : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  {ROLE_LABELS[r]}
                </button>
              ))}
            </div>
          </div>

          {/* Name + Email */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Full Name</label>
              <input
                value={form.full_name}
                onChange={e => set('full_name', e.target.value)}
                placeholder="e.g. Kim Ji-yeon"
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Email *</label>
              <input
                type="email"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                placeholder="user@example.com"
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Password *</label>
            <input
              type="password"
              value={form.password}
              onChange={e => set('password', e.target.value)}
              placeholder="Min. 6 characters"
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
          </div>

          {/* Premium toggle */}
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={form.is_premium}
              onChange={e => set('is_premium', e.target.checked)}
              className="w-4 h-4 accent-amber-500"
            />
            <span className="text-sm text-slate-700">Premium account</span>
          </label>

          {/* User-only fields */}
          {isUser && (
            <>
              <div className="border-t border-slate-100 pt-4">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Baby Info</div>

                {/* Relation */}
                <div className="mb-4">
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">Relation to Baby</label>
                  <div className="flex gap-2">
                    {RELATIONS.map(rel => (
                      <button
                        key={rel}
                        type="button"
                        onClick={() => set('relation_to_baby', form.relation_to_baby === rel ? '' : rel)}
                        className={`flex-1 py-2 rounded-xl text-xs font-semibold border capitalize transition-colors ${
                          form.relation_to_baby === rel
                            ? 'bg-purple-600 text-white border-transparent'
                            : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        {rel}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Baby search */}
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Assign Baby (optional)</label>
                  <BabySearchDropdown
                    babies={babies}
                    value={form.baby_id}
                    onChange={id => set('baby_id', id)}
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    The selected baby will be assigned to this user and set as their main baby.
                  </p>
                </div>
              </div>
            </>
          )}

          {mutation.error && (
            <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{mutation.error}</p>
          )}
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
            disabled={mutation.loading || !form.email || !form.password}
            className="px-5 py-2 text-sm bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50"
          >
            {mutation.loading ? 'Creating…' : 'Create User'}
          </button>
        </div>
    </Modal>
  );
}

// ─── Detail Panel ─────────────────────────────────────────────────────────────

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
            {baby.birth_date ? ageLabel(baby.birth_date) : '—'} old
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
        <div className="bg-white rounded-lg p-2 border border-slate-100">
          <div className="text-slate-400 mb-0.5">Birth Weight</div>
          <div className="font-medium text-slate-700">
            {baby.birth_weight_kg ? `${baby.birth_weight_kg} kg` : '—'}
          </div>
        </div>
        <div className="bg-white rounded-lg p-2 border border-slate-100">
          <div className="text-slate-400 mb-0.5">Birth Height</div>
          <div className="font-medium text-slate-700">
            {baby.birth_height_cm ? `${baby.birth_height_cm} cm` : '—'}
          </div>
        </div>
      </div>
    </div>
  );
}

function UserDetailPanel({
  user,
  onClose,
  onActiveBabyChange,
}: {
  user: UserWithBabies;
  onClose: () => void;
  onActiveBabyChange: (userId: number, babyId: number | null) => void;
}) {
  const isStaff   = STAFF_ROLES.has(user.role ?? 'user');
  const activeBaby = user.babies.find(b => b.id === user.active_baby_id) ?? user.babies[0] ?? null;

  return (
    <div className="fixed inset-0 z-40 flex">
      <div className="flex-1 bg-black/20" onClick={onClose} />
      <div className="w-full max-w-md bg-white shadow-2xl overflow-y-auto flex flex-col">

        {/* header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <h2 className="font-bold text-slate-800">User Profile</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors">✕</button>
        </div>

        <div className="p-6 flex flex-col gap-6">

          {/* avatar + name + badges */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-xl flex-shrink-0">
              {user.full_name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="font-bold text-slate-800 text-base">{user.full_name || '—'}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${ROLE_STYLES[user.role ?? 'user'] ?? ROLE_STYLES.user}`}>
                  {ROLE_LABELS[user.role ?? 'user'] ?? user.role}
                </span>
                {user.is_premium && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 uppercase tracking-wide">⭐ Premium</span>
                )}
              </div>
              <div className="text-sm text-slate-500">{user.email}</div>
              {user.phone_number && <div className="text-xs text-slate-400 mt-0.5">{user.phone_number}</div>}
            </div>
          </div>

          {/* info grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-50 rounded-xl p-3">
              <div className="text-slate-400 mb-0.5">Role</div>
              <div className="font-medium text-slate-700 capitalize">{user.role || 'user'}</div>
            </div>
            <div className="bg-slate-50 rounded-xl p-3">
              <div className="text-slate-400 mb-0.5">Premium</div>
              <div className={`font-medium ${user.is_premium ? 'text-amber-600' : 'text-slate-400'}`}>
                {user.is_premium ? 'Yes' : 'No'}
              </div>
            </div>
            <div className="bg-slate-50 rounded-xl p-3">
              <div className="text-slate-400 mb-0.5">Gender</div>
              <div className="font-medium text-slate-700 capitalize">{user.gender || '—'}</div>
            </div>
            <div className="bg-slate-50 rounded-xl p-3">
              <div className="text-slate-400 mb-0.5">Joined</div>
              <div className="font-medium text-slate-700">
                {user.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}
              </div>
            </div>
            {!isStaff && (
              <div className="bg-slate-50 rounded-xl p-3 col-span-2">
                <div className="text-slate-400 mb-0.5">Relation to Baby</div>
                <div className="font-medium text-slate-700 capitalize">{user.relation_to_baby || '—'}</div>
              </div>
            )}
          </div>

          {/* babies — regular users only */}
          {!isStaff && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-slate-700 text-sm">
                  Babies
                  <span className="ml-2 px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-xs font-normal">
                    {user.babies.length}
                  </span>
                </h3>
                {user.babies.length > 1 && (
                  <span className="text-xs text-slate-400">Click to set as main</span>
                )}
              </div>
              {user.babies.length === 0 ? (
                <div className="text-sm text-slate-400 bg-slate-50 rounded-xl p-4 text-center">No babies registered</div>
              ) : (
                <div className="flex flex-col gap-3">
                  {user.babies.map(baby => (
                    <button key={baby.id} onClick={() => onActiveBabyChange(user.id, baby.id)} className="text-left w-full transition-transform hover:scale-[1.01]">
                      <BabyCard baby={baby} isActive={
                        user.active_baby_id != null
                          ? baby.id === user.active_baby_id
                          : baby.id === user.babies[0]?.id
                      } />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* main baby detail */}
          {!isStaff && activeBaby && (
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-5 border border-purple-100">
              <h3 className="font-semibold text-purple-800 text-sm mb-4">Main Baby Details</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold ${
                  activeBaby.gender === 'male' ? 'bg-blue-200 text-blue-700' : 'bg-pink-200 text-pink-700'
                }`}>
                  {activeBaby.name[0]?.toUpperCase()}
                </div>
                <div>
                  <div className="font-bold text-slate-800">{activeBaby.name}</div>
                  <div className="text-xs text-slate-500">
                    {activeBaby.birth_date
                      ? `${new Date(activeBaby.birth_date).toLocaleDateString()} · ${ageLabel(activeBaby.birth_date)} old`
                      : '—'}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white/70 rounded-lg p-2.5">
                  <div className="text-slate-400 mb-0.5">Baby Name</div>
                  <div className="font-semibold text-slate-700">{activeBaby.name}</div>
                </div>
                <div className="bg-white/70 rounded-lg p-2.5">
                  <div className="text-slate-400 mb-0.5">Date of Birth</div>
                  <div className="font-semibold text-slate-700">
                    {activeBaby.birth_date ? new Date(activeBaby.birth_date).toLocaleDateString() : '—'}
                  </div>
                </div>
                <div className="bg-white/70 rounded-lg p-2.5">
                  <div className="text-slate-400 mb-0.5">Gender</div>
                  <div className={`font-semibold capitalize ${activeBaby.gender === 'male' ? 'text-blue-600' : 'text-pink-600'}`}>
                    {activeBaby.gender || '—'}
                  </div>
                </div>
                <div className="bg-white/70 rounded-lg p-2.5">
                  <div className="text-slate-400 mb-0.5">Age</div>
                  <div className="font-semibold text-slate-700">
                    {activeBaby.birth_date ? ageLabel(activeBaby.birth_date) : '—'}
                  </div>
                </div>
                <div className="bg-white/70 rounded-lg p-2.5">
                  <div className="text-slate-400 mb-0.5">Birth Weight</div>
                  <div className="font-semibold text-slate-700">
                    {activeBaby.birth_weight_kg ? `${activeBaby.birth_weight_kg} kg` : '—'}
                  </div>
                </div>
                <div className="bg-white/70 rounded-lg p-2.5">
                  <div className="text-slate-400 mb-0.5">Birth Height</div>
                  <div className="font-semibold text-slate-700">
                    {activeBaby.birth_height_cm ? `${activeBaby.birth_height_cm} cm` : '—'}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function UsersPage() {
  const { data: usersRaw, loading, refetch } = useFetch<UserWithBabies[]>('/users/all');
  const { data: allBabies }                  = useFetch<Baby[]>('/babies/admin/all');
  const users  = usersRaw ?? [];
  const babies = allBabies ?? [];

  const currentUser = getUser();
  const isAdmin = currentUser?.role === 'admin';

  const [search,      setSearch]      = useState('');
  const [roleFilter,  setRoleFilter]  = useState('All');
  const [selected,    setSelected]    = useState<UserWithBabies | null>(null);
  const [showCreate,  setShowCreate]  = useState(false);

  const filtered = users.filter(u => {
    const matchRole = roleFilter === 'All' || (u.role ?? 'user') === roleFilter;
    const q = search.toLowerCase();
    const matchQ = !q || u.full_name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
    return matchRole && matchQ;
  });

  const { paged, page, totalPages, setPage } = usePagination(filtered);

  async function handleActiveBabyChange(userId: number, babyId: number | null) {
    const { api } = await import('@/lib/api');
    await api.put(`/users/${userId}/active-baby`, { baby_id: babyId });
    await refetch();
    setSelected(prev => prev?.id === userId ? { ...prev, active_baby_id: babyId } : prev);
  }

  const roleCounts = ROLE_FILTER_OPTIONS.reduce<Record<string, number>>((acc, r) => {
    acc[r] = r === 'All' ? users.length : users.filter(u => (u.role ?? 'user') === r).length;
    return acc;
  }, {});

  // ── Table columns ──────────────────────────────────────────────────────────
  const columns = [
    {
      key: 'id', label: 'ID',
      render: (u: UserWithBabies) => <span className="text-xs text-slate-400">#{u.id}</span>,
    },
    {
      key: 'full_name', label: 'Name',
      render: (u: UserWithBabies) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-xs flex-shrink-0">
            {u.full_name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-slate-800 text-sm truncate">{u.full_name || '—'}</div>
            <div className="text-xs text-slate-400 truncate">{u.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'role', label: 'Role',
      render: (u: UserWithBabies) => (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${ROLE_STYLES[u.role ?? 'user'] ?? ROLE_STYLES.user}`}>
          {ROLE_LABELS[u.role ?? 'user'] ?? u.role}
        </span>
      ),
    },
    {
      key: 'is_premium', label: 'Premium',
      render: (u: UserWithBabies) => u.is_premium
        ? <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700">⭐ Premium</span>
        : <span className="text-slate-300 text-xs">—</span>,
    },
    {
      key: 'relation_to_baby', label: 'Relation',
      render: (u: UserWithBabies) =>
        !STAFF_ROLES.has(u.role ?? 'user') && u.relation_to_baby
          ? <span className="text-xs text-slate-600 capitalize">{u.relation_to_baby}</span>
          : <span className="text-slate-300 text-xs">—</span>,
    },
    {
      key: 'baby_name', label: 'Baby Name',
      render: (u: UserWithBabies) => {
        if (STAFF_ROLES.has(u.role ?? 'user')) return <span className="text-slate-300 text-xs">—</span>;
        const baby = u.babies.find(b => b.id === u.active_baby_id) ?? u.babies[0] ?? null;
        return baby
          ? (
            <div className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${baby.gender === 'male' ? 'bg-blue-400' : 'bg-pink-400'}`} />
              <span className="text-sm font-medium text-slate-700">{baby.name}</span>
              {u.babies.length > 1 && (
                <span className="text-[10px] text-slate-400">+{u.babies.length - 1}</span>
              )}
            </div>
          )
          : <span className="text-slate-300 text-xs">—</span>;
      },
    },
    {
      key: 'baby_dob', label: 'Baby DOB',
      render: (u: UserWithBabies) => {
        if (STAFF_ROLES.has(u.role ?? 'user')) return <span className="text-slate-300 text-xs">—</span>;
        const baby = u.babies.find(b => b.id === u.active_baby_id) ?? u.babies[0] ?? null;
        return baby?.birth_date
          ? (
            <div>
              <div className="text-xs text-slate-700">{new Date(baby.birth_date).toLocaleDateString()}</div>
              <div className="text-[10px] text-slate-400">{ageLabel(baby.birth_date)} old</div>
            </div>
          )
          : <span className="text-slate-300 text-xs">—</span>;
      },
    },
    {
      key: 'created_at', label: 'Joined',
      render: (u: UserWithBabies) => (
        <span className="text-xs text-slate-500">
          {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}
        </span>
      ),
    },
  ];

  return (
    <div className="p-8">
      <PageHeader
        title="Users"
        subtitle="Registered accounts and baby profiles"
        action={isAdmin ? (
          <button
            onClick={() => setShowCreate(true)}
            className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-xl hover:bg-purple-700 transition-colors"
          >
            + Add User
          </button>
        ) : undefined}
      />

      {/* Role filter chips */}
      <div className="flex flex-wrap gap-2 mb-5">
        {ROLE_FILTER_OPTIONS.map(r => (
          <button
            key={r}
            onClick={() => { setRoleFilter(r); setPage(1); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
              roleFilter === r
                ? r === 'All'
                  ? 'bg-purple-600 text-white border-transparent'
                  : `${ROLE_STYLES[r] ?? 'bg-slate-100 text-slate-600'} border-transparent shadow-sm`
                : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
            }`}
          >
            {r === 'All' ? 'All' : ROLE_LABELS[r]}
            <span className="ml-1.5 opacity-70">{roleCounts[r]}</span>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
        {/* Toolbar */}
        <div className="p-5 border-b border-slate-100 flex items-center gap-3">
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name or email…"
            className="w-full max-w-sm px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
          />
          <span className="ml-auto text-xs text-slate-400 whitespace-nowrap">
            {filtered.length} user{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        <DataTable
          columns={columns}
          data={paged}
          loading={loading}
          emptyText="No users found"
          onRowClick={u => setSelected(u)}
        />
        <Pagination page={page} totalPages={totalPages} onPage={setPage} />
      </div>

      {selected && (
        <UserDetailPanel
          user={selected}
          onClose={() => setSelected(null)}
          onActiveBabyChange={handleActiveBabyChange}
        />
      )}

      {showCreate && (
        <CreateUserModal
          babies={babies}
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); refetch(); }}
        />
      )}
    </div>
  );
}
