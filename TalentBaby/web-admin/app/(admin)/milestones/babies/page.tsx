'use client';

import { useState, useCallback } from 'react';
import { useFetch } from '@/hooks/useFetch';
import { Baby, MilestoneType, MilestoneTypeSummary, MilestoneReport, BabyMilestoneItem } from '@/types/api';
import PageHeader from '@/components/PageHeader';
import { api } from '@/lib/api';

// ─── Constants ────────────────────────────────────────────────────────────────

const TYPES: { value: MilestoneType; label: string; color: string; bar: string; badge: string; card: string }[] = [
  { value: 'physical',         label: 'Physical',           color: 'bg-green-600',  bar: 'bg-green-500',  badge: 'bg-green-100 text-green-700',   card: 'bg-green-50 border-green-200'  },
  { value: 'cognitive',        label: 'Cognitive',          color: 'bg-purple-600', bar: 'bg-purple-500', badge: 'bg-purple-100 text-purple-700',  card: 'bg-purple-50 border-purple-200'},
  { value: 'communication',    label: 'Communication',      color: 'bg-orange-600', bar: 'bg-orange-500', badge: 'bg-orange-100 text-orange-700',  card: 'bg-orange-50 border-orange-200'},
  { value: 'social_emotional', label: 'Social & Emotional', color: 'bg-pink-600',   bar: 'bg-pink-500',   badge: 'bg-pink-100 text-pink-700',      card: 'bg-pink-50 border-pink-200'   },
];

const STATUS_CONFIG = {
  yes:        { label: 'Yes',    active: 'bg-green-100 text-green-700 ring-2 ring-offset-1 ring-green-400' },
  almost:     { label: 'Almost', active: 'bg-yellow-100 text-yellow-700 ring-2 ring-offset-1 ring-yellow-400' },
  no:         { label: 'No',     active: 'bg-red-100 text-red-700 ring-2 ring-offset-1 ring-red-400' },
};

const YEAR_GROUPS = [
  { label: 'Y1', months: Array.from({ length: 12 }, (_, i) => i + 1) },
  { label: 'Y2', months: Array.from({ length: 12 }, (_, i) => i + 13) },
  { label: 'Y3', months: Array.from({ length: 12 }, (_, i) => i + 25) },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function babyAgeMonths(birthDate: string): number {
  const birth = new Date(birthDate);
  const now = new Date();
  return Math.max(1,
    (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth())
  );
}

function ageLabel(birthDate: string) {
  const months = babyAgeMonths(birthDate);
  if (months < 12) return `${months}mo`;
  const y = Math.floor(months / 12), m = months % 12;
  return m > 0 ? `${y}y ${m}mo` : `${y}y`;
}

// ─── Milestone Row ────────────────────────────────────────────────────────────

function MilestoneRow({
  milestone,
  babyId,
  onSaved,
}: {
  milestone: BabyMilestoneItem;
  babyId: number;
  onSaved: () => void;
}) {
  const [saving, setSaving] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function handleStatus(status: 'yes' | 'no' | 'almost') {
    setSaving(status);
    setErr(null);
    try {
      await api.post('/baby-milestones', {
        baby_id: babyId,
        milestone_definition_id: milestone.id,
        status,
        achieved_date: status === 'yes' ? new Date().toISOString().split('T')[0] : null,
      });
      onSaved();
    } catch {
      setErr('Save failed');
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="flex items-start gap-3 py-4 border-b border-white/60 last:border-0">
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm text-slate-800">{milestone.title}</div>
        {milestone.question && (
          <div className="text-xs text-blue-500 mt-0.5 italic">{milestone.question}</div>
        )}
        <div className="text-xs text-slate-400 mt-0.5 line-clamp-2">{milestone.description}</div>
        {milestone.achieved_date && (
          <div className="text-xs text-green-600 mt-1 font-medium">
            Achieved {new Date(milestone.achieved_date).toLocaleDateString()}
          </div>
        )}
        {err && <div className="text-xs text-red-500 mt-1">{err}</div>}
      </div>
      <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
        {(['yes', 'almost', 'no'] as const).map(s => (
          <button
            key={s}
            onClick={() => handleStatus(s)}
            disabled={!!saving}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              milestone.status === s
                ? STATUS_CONFIG[s].active
                : 'bg-white/70 text-slate-500 hover:bg-white'
            } ${saving === s ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {saving === s ? '…' : STATUS_CONFIG[s].label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BabyMilestoneProgressPage() {
  const { data: babies } = useFetch<Baby[]>('/babies');

  const [selectedBabyId, setSelectedBabyId] = useState<number | null>(null);
  const [selectedType, setSelectedType]     = useState<MilestoneType>('physical');
  const [selectedMonth, setSelectedMonth]   = useState<number | null>(null);

  function selectBaby(baby: Baby) {
    setSelectedBabyId(baby.id);
    setSelectedMonth(baby.birth_date ? babyAgeMonths(baby.birth_date) : 2);
  }

  const reportUrl = selectedBabyId
    ? `/baby-milestones/${selectedBabyId}/report${selectedMonth ? `?month=${selectedMonth}` : ''}`
    : null;

  const { data: report, loading, error, refetch } = useFetch<MilestoneReport>(reportUrl);
  const onSaved = useCallback(() => refetch(), [refetch]);

  const typeCfg   = TYPES.find(t => t.value === selectedType)!;
  const summary: MilestoneTypeSummary | null = report?.by_type[selectedType] ?? null;
  const pct = summary && summary.total > 0 ? Math.round((summary.yes / summary.total) * 100) : 0;

  return (
    <div className="p-8">
      <PageHeader
        title="Milestone Progress"
        subtitle="View and update each baby's milestone status per month"
      />

      {/* ── Step 1: Select Baby ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-4">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
          1 · Select Baby
        </div>
        {!babies || babies.length === 0 ? (
          <div className="text-sm text-slate-400">No babies found.</div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {babies.map(baby => (
              <button
                key={baby.id}
                onClick={() => selectBaby(baby)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors border ${
                  selectedBabyId === baby.id
                    ? 'bg-purple-600 text-white border-purple-600'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>{baby.name}</span>
                {baby.birth_date && (
                  <span className={`text-xs ${selectedBabyId === baby.id ? 'text-purple-200' : 'text-slate-400'}`}>
                    {ageLabel(baby.birth_date)}
                  </span>
                )}
                {baby.gender && (
                  <span className={`text-xs ${selectedBabyId === baby.id ? 'text-purple-200' : baby.gender === 'male' ? 'text-blue-400' : 'text-pink-400'}`}>
                    {baby.gender === 'male' ? '♂' : '♀'}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Step 2: Select Type ── */}
      <div className={`bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-4 transition-opacity ${!selectedBabyId ? 'opacity-40 pointer-events-none' : ''}`}>
        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
          2 · Select Type
        </div>
        <div className="flex gap-2">
          {TYPES.map(t => (
            <button
              key={t.value}
              onClick={() => setSelectedType(t.value)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                selectedType === t.value
                  ? t.color + ' text-white shadow-sm'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Step 3: Select Month ── */}
      <div className={`bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-6 transition-opacity ${!selectedBabyId ? 'opacity-40 pointer-events-none' : ''}`}>
        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
          3 · Select Month
        </div>
        <div className="flex flex-wrap gap-1.5 items-center">
          {YEAR_GROUPS.map(g => (
            <div key={g.label} className="flex items-center gap-1">
              <span className="text-[10px] font-bold text-slate-300 px-1">{g.label}</span>
              {g.months.map(m => (
                <button
                  key={m}
                  onClick={() => setSelectedMonth(m)}
                  className={`w-8 h-8 rounded-xl text-xs font-medium transition-colors ${
                    selectedMonth === m
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

      {/* ── Empty state ── */}
      {!selectedBabyId && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm py-20 text-center text-slate-400 text-sm">
          Select a baby to get started.
        </div>
      )}

      {/* ── Loading / error ── */}
      {selectedBabyId && loading && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm py-20 text-center text-slate-400 text-sm">
          Loading…
        </div>
      )}
      {selectedBabyId && error && !loading && (
        <div className="text-sm text-red-600 text-center py-8">{error}</div>
      )}

      {/* ── Results ── */}
      {report && !loading && (
        <>
          {/* Overall stats row */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-4">
              <div className="text-3xl font-bold text-slate-800">{report.overall.completion_rate}%</div>
              <div className="text-xs text-slate-400 font-semibold mt-1 uppercase tracking-wide">Overall</div>
              <div className="text-xs text-slate-400 mt-1">Month {report.month}</div>
            </div>
            <div className="bg-green-50 rounded-2xl border border-green-100 px-5 py-4">
              <div className="text-3xl font-bold text-green-700">{report.overall.yes}</div>
              <div className="text-xs text-green-600 font-semibold mt-1 uppercase tracking-wide">Achieved</div>
            </div>
            <div className="bg-yellow-50 rounded-2xl border border-yellow-100 px-5 py-4">
              <div className="text-3xl font-bold text-yellow-700">{report.overall.almost}</div>
              <div className="text-xs text-yellow-600 font-semibold mt-1 uppercase tracking-wide">Almost</div>
            </div>
            <div className="bg-slate-50 rounded-2xl border border-slate-200 px-5 py-4">
              <div className="text-3xl font-bold text-slate-500">{report.overall.total}</div>
              <div className="text-xs text-slate-400 font-semibold mt-1 uppercase tracking-wide">Total</div>
            </div>
          </div>

          {/* Selected type panel */}
          {!summary || summary.total === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm py-16 text-center text-slate-400 text-sm">
              No {typeCfg.label} milestone definitions for month {report.month}.
            </div>
          ) : (
            <div className={`rounded-2xl border p-6 ${typeCfg.card}`}>
              {/* Type header */}
              <div className="flex items-center justify-between mb-4">
                <span className={`px-3 py-1.5 rounded-xl text-sm font-bold ${typeCfg.badge}`}>
                  {typeCfg.label}
                </span>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="text-green-600 font-semibold">{summary.yes} yes</span>
                  <span>·</span>
                  <span className="text-yellow-600 font-semibold">{summary.almost} almost</span>
                  <span>·</span>
                  <span className="text-red-500 font-semibold">{summary.no} no</span>
                  <span>·</span>
                  <span>{summary.unanswered} pending</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-2 bg-white/60 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${typeCfg.bar}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-slate-600 w-10 text-right">{pct}%</span>
              </div>

              {/* Milestone list */}
              <div className="bg-white/70 rounded-xl px-5">
                {summary.milestones.map(m => (
                  <MilestoneRow key={m.id} milestone={m} babyId={report.baby_id} onSaved={onSaved} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
