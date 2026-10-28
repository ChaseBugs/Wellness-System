'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import PageHeader from '@/components/PageHeader';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Legend,
} from 'recharts';

interface Baby { id: number; name: string }

interface FoodDetail {
  id: number;
  food_name_ko: string;
  meal_type: string;
  meal_label: string;
  amount_g: number;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  fiber: number;
  calcium: number;
  iron: number;
  calories_pct_of_day: number;
}

interface MealBreakdown {
  meal_type: string;
  meal_label: string;
  total_calories: number;
  total_protein: number;
  total_fat: number;
  total_carbs: number;
  item_count: number;
}

interface Analysis {
  date: string;
  recommendation: { kcal_per_day: number; protein_g: number; fat_g: number; carbs_g: number; label: string } | null;
  summary: { total_calories: number; total_protein: number; total_fat: number; total_carbs: number; total_calcium: number; total_iron: number };
  intake_rate: { calories_pct: number; protein_pct: number; fat_pct: number; carbs_pct: number };
  meal_breakdown: MealBreakdown[];
  per_food_detail: FoodDetail[];
  alerts: string[];
}

interface WeeklyDay { date: string; total_calories: number; total_protein: number; total_fat: number; total_carbs: number }

export default function CalorieAnalysisPage() {
  const [babies, setBabies] = useState<Baby[]>([]);
  const [babyId, setBabyId] = useState<string>('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [weekly, setWeekly] = useState<WeeklyDay[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/babies').then(r => {
      const list: Baby[] = r.data.data ?? [];
      setBabies(list);
      if (list[0]) setBabyId(String(list[0].id));
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!babyId) return;
    setLoading(true);
    Promise.all([
      api.get(`/calorie/analysis/daily?baby_id=${babyId}&date=${date}`),
      api.get(`/calorie/analysis/weekly?baby_id=${babyId}&date=${date}`),
    ]).then(([aRes, wRes]) => {
      setAnalysis(aRes.data.data);
      setWeekly(wRes.data.data?.days ?? []);
    }).catch(() => {
      setAnalysis(null);
      setWeekly([]);
    }).finally(() => setLoading(false));
  }, [babyId, date]);

  const pctColor = (pct: number) => pct < 70 ? 'text-red-500' : pct > 130 ? 'text-orange-500' : 'text-green-600';
  const barColor = (pct: number) => pct < 70 ? '#ef4444' : pct > 130 ? '#f97316' : '#a855f7';

  return (
    <div className="p-8">
      <PageHeader title="Calorie Analysis" subtitle="Daily and weekly nutrition intake by baby" />

      {/* Controls */}
      <div className="flex gap-3 mb-6">
        <select
          value={babyId}
          onChange={e => setBabyId(e.target.value)}
          className="px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white"
        >
          {babies.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          {!babies.length && <option value="">No babies</option>}
        </select>
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white"
        />
      </div>

      {loading && <div className="text-center py-20 text-slate-400">Analyzing…</div>}

      {!loading && analysis && (
        <>
          {/* Alerts */}
          {analysis.alerts.length > 0 && (
            <div className="mb-6 space-y-2">
              {analysis.alerts.map((a, i) => (
                <div key={i} className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-600">
                  ⚠️ {a}
                </div>
              ))}
            </div>
          )}

          {/* Summary cards */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Calories', val: Number(analysis.summary.total_calories).toFixed(0), unit: 'kcal', rec: analysis.recommendation?.kcal_per_day, pct: analysis.intake_rate.calories_pct },
              { label: 'Protein',  val: Number(analysis.summary.total_protein).toFixed(1),  unit: 'g',    rec: analysis.recommendation?.protein_g,  pct: analysis.intake_rate.protein_pct },
              { label: 'Fat',      val: Number(analysis.summary.total_fat).toFixed(1),       unit: 'g',    rec: analysis.recommendation?.fat_g,      pct: analysis.intake_rate.fat_pct },
              { label: 'Carbs',    val: Number(analysis.summary.total_carbs).toFixed(1),     unit: 'g',    rec: analysis.recommendation?.carbs_g,    pct: analysis.intake_rate.carbs_pct },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                <div className="text-xs text-slate-400 mb-1">{s.label}</div>
                <div className="text-2xl font-bold text-slate-800">{s.val}<span className="text-sm font-normal text-slate-400 ml-1">{s.unit}</span></div>
                {s.rec && (
                  <>
                    <div className="text-xs text-slate-400 mt-1">Rec. {s.rec}{s.unit}</div>
                    <div className={`text-sm font-bold mt-1 ${pctColor(s.pct)}`}>{s.pct}%</div>
                    <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(s.pct, 100)}%`, backgroundColor: barColor(s.pct) }} />
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
            {/* Meal breakdown chart */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <h2 className="font-semibold text-slate-700 mb-4">Calories by Meal</h2>
              {analysis.meal_breakdown.length ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={analysis.meal_breakdown} barSize={32}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="meal_label" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                    <Tooltip formatter={(v: unknown) => [`${Number(v).toFixed(0)} kcal`]} />
                    <Bar dataKey="total_calories" name="Calories" fill="#a855f7" radius={[6,6,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-40 text-slate-300 text-sm">No intake records</div>
              )}
            </div>

            {/* Weekly trend */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <h2 className="font-semibold text-slate-700 mb-4">Weekly Calorie Trend</h2>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={weekly}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={d => d.slice(5)} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="total_calories" name="Calories" stroke="#a855f7" strokeWidth={2} dot={{ r: 3 }} />
                  {analysis.recommendation && (
                    <Line type="monotone" dataKey={() => analysis.recommendation!.kcal_per_day} name="Recommended" stroke="#e2e8f0" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Per-food detail table */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-700">Per-Meal Nutrition Analysis</h2>
              <p className="text-xs text-slate-400 mt-0.5">{date} · {analysis.per_food_detail.length} foods</p>
            </div>
            {analysis.per_food_detail.length ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      {['Meal', 'Food', 'Amount', 'Calories', 'Protein', 'Fat', 'Carbs', 'Calcium', 'Iron', 'Day %'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {analysis.per_food_detail.map(row => (
                      <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3">
                          <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full font-medium whitespace-nowrap">{row.meal_label}</span>
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-700 whitespace-nowrap">{row.food_name_ko}</td>
                        <td className="px-4 py-3 text-slate-500">{row.amount_g}g</td>
                        <td className="px-4 py-3 font-bold text-orange-500">{row.calories} kcal</td>
                        <td className="px-4 py-3 text-blue-600">{row.protein}g</td>
                        <td className="px-4 py-3 text-yellow-600">{row.fat}g</td>
                        <td className="px-4 py-3 text-green-600">{row.carbs}g</td>
                        <td className="px-4 py-3 text-sky-600">{row.calcium}mg</td>
                        <td className="px-4 py-3 text-rose-500">{row.iron}mg</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-purple-400 rounded-full" style={{ width: `${Math.min(row.calories_pct_of_day, 100)}%` }} />
                            </div>
                            <span className="text-xs text-slate-500">{row.calories_pct_of_day}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-50 border-t-2 border-slate-200">
                      <td colSpan={2} className="px-4 py-3 text-xs font-bold text-slate-600">Total</td>
                      <td className="px-4 py-3 text-xs text-slate-500">—</td>
                      <td className="px-4 py-3 font-bold text-orange-600">{Number(analysis.summary.total_calories).toFixed(0)} kcal</td>
                      <td className="px-4 py-3 font-bold text-blue-700">{Number(analysis.summary.total_protein).toFixed(1)}g</td>
                      <td className="px-4 py-3 font-bold text-yellow-700">{Number(analysis.summary.total_fat).toFixed(1)}g</td>
                      <td className="px-4 py-3 font-bold text-green-700">{Number(analysis.summary.total_carbs).toFixed(1)}g</td>
                      <td className="px-4 py-3 font-bold text-sky-700">{Number(analysis.summary.total_calcium).toFixed(0)}mg</td>
                      <td className="px-4 py-3 font-bold text-rose-600">{Number(analysis.summary.total_iron).toFixed(2)}mg</td>
                      <td className="px-4 py-3 text-xs font-bold text-purple-600">100%</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <div className="flex items-center justify-center h-32 text-slate-300 text-sm">
                No intake records for this date.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
