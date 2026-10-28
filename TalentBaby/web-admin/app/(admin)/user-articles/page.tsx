'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import PageHeader from '@/components/PageHeader';
import DataTable from '@/components/DataTable';
import Pagination from '@/components/Pagination';
import { usePagination } from '@/hooks/usePagination';

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserArticle {
  id: number;
  title: string;
  content: string;
  category: string;
  tags: string[];
  keywords: string[];
  thumbnail_url?: string;
  status: string;
  view_count: number;
  like_count: number;
  comment_count: number;
  created_at: string;
  author_name: string;
  author_role: string;
  doctor_grade?: string;
  doctor_specialty?: string;
}

interface Comment {
  id: number;
  parent_id?: number | null;
  content: string;
  like_count: number;
  is_doctor_comment: boolean;
  created_at: string;
  author_name: string;
  doctor_grade?: string;
  replies?: Comment[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  published: 'bg-green-100 text-green-700',
  draft:     'bg-slate-100 text-slate-500',
  hidden:    'bg-red-100 text-red-600',
};

const CATEGORY_LABELS: Record<string, string> = {
  general: 'General', parenting: 'Parenting', nutrition: 'Nutrition',
  health: 'Health', development: 'Development', experience: 'Experience',
};

const CATEGORY_COLORS: Record<string, string> = {
  general:     'bg-slate-100 text-slate-600',
  parenting:   'bg-purple-50 text-purple-700',
  nutrition:   'bg-green-50 text-green-700',
  health:      'bg-blue-50 text-blue-700',
  development: 'bg-orange-50 text-orange-700',
  experience:  'bg-pink-50 text-pink-700',
};

// Depth-cycling indent line colors
const DEPTH_COLORS = [
  'border-purple-300',
  'border-blue-300',
  'border-green-300',
  'border-orange-300',
  'border-pink-300',
];

// Flatten tree for counting / doctor-only filtering
function flattenComments(list: Comment[]): Comment[] {
  return list.flatMap(c => [c, ...flattenComments(c.replies ?? [])]);
}

// Filter tree: keep only branches that contain at least one doctor comment.
// A node is kept if it or any descendant is_doctor_comment.
function filterDoctorBranches(list: Comment[]): Comment[] {
  return list.reduce<Comment[]>((acc, c) => {
    const filteredReplies = filterDoctorBranches(c.replies ?? []);
    if (c.is_doctor_comment || filteredReplies.length > 0) {
      acc.push({ ...c, replies: filteredReplies });
    }
    return acc;
  }, []);
}

// ─── Comment Node (recursive) ─────────────────────────────────────────────────

function CommentNode({ comment, depth = 0 }: { comment: Comment; depth?: number }) {
  const [collapsed, setCollapsed] = useState(false);
  const hasReplies = (comment.replies?.length ?? 0) > 0;
  const lineColor  = DEPTH_COLORS[depth % DEPTH_COLORS.length];

  return (
    <div className={depth > 0 ? `ml-5 border-l-2 pl-3 ${lineColor}` : ''}>
      <div className="py-2.5">
        {/* Author row */}
        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
            comment.is_doctor_comment ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
          }`}>
            {comment.author_name?.[0]?.toUpperCase() ?? '?'}
          </div>

          <span className="text-xs font-semibold text-slate-700">{comment.author_name}</span>

          {comment.is_doctor_comment && (
            <>
              {/* Star badge */}
              <span className="text-amber-400 text-sm leading-none" title="Doctor comment">★</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-700">
                🩺 {comment.doctor_grade ?? 'Doctor'}
              </span>
            </>
          )}

          {depth > 0 && (
            <span className="text-[10px] text-slate-300 font-medium">↩ reply</span>
          )}

          <span className="ml-auto text-[10px] text-slate-400">
            {new Date(comment.created_at).toLocaleDateString()}
          </span>
          {comment.like_count > 0 && (
            <span className="text-[10px] text-slate-400">❤️ {comment.like_count}</span>
          )}
        </div>

        {/* Content */}
        <p className="text-xs text-slate-600 leading-relaxed pl-8">{comment.content}</p>

        {/* Collapse toggle */}
        {hasReplies && (
          <button
            onClick={() => setCollapsed(c => !c)}
            className="mt-1.5 pl-8 text-[10px] text-purple-500 hover:text-purple-700 font-medium transition-colors"
          >
            {collapsed
              ? `▶ Show ${comment.replies!.length} repl${comment.replies!.length === 1 ? 'y' : 'ies'}`
              : `▼ Hide ${comment.replies!.length} repl${comment.replies!.length === 1 ? 'y' : 'ies'}`}
          </button>
        )}
      </div>

      {hasReplies && !collapsed && (
        <div className="mb-1">
          {comment.replies!.map(r => (
            <CommentNode key={r.id} comment={r} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Article Detail Modal ─────────────────────────────────────────────────────

function ArticleDetailModal({
  article,
  onClose,
}: {
  article: UserArticle;
  onClose: () => void;
}) {
  const [allComments,  setAllComments]  = useState<Comment[]>([]);
  const [commentsLoading, setLoading]   = useState(true);
  const [doctorCommentsOnly, setDoctor] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get(`/user-articles/${article.id}/comments`)
      .then(r => setAllComments(r.data?.data ?? []))
      .catch(() => setAllComments([]))
      .finally(() => setLoading(false));
  }, [article.id]);

  const visibleComments = doctorCommentsOnly
    ? filterDoctorBranches(allComments)
    : allComments;

  const flat           = flattenComments(allComments);
  const totalComments  = flat.length;
  const doctorComments = flat.filter(c => c.is_doctor_comment).length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
          <div className="flex-1 min-w-0 pr-4">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${
                CATEGORY_COLORS[article.category] ?? 'bg-slate-100 text-slate-600'
              }`}>
                {CATEGORY_LABELS[article.category] ?? article.category}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${
                STATUS_COLORS[article.status] ?? 'bg-slate-100 text-slate-500'
              }`}>
                {article.status}
              </span>
              {article.author_role === 'doctor' && (
                <span className="flex items-center gap-0.5 text-[10px] font-semibold text-amber-600">
                  <span className="text-amber-400 text-sm leading-none">★</span> Doctor article
                </span>
              )}
            </div>
            <h2 className="text-base font-bold text-slate-800 leading-snug">{article.title}</h2>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <div className="flex items-center gap-1.5">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                  article.author_role === 'doctor' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                }`}>
                  {article.author_name?.[0]?.toUpperCase()}
                </div>
                <span className="text-xs text-slate-600">{article.author_name}</span>
                {article.author_role === 'doctor' && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-blue-50 text-blue-700">
                    🩺 {article.doctor_grade}
                  </span>
                )}
              </div>
              <span className="text-slate-300">·</span>
              <span className="text-[10px] text-slate-400">{new Date(article.created_at).toLocaleDateString()}</span>
              <span className="text-slate-300">·</span>
              <span className="text-[10px] text-slate-400">👁 {article.view_count}</span>
              <span className="text-[10px] text-slate-400">❤️ {article.like_count}</span>
              <span className="text-[10px] text-slate-400">💬 {article.comment_count}</span>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none flex-shrink-0">&times;</button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          {/* Article content */}
          <div className="px-6 py-4 border-b border-slate-100">
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{article.content}</p>

            {(article.tags?.length > 0 || article.keywords?.length > 0) && (
              <div className="mt-4 space-y-2">
                {article.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 items-center">
                    <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wide w-14">Tags</span>
                    {article.tags.map(t => (
                      <span key={t} className="px-2 py-0.5 rounded-full text-[10px] bg-purple-50 text-purple-700 font-medium">#{t}</span>
                    ))}
                  </div>
                )}
                {article.keywords?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 items-center">
                    <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wide w-14">Keywords</span>
                    {article.keywords.map(k => (
                      <span key={k} className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-500">{k}</span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Comments section */}
          <div className="px-6 py-4">
            {/* Comments header + filter */}
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <h3 className="text-sm font-bold text-slate-800">Comments</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
                {totalComments}
              </span>
              {doctorComments > 0 && (
                <span className="flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700">
                  <span className="text-amber-400">★</span> {doctorComments} doctor
                </span>
              )}

              {/* Doctor filter toggle */}
              <div className="ml-auto flex items-center gap-1 bg-slate-100 rounded-xl p-1">
                <button
                  onClick={() => setDoctor(false)}
                  className={`px-3 py-1 rounded-lg text-[10px] font-semibold transition-colors ${
                    !doctorCommentsOnly ? 'bg-white text-slate-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setDoctor(true)}
                  disabled={doctorComments === 0}
                  className={`px-3 py-1 rounded-lg text-[10px] font-semibold transition-colors flex items-center gap-0.5 disabled:opacity-40 ${
                    doctorCommentsOnly ? 'bg-amber-400 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <span>★</span> Doctor only
                </button>
              </div>
            </div>

            {commentsLoading ? (
              <div className="flex items-center justify-center py-8 text-slate-400 text-sm">Loading comments…</div>
            ) : visibleComments.length === 0 ? (
              <div className="flex items-center justify-center py-8 text-slate-400 text-sm">
                {doctorCommentsOnly ? 'No doctor comments on this article' : 'No comments yet'}
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {visibleComments.map(c => (
                  <CommentNode key={c.id} comment={c} depth={0} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function UserArticlesPage() {
  const [articles, setArticles]   = useState<UserArticle[]>([]);
  const [loading,  setLoading]    = useState(true);
  const [search,   setSearch]     = useState('');
  const [category, setCategory]   = useState('all');
  const [doctorOnly, setDoctorOnly] = useState(false);
  const [selected, setSelected]   = useState<UserArticle | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category !== 'all') params.set('category', category);
    if (search)             params.set('search', search);
    if (doctorOnly)         params.set('doctor_only', 'true');
    api.get(`/user-articles?${params}`)
      .then(r => setArticles(r.data.data ?? []))
      .catch(() => setArticles([]))
      .finally(() => setLoading(false));
  }, [category, search, doctorOnly]);

  useEffect(() => { load(); }, [load]);

  const categories = ['all', 'general', 'parenting', 'nutrition', 'health', 'development', 'experience'];
  const { paged, page, totalPages, setPage } = usePagination(articles);

  const total      = articles.length;
  const doctorCount = articles.filter(a => a.author_role === 'doctor').length;
  const totalViews = articles.reduce((s, a) => s + a.view_count, 0);

  const columns = [
    {
      key: 'id', label: 'ID',
      render: (a: UserArticle) => <span className="text-xs text-slate-400">#{a.id}</span>,
    },
    {
      key: 'title', label: 'Title',
      render: (a: UserArticle) => (
        <div className="max-w-xs">
          <div className="flex items-center gap-1.5">
            {a.author_role === 'doctor' && (
              <span className="text-amber-400 text-base leading-none flex-shrink-0" title="Doctor article">★</span>
            )}
            <span className="font-medium text-slate-700 truncate text-sm">{a.title}</span>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium capitalize ${
              CATEGORY_COLORS[a.category] ?? 'bg-slate-100 text-slate-500'
            }`}>
              {CATEGORY_LABELS[a.category] ?? a.category}
            </span>
            {a.keywords?.slice(0, 2).map(k => (
              <span key={k} className="text-[10px] text-slate-400">{k}</span>
            ))}
          </div>
        </div>
      ),
    },
    {
      key: 'author_name', label: 'Author',
      render: (a: UserArticle) => (
        <div className="flex items-center gap-1.5">
          {a.author_role === 'doctor' && (
            <span className="text-amber-400 text-sm leading-none" title="Doctor">★</span>
          )}
          <div>
            <div className="text-sm text-slate-700">{a.author_name}</div>
            {a.author_role === 'doctor' && (
              <span className="text-[10px] px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                🩺 {a.doctor_grade}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'status', label: 'Status',
      render: (a: UserArticle) => (
        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
          STATUS_COLORS[a.status] ?? 'bg-slate-100 text-slate-500'
        }`}>
          {a.status}
        </span>
      ),
    },
    {
      key: 'stats', label: 'Stats',
      render: (a: UserArticle) => (
        <div className="text-xs text-slate-500 space-x-2">
          <span>👁 {a.view_count}</span>
          <span>❤️ {a.like_count}</span>
          <span>💬 {a.comment_count}</span>
        </div>
      ),
    },
    {
      key: 'created_at', label: 'Date',
      render: (a: UserArticle) => (
        <span className="text-xs text-slate-400">{new Date(a.created_at).toLocaleDateString()}</span>
      ),
    },
  ];

  return (
    <div className="p-8">
      <PageHeader title="User Articles" subtitle="Articles submitted by users" />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total articles', value: total,                       color: 'text-slate-700' },
          { label: 'By doctors',     value: doctorCount,                 color: 'text-blue-600'  },
          { label: 'Total views',    value: totalViews.toLocaleString(), color: 'text-purple-600'},
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-sm text-slate-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
        {/* Filters */}
        <div className="p-5 border-b border-slate-100 flex flex-wrap gap-3 items-center">
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by title, keyword…"
            className="px-4 py-2 border border-slate-200 rounded-xl text-sm w-56 focus:outline-none focus:ring-2 focus:ring-purple-300"
          />

          {/* Category chips */}
          <div className="flex gap-1.5 flex-wrap">
            {categories.map(c => (
              <button
                key={c}
                onClick={() => { setCategory(c); setPage(1); }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  category === c
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {c === 'all' ? 'All' : CATEGORY_LABELS[c] ?? c}
              </button>
            ))}
          </div>

          {/* Doctor-only toggle */}
          <button
            onClick={() => { setDoctorOnly(d => !d); setPage(1); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
              doctorOnly
                ? 'bg-amber-400 text-white border-transparent shadow-sm'
                : 'bg-white border-slate-200 text-slate-500 hover:border-amber-300 hover:text-amber-600'
            }`}
          >
            <span className={doctorOnly ? 'text-white' : 'text-amber-400'}>★</span>
            Doctor only
          </button>

          <span className="ml-auto text-xs text-slate-400 self-center">
            {articles.length} article{articles.length !== 1 ? 's' : ''}
          </span>
        </div>

        <DataTable
          columns={columns}
          data={paged}
          loading={loading}
          emptyText={doctorOnly ? 'No doctor articles found.' : 'No articles found.'}
          onRowClick={(a: UserArticle) => setSelected(a)}
        />

        <Pagination page={page} totalPages={totalPages} onPage={setPage} />

        <div className="px-5 py-3 text-xs text-slate-400 border-t border-slate-50">
          Showing {paged.length} of {articles.length} · page {page} of {totalPages}
        </div>
      </div>

      {selected && (
        <ArticleDetailModal
          article={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
