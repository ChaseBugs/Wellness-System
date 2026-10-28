'use client';

import { useState } from 'react';
import { useFetch } from '@/hooks/useFetch';
import PageHeader from '@/components/PageHeader';
import Pagination from '@/components/Pagination';
import { usePagination } from '@/hooks/usePagination';

interface Baby { id: number; name: string; birth_date: string }
interface Member {
  id: number;
  user_id: number;
  full_name: string;
  email: string;
  role: string;
  joined_at: string;
  invited_by_name: string;
}
interface Invitation {
  id: number;
  invitee_email: string;
  role: string;
  status: string;
  expires_at: string;
  created_at: string;
}

const ROLE_COLOR: Record<string, string> = {
  editor: 'bg-blue-100 text-blue-700',
  viewer: 'bg-slate-100 text-slate-600',
};
const STATUS_COLOR: Record<string, string> = {
  pending:  'bg-yellow-100 text-yellow-700',
  accepted: 'bg-green-100 text-green-700',
  declined: 'bg-red-100 text-red-600',
  expired:  'bg-slate-100 text-slate-400',
};

export default function FamilySharingPage() {
  const [selectedBabyId, setSelectedBabyId] = useState<string>('');

  const { data: babiesRaw, loading: loadingBabies } = useFetch<Baby[]>('/babies');
  const babies = babiesRaw ?? [];
  const { data: membersRaw, loading: loadingMembers, refetch: refetchMembers } = useFetch<Member[]>(
    selectedBabyId ? `/family/babies/${selectedBabyId}/members` : null
  );
  const members = membersRaw ?? [];
  const { data: invitationsRaw, loading: loadingInvitations, refetch: refetchInvitations } = useFetch<Invitation[]>(
    selectedBabyId ? `/family/babies/${selectedBabyId}/invitations` : null
  );
  const invitations = invitationsRaw ?? [];

  const selectedBaby = babies.find(b => String(b.id) === selectedBabyId);

  const { paged: pagedMembers, page: membersPage, totalPages: membersTotalPages, setPage: setMembersPage } = usePagination(members);
  const { paged: pagedInvitations, page: invitationsPage, totalPages: invitationsTotalPages, setPage: setInvitationsPage } = usePagination(invitations);

  return (
    <div className="p-8">
      <PageHeader
        title="Family Sharing"
        subtitle="Manage shared baby profiles and family member access"
      />

      {/* Baby selector */}
      <div className="mb-6">
        <label className="text-sm font-medium text-slate-600 block mb-1.5">Select Baby</label>
        <select
          value={selectedBabyId}
          onChange={e => setSelectedBabyId(e.target.value)}
          className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white min-w-56"
        >
          <option value="">— choose a baby —</option>
          {babies.map(b => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
      </div>

      {!selectedBabyId ? (
        <div className="bg-white rounded-2xl border border-slate-100 h-48 flex items-center justify-center text-slate-400 text-sm">
          Select a baby to manage family access
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Members */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-slate-800">Family Members</h2>
                <p className="text-xs text-slate-400">{members.length} members with access to {selectedBaby?.name}</p>
              </div>
            </div>
            {loadingMembers ? (
              <div className="p-8 text-center text-slate-400 text-sm">Loading…</div>
            ) : members.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">No family members yet</div>
            ) : (
              <div className="divide-y divide-slate-50">
                {pagedMembers.map(m => (
                  <div key={m.id} className="px-6 py-4 flex items-center gap-4">
                    <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-sm flex-shrink-0">
                      {m.full_name?.[0]?.toUpperCase() ?? 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-800">{m.full_name}</div>
                      <div className="text-xs text-slate-400">{m.email}</div>
                      {m.invited_by_name && (
                        <div className="text-xs text-slate-300">Invited by {m.invited_by_name}</div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_COLOR[m.role] ?? 'bg-slate-100 text-slate-600'}`}>
                        {m.role}
                      </span>
                      <span className="text-xs text-slate-300">
                        {new Date(m.joined_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Pagination page={membersPage} totalPages={membersTotalPages} onPage={setMembersPage} />
          </div>

          {/* Invitations */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-800">Invitations</h2>
              <p className="text-xs text-slate-400">{invitations.length} total</p>
            </div>
            {loadingInvitations ? (
              <div className="p-8 text-center text-slate-400 text-sm">Loading…</div>
            ) : invitations.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">No invitations sent</div>
            ) : (
              <div className="divide-y divide-slate-50">
                {pagedInvitations.map(inv => (
                  <div key={inv.id} className="px-6 py-3.5 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-slate-700 truncate">{inv.invitee_email}</div>
                      <div className="text-xs text-slate-400">
                        Sent {new Date(inv.created_at).toLocaleDateString()} · Expires {new Date(inv.expires_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex gap-1.5 items-center flex-shrink-0">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_COLOR[inv.role] ?? 'bg-slate-100 text-slate-600'}`}>
                        {inv.role}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLOR[inv.status] ?? 'bg-slate-100 text-slate-600'}`}>
                        {inv.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Pagination page={invitationsPage} totalPages={invitationsTotalPages} onPage={setInvitationsPage} />
          </div>
        </div>
      )}
    </div>
  );
}
