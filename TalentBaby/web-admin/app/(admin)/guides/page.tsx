'use client';

import { useState } from 'react';
import { useFetch } from '@/hooks/useFetch';
import PageHeader from '@/components/PageHeader';
import Pagination from '@/components/Pagination';
import { usePagination } from '@/hooks/usePagination';

interface SleepTip {
  age_range: string;
  tip: string;
  category?: string;
}

interface SleepSchedule {
  age_range: string;
  total_sleep_hours: number;
  naps: number;
  nap_duration_minutes: number;
  night_sleep_hours: number;
}

interface FeedingTip {
  age_range: string;
  tip: string;
  category?: string;
}

interface FeedingAgeGuide {
  age_range: string;
  feeding_type: string;
  frequency: string;
  amount: string;
  notes?: string;
}

export default function GuidesPage() {
  const [tab, setTab] = useState<'sleep' | 'feeding'>('sleep');

  const { data: sleepTipsRaw, loading: loadingSleepTips } = useFetch<SleepTip[]>('/guides/sleep/tips');
  const sleepTips = sleepTipsRaw ?? [];
  const { data: sleepSchedulesRaw, loading: loadingSchedule } = useFetch<SleepSchedule[]>('/guides/sleep/schedule');
  const sleepSchedules = sleepSchedulesRaw ?? [];
  const { data: feedingTipsRaw, loading: loadingFeedingTips } = useFetch<FeedingTip[]>('/guides/feeding/tips');
  const feedingTips = feedingTipsRaw ?? [];
  const { data: ageGuideRaw, loading: loadingAgeGuide } = useFetch<FeedingAgeGuide[]>('/guides/feeding/age-guide');
  const ageGuide = ageGuideRaw ?? [];

  const { paged: pagedSleepSchedules, page: sleepSchedulesPage, totalPages: sleepSchedulesTotalPages, setPage: setSleepSchedulesPage } = usePagination(sleepSchedules);
  const { paged: pagedSleepTips, page: sleepTipsPage, totalPages: sleepTipsTotalPages, setPage: setSleepTipsPage } = usePagination(sleepTips);
  const { paged: pagedAgeGuide, page: ageGuidePage, totalPages: ageGuideTotalPages, setPage: setAgeGuidePage } = usePagination(ageGuide);
  const { paged: pagedFeedingTips, page: feedingTipsPage, totalPages: feedingTipsTotalPages, setPage: setFeedingTipsPage } = usePagination(feedingTips);

  return (
    <div className="p-8">
      <PageHeader
        title="Guides"
        subtitle="Sleep & Feeding education content"
      />

      {/* Tab switcher */}
      <div className="flex gap-2 mb-6">
        {(['sleep', 'feeding'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-xl text-sm font-medium transition-colors capitalize ${
              tab === t ? 'bg-purple-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {t === 'sleep' ? '🌙 Sleep Guide' : '🥕 Feeding Guide'}
          </button>
        ))}
      </div>

      {tab === 'sleep' && (
        <div className="space-y-6">
          {/* Sleep Schedule */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-800">Sleep Schedule by Age</h2>
              <p className="text-xs text-slate-400 mt-0.5">Recommended sleep amounts and nap patterns</p>
            </div>
            {loadingSchedule ? (
              <div className="p-8 text-center text-slate-400 text-sm">Loading…</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Age Range</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Sleep</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Naps</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Nap Duration</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Night Sleep</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedSleepSchedules.map((s, i) => (
                      <tr key={i} className="border-b border-slate-50 hover:bg-slate-50">
                        <td className="px-6 py-3 font-medium text-slate-800">{s.age_range}</td>
                        <td className="px-6 py-3 text-slate-600">{s.total_sleep_hours}h</td>
                        <td className="px-6 py-3 text-slate-600">{s.naps}x</td>
                        <td className="px-6 py-3 text-slate-600">{s.nap_duration_minutes}min</td>
                        <td className="px-6 py-3 text-slate-600">{s.night_sleep_hours}h</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <Pagination page={sleepSchedulesPage} totalPages={sleepSchedulesTotalPages} onPage={setSleepSchedulesPage} />
          </div>

          {/* Sleep Tips */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-800">Sleep Tips</h2>
              <p className="text-xs text-slate-400 mt-0.5">{sleepTips.length} tips across age groups</p>
            </div>
            {loadingSleepTips ? (
              <div className="p-8 text-center text-slate-400 text-sm">Loading…</div>
            ) : (
              <div className="divide-y divide-slate-50">
                {pagedSleepTips.map((tip, i) => (
                  <div key={i} className="px-6 py-4 flex gap-4">
                    <div className="flex-none">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-lg">{tip.age_range}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-700">{tip.tip}</p>
                      {tip.category && (
                        <span className="text-xs text-slate-400 mt-1 inline-block">{tip.category}</span>
                      )}
                    </div>
                  </div>
                ))}
                {sleepTips.length === 0 && (
                  <div className="p-8 text-center text-slate-400 text-sm">No sleep tips found</div>
                )}
              </div>
            )}
            <Pagination page={sleepTipsPage} totalPages={sleepTipsTotalPages} onPage={setSleepTipsPage} />
          </div>
        </div>
      )}

      {tab === 'feeding' && (
        <div className="space-y-6">
          {/* Age Guide */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-800">Feeding Age-by-Age Guide</h2>
              <p className="text-xs text-slate-400 mt-0.5">Feeding types and frequency by age</p>
            </div>
            {loadingAgeGuide ? (
              <div className="p-8 text-center text-slate-400 text-sm">Loading…</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Age Range</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Feeding Type</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Frequency</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Amount</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedAgeGuide.map((g, i) => (
                      <tr key={i} className="border-b border-slate-50 hover:bg-slate-50">
                        <td className="px-6 py-3 font-medium text-slate-800">{g.age_range}</td>
                        <td className="px-6 py-3 text-slate-600">{g.feeding_type}</td>
                        <td className="px-6 py-3 text-slate-600">{g.frequency}</td>
                        <td className="px-6 py-3 text-slate-600">{g.amount}</td>
                        <td className="px-6 py-3 text-slate-400 text-xs">{g.notes || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <Pagination page={ageGuidePage} totalPages={ageGuideTotalPages} onPage={setAgeGuidePage} />
          </div>

          {/* Feeding Tips */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-800">Feeding Tips</h2>
              <p className="text-xs text-slate-400 mt-0.5">{feedingTips.length} tips across age groups</p>
            </div>
            {loadingFeedingTips ? (
              <div className="p-8 text-center text-slate-400 text-sm">Loading…</div>
            ) : (
              <div className="divide-y divide-slate-50">
                {pagedFeedingTips.map((tip, i) => (
                  <div key={i} className="px-6 py-4 flex gap-4">
                    <div className="flex-none">
                      <span className="px-2 py-0.5 bg-green-50 text-green-700 text-xs font-medium rounded-lg">{tip.age_range}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-700">{tip.tip}</p>
                      {tip.category && (
                        <span className="text-xs text-slate-400 mt-1 inline-block">{tip.category}</span>
                      )}
                    </div>
                  </div>
                ))}
                {feedingTips.length === 0 && (
                  <div className="p-8 text-center text-slate-400 text-sm">No feeding tips found</div>
                )}
              </div>
            )}
            <Pagination page={feedingTipsPage} totalPages={feedingTipsTotalPages} onPage={setFeedingTipsPage} />
          </div>
        </div>
      )}
    </div>
  );
}
