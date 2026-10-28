'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import PageHeader from '@/components/PageHeader';
import DataTable from '@/components/DataTable';
import Pagination from '@/components/Pagination';
import { usePagination } from '@/hooks/usePagination';

interface Doctor {
  id?: number;      // alias for DataTable (= user_id)
  user_id: number;
  full_name: string;
  email: string;
  specialty: string;
  grade: string;
  grade_level: number;
  hospital: string;
  license_number: string;
  verified: boolean;
  verified_at: string | null;
  total_points: number;
  bio: string;
}

const GRADE_COLORS: Record<number, string> = {
  1: 'bg-slate-100 text-slate-600',
  2: 'bg-blue-100 text-blue-700',
  3: 'bg-purple-100 text-purple-700',
  4: 'bg-amber-100 text-amber-700',
  5: 'bg-rose-100 text-rose-700',
};

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'verified' | 'unverified'>('all');
  const [verifying, setVerifying] = useState<number | null>(null);

  useEffect(() => {
    api.get('/doctors')
      .then(r => setDoctors((r.data.data ?? []).map((d: Doctor) => ({ ...d, id: d.user_id }))))
      .catch(() => setDoctors([]))
      .finally(() => setLoading(false));
  }, []);

  async function verify(userId: number) {
    setVerifying(userId);
    try {
      await api.post(`/doctors/${userId}/verify`);
      setDoctors(prev => prev.map(d => d.user_id === userId ? { ...d, verified: true, verified_at: new Date().toISOString() } : d));
    } finally {
      setVerifying(null);
    }
  }

  const filtered = doctors.filter(d =>
    filter === 'all' ? true : filter === 'verified' ? d.verified : !d.verified
  );
  const { paged, page, totalPages, setPage } = usePagination(filtered);

  const columns = [
    { key: 'full_name',   label: 'Name' },
    { key: 'email',       label: 'Email' },
    {
      key: 'grade', label: 'Grade',
      render: (d: Doctor) => (
        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${GRADE_COLORS[d.grade_level] ?? 'bg-slate-100 text-slate-600'}`}>
          {d.grade}
        </span>
      ),
    },
    { key: 'specialty',   label: 'Specialty' },
    { key: 'hospital',    label: 'Hospital' },
    {
      key: 'total_points', label: 'Points',
      render: (d: Doctor) => <span className="font-semibold text-purple-600">{Number(d.total_points).toLocaleString()}</span>,
    },
    {
      key: 'verified', label: 'Verified',
      render: (d: Doctor) => d.verified
        ? <span className="text-xs text-green-600 font-semibold">✓ Verified</span>
        : (
          <button
            onClick={() => verify(d.user_id)}
            disabled={verifying === d.user_id}
            className="text-xs px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            {verifying === d.user_id ? 'Processing…' : 'Verify'}
          </button>
        ),
    },
  ];

  const stats = {
    total: doctors.length,
    verified: doctors.filter(d => d.verified).length,
    specialists: doctors.filter(d => d.grade_level >= 3).length,
  };

  return (
    <div className="p-8">
      <PageHeader title="Doctor Management" subtitle="Registered doctor-grade users" />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total doctors', value: stats.total, color: 'text-slate-700' },
          { label: 'Verified', value: stats.verified, color: 'text-green-600' },
          { label: 'Specialist+', value: stats.specialists, color: 'text-purple-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-sm text-slate-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
        <div className="p-5 border-b border-slate-100 flex gap-2">
          {(['all', 'verified', 'unverified'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filter === f ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f === 'all' ? 'All' : f === 'verified' ? 'Verified' : 'Unverified'}
            </button>
          ))}
        </div>
        <DataTable columns={columns} data={paged} loading={loading} emptyText="No doctors registered." />
        <Pagination page={page} totalPages={totalPages} onPage={setPage} />
        <div className="px-5 py-3 text-xs text-slate-400 border-t border-slate-50">
          {filtered.length} doctors
        </div>
      </div>
    </div>
  );
}
