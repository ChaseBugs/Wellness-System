'use client';

import { useState } from 'react';
import { useFetch } from '@/hooks/useFetch';
import { api } from '@/lib/api';
import PageHeader from '@/components/PageHeader';
import Modal from '@/components/Modal';
import Pagination from '@/components/Pagination';
import { usePagination } from '@/hooks/usePagination';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AdminMessage {
  id: number;
  title: string;
  body: string;
  type: 'announcement' | 'alert' | 'tip' | 'update';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  target_role: 'all' | 'user' | 'doctor' | 'agent';
  is_published: boolean;
  published_at: string | null;
  created_at: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TYPE_STYLES: Record<string, string> = {
  announcement: 'bg-blue-50 text-blue-700',
  alert:        'bg-red-50 text-red-700',
  tip:          'bg-green-50 text-green-700',
  update:       'bg-purple-50 text-purple-700',
};

const TYPE_ICONS: Record<string, string> = {
  announcement: '📣',
  alert:        '⚠️',
  tip:          '💡',
  update:       '🔄',
};

const PRIORITY_STYLES: Record<string, string> = {
  low:    'bg-slate-100 text-slate-500',
  normal: 'bg-slate-100 text-slate-600',
  high:   'bg-orange-50 text-orange-600',
  urgent: 'bg-red-50 text-red-700 font-semibold',
};

const EMPTY_FORM = {
  title:       '',
  body:        '',
  type:        'announcement' as AdminMessage['type'],
  priority:    'normal'       as AdminMessage['priority'],
  target_role: 'all'          as AdminMessage['target_role'],
  is_published: false,
};

// ─── Message Form Modal ───────────────────────────────────────────────────────

function MessageModal({
  initial,
  onClose,
  onSaved,
}: {
  initial?: AdminMessage;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!initial;
  const [form, setForm] = useState({
    title:        initial?.title        ?? EMPTY_FORM.title,
    body:         initial?.body         ?? EMPTY_FORM.body,
    type:         initial?.type         ?? EMPTY_FORM.type,
    priority:     initial?.priority     ?? EMPTY_FORM.priority,
    target_role:  initial?.target_role  ?? EMPTY_FORM.target_role,
    is_published: initial?.is_published ?? EMPTY_FORM.is_published,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  const set = <K extends keyof typeof EMPTY_FORM>(k: K, v: (typeof EMPTY_FORM)[K]) =>
    setForm(p => ({ ...p, [k]: v }));

  async function handleSave() {
    if (!form.title.trim()) { setError('Title is required.'); return; }
    if (!form.body.trim())  { setError('Body is required.');  return; }
    setSaving(true);
    setError('');
    try {
      if (isEdit) {
        await api.put(`/admin-messages/${initial!.id}`, form);
      } else {
        await api.post('/admin-messages', form);
      }
      onSaved();
      onClose();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } }; message?: string };
      setError(e?.response?.data?.error ?? e?.message ?? 'Failed to save.');
    } finally {
      setSaving(false);
    }
  }

  const TYPES: AdminMessage['type'][]          = ['announcement', 'alert', 'tip', 'update'];
  const PRIORITIES: AdminMessage['priority'][] = ['low', 'normal', 'high', 'urgent'];
  const ROLES: AdminMessage['target_role'][]   = ['all', 'user', 'doctor', 'agent'];

  return (
    <Modal onClose={onClose}>
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <h2 className="text-base font-semibold text-slate-800">
          {isEdit ? 'Edit Message' : 'New Admin Message'}
        </h2>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">&times;</button>
      </div>

      <div className="px-6 py-5 space-y-4">
        {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

        {/* Type */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">Type *</label>
          <div className="flex gap-2 flex-wrap">
            {TYPES.map(t => (
              <button
                key={t}
                type="button"
                onClick={() => set('type', t)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border capitalize transition-colors ${
                  form.type === t
                    ? `${TYPE_STYLES[t]} border-transparent`
                    : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                }`}
              >
                {TYPE_ICONS[t]} {t}
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Title *</label>
          <input
            value={form.title}
            onChange={e => set('title', e.target.value)}
            placeholder="Message title…"
            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
          />
        </div>

        {/* Body */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Body *</label>
          <textarea
            rows={5}
            value={form.body}
            onChange={e => set('body', e.target.value)}
            placeholder="Message content shown to users…"
            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 resize-none"
          />
        </div>

        {/* Priority + Target Role */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Priority</label>
            <div className="flex gap-1.5 flex-wrap">
              {PRIORITIES.map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => set('priority', p)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border capitalize transition-colors ${
                    form.priority === p
                      ? `${PRIORITY_STYLES[p]} border-transparent`
                      : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Target Audience</label>
            <div className="flex gap-1.5 flex-wrap">
              {ROLES.map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => set('target_role', r)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border capitalize transition-colors ${
                    form.target_role === r
                      ? 'bg-purple-600 text-white border-transparent'
                      : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Published toggle */}
        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={form.is_published}
            onChange={e => set('is_published', e.target.checked)}
            className="w-4 h-4 accent-purple-600"
          />
          <span className="text-sm text-slate-700">Publish immediately</span>
          <span className="text-xs text-slate-400">— visible to users right away</span>
        </label>
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
          {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Message'}
        </button>
      </div>
    </Modal>
  );
}

// ─── Delete confirmation ──────────────────────────────────────────────────────

function DeleteModal({
  message,
  onClose,
  onDeleted,
}: {
  message: AdminMessage;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      await api.delete(`/admin-messages/${message.id}`);
      onDeleted();
      onClose();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Modal onClose={onClose} maxWidth="max-w-sm">
      <div className="p-6">
        <h3 className="text-sm font-semibold text-slate-800 mb-2">Delete Message?</h3>
        <p className="text-xs text-slate-500 mb-5">
          &ldquo;{message.title}&rdquo; will be permanently removed.
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-xl border border-slate-200"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-4 py-2 text-sm bg-red-500 text-white rounded-xl hover:bg-red-600 disabled:opacity-50"
          >
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MessagesPage() {
  const { data: raw, loading, refetch } = useFetch<AdminMessage[]>('/admin-messages');
  const messages = raw ?? [];

  const [search,      setSearch]      = useState('');
  const [typeFilter,  setTypeFilter]  = useState('all');
  const [modal,       setModal]       = useState<{ open: boolean; message?: AdminMessage }>({ open: false });
  const [deleteModal, setDeleteModal] = useState<AdminMessage | null>(null);

  const filtered = messages.filter(m => {
    const matchType  = typeFilter === 'all' || m.type === typeFilter;
    const matchSearch = !search || m.title.toLowerCase().includes(search.toLowerCase()) || m.body.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  const { paged, page, totalPages, setPage } = usePagination(filtered);

  const published   = messages.filter(m => m.is_published).length;
  const unpublished = messages.length - published;

  async function togglePublish(msg: AdminMessage) {
    await api.put(`/admin-messages/${msg.id}`, { is_published: !msg.is_published });
    refetch();
  }

  return (
    <div className="p-8">
      <PageHeader
        title="Admin Messages"
        subtitle="Announcements and notifications sent to users"
        action={
          <button
            onClick={() => setModal({ open: true })}
            className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-xl hover:bg-purple-700 transition-colors"
          >
            + New Message
          </button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total',       value: messages.length, color: 'text-slate-700' },
          { label: 'Published',   value: published,       color: 'text-green-600' },
          { label: 'Draft',       value: unpublished,     color: 'text-slate-400' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-sm text-slate-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
        {/* Filters */}
        <div className="px-5 py-4 border-b border-slate-100 flex flex-wrap items-center gap-3">
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search messages…"
            className="px-4 py-2 border border-slate-200 rounded-xl text-sm w-56 focus:outline-none focus:ring-2 focus:ring-purple-300"
          />
          <div className="flex gap-1.5">
            {(['all', 'announcement', 'alert', 'tip', 'update'] as const).map(t => (
              <button
                key={t}
                onClick={() => { setTypeFilter(t); setPage(1); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition-colors ${
                  typeFilter === t
                    ? t === 'all'
                      ? 'bg-slate-700 text-white'
                      : TYPE_STYLES[t]
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {t === 'all' ? 'All' : `${TYPE_ICONS[t]} ${t}`}
              </button>
            ))}
          </div>
          <span className="ml-auto text-xs text-slate-400">{filtered.length} messages</span>
        </div>

        {/* List */}
        {loading ? (
          <div className="flex items-center justify-center h-48 text-slate-400 text-sm">Loading…</div>
        ) : paged.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-slate-400 text-sm">No messages found</div>
        ) : (
          <div className="divide-y divide-slate-50">
            {paged.map(msg => (
              <div
                key={msg.id}
                className="px-5 py-4 flex items-start gap-4 hover:bg-slate-50 transition-colors group"
              >
                {/* Type icon */}
                <div className={`mt-0.5 w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0 ${TYPE_STYLES[msg.type]}`}>
                  {TYPE_ICONS[msg.type]}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-slate-800">{msg.title}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${PRIORITY_STYLES[msg.priority]}`}>
                      {msg.priority}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-500 capitalize">
                      → {msg.target_role}
                    </span>
                    {msg.is_published ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-50 text-green-700">Published</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-400">Draft</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{msg.body}</p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {msg.published_at
                      ? `Published ${new Date(msg.published_at).toLocaleDateString()}`
                      : `Created ${new Date(msg.created_at).toLocaleDateString()}`}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button
                    onClick={() => togglePublish(msg)}
                    className={`px-2.5 py-1 text-xs rounded-lg transition-colors ${
                      msg.is_published
                        ? 'text-slate-600 bg-slate-100 hover:bg-slate-200'
                        : 'text-green-700 bg-green-50 hover:bg-green-100'
                    }`}
                  >
                    {msg.is_published ? 'Unpublish' : 'Publish'}
                  </button>
                  <button
                    onClick={() => setModal({ open: true, message: msg })}
                    className="px-2.5 py-1 text-xs text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteModal(msg)}
                    className="px-2.5 py-1 text-xs text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <Pagination page={page} totalPages={totalPages} onPage={setPage} />
      </div>

      {modal.open && (
        <MessageModal
          initial={modal.message}
          onClose={() => setModal({ open: false })}
          onSaved={refetch}
        />
      )}

      {deleteModal && (
        <DeleteModal
          message={deleteModal}
          onClose={() => setDeleteModal(null)}
          onDeleted={refetch}
        />
      )}
    </div>
  );
}
