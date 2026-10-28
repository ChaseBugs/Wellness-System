'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import PageHeader from '@/components/PageHeader';
import DataTable from '@/components/DataTable';

interface Food {
  id: number;
  name: string;
  name_ko: string;
  category: string;
  calories_per_100g: number;
  protein_per_100g: number;
  fat_per_100g: number;
  carbs_per_100g: number;
  fiber_per_100g: number;
  calcium_per_100g: number;
  iron_per_100g: number;
  is_baby_food: boolean;
  min_age_months: number | null;
  allergens: string[];
}

const CATEGORY_COLORS: Record<string, string> = {
  'grains': 'bg-amber-100 text-amber-700',
  'vegetables': 'bg-green-100 text-green-700',
  'fruits': 'bg-pink-100 text-pink-700',
  'meat': 'bg-red-100 text-red-600',
  'seafood': 'bg-blue-100 text-blue-700',
  'dairy': 'bg-sky-100 text-sky-700',
  'legumes': 'bg-lime-100 text-lime-700',
  'beverages': 'bg-cyan-100 text-cyan-700',
};

export default function FoodDbPage() {
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [babyOnly, setBabyOnly] = useState(false);
  const [selected, setSelected] = useState<Food | null>(null);

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (babyOnly) params.set('baby', 'true');
    api.get(`/calorie/foods?${params}`)
      .then(r => setFoods(r.data.data ?? []))
      .catch(() => setFoods([]))
      .finally(() => setLoading(false));
  }, [search, babyOnly]);

  const columns = [
    { key: 'id', label: 'ID', render: (f: Food) => <span className="text-slate-400 text-xs">#{f.id}</span> },
    {
      key: 'name_ko', label: 'Food Name',
      render: (f: Food) => (
        <button onClick={() => setSelected(f)} className="text-left">
          <div className="font-medium text-slate-800 text-sm hover:text-purple-600">{f.name_ko || f.name}</div>
          <div className="text-xs text-slate-400">{f.name}</div>
        </button>
      ),
    },
    {
      key: 'category', label: 'Category',
      render: (f: Food) => (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${CATEGORY_COLORS[f.category] ?? 'bg-slate-100 text-slate-600'}`}>
          {f.category}
        </span>
      ),
    },
    {
      key: 'calories_per_100g', label: 'kcal/100g',
      render: (f: Food) => <span className="font-bold text-orange-500">{Number(f.calories_per_100g).toFixed(0)}</span>,
    },
    {
      key: 'protein_per_100g', label: 'Protein',
      render: (f: Food) => <span className="text-blue-600 text-sm">{Number(f.protein_per_100g).toFixed(1)}g</span>,
    },
    {
      key: 'fat_per_100g', label: 'Fat',
      render: (f: Food) => <span className="text-yellow-600 text-sm">{Number(f.fat_per_100g).toFixed(1)}g</span>,
    },
    {
      key: 'carbs_per_100g', label: 'Carbs',
      render: (f: Food) => <span className="text-green-600 text-sm">{Number(f.carbs_per_100g).toFixed(1)}g</span>,
    },
    {
      key: 'is_baby_food', label: 'Baby Food',
      render: (f: Food) => f.is_baby_food
        ? <span className="text-xs text-purple-600 font-semibold">👶 {f.min_age_months}mo+</span>
        : <span className="text-xs text-slate-300">—</span>,
    },
    {
      key: 'allergens', label: 'Allergens',
      render: (f: Food) => f.allergens?.length
        ? <span className="text-xs text-red-500">{f.allergens.join(', ')}</span>
        : <span className="text-xs text-slate-300">None</span>,
    },
  ];

  return (
    <div className="p-8">
      <PageHeader title="Food Database" subtitle="Nutritional information used for calorie analysis" />

      {/* Detail panel */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="font-bold text-slate-800 text-lg">{selected.name_ko}</h2>
                <p className="text-slate-400 text-sm">{selected.name} · {selected.category}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-600 text-xl">×</button>
            </div>
            <div className="bg-orange-50 rounded-xl p-3 text-center mb-4">
              <div className="text-3xl font-bold text-orange-500">{Number(selected.calories_per_100g).toFixed(0)}</div>
              <div className="text-xs text-orange-400">kcal / 100g</div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm mb-4">
              {[
                { label: 'Protein', value: `${Number(selected.protein_per_100g).toFixed(1)}g`, color: 'text-blue-600' },
                { label: 'Fat',     value: `${Number(selected.fat_per_100g).toFixed(1)}g`,     color: 'text-yellow-600' },
                { label: 'Carbs',   value: `${Number(selected.carbs_per_100g).toFixed(1)}g`,   color: 'text-green-600' },
                { label: 'Fiber',   value: `${Number(selected.fiber_per_100g).toFixed(1)}g`,   color: 'text-lime-600' },
                { label: 'Calcium', value: `${Number(selected.calcium_per_100g).toFixed(0)}mg`, color: 'text-sky-600' },
                { label: 'Iron',    value: `${Number(selected.iron_per_100g).toFixed(1)}mg`,   color: 'text-rose-600' },
              ].map(n => (
                <div key={n.label} className="bg-slate-50 rounded-lg px-3 py-2 flex justify-between">
                  <span className="text-slate-500">{n.label}</span>
                  <span className={`font-semibold ${n.color}`}>{n.value}</span>
                </div>
              ))}
            </div>
            {selected.is_baby_food && (
              <div className="text-xs text-center text-purple-600 bg-purple-50 rounded-lg py-2">
                👶 Baby food — recommended from {selected.min_age_months} months
              </div>
            )}
            {selected.allergens?.length > 0 && (
              <div className="text-xs text-center text-red-500 bg-red-50 rounded-lg py-2 mt-2">
                ⚠️ Contains allergens: {selected.allergens.join(', ')}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
        <div className="p-5 border-b border-slate-100 flex gap-3 items-center">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search food name…"
            className="px-4 py-2 border border-slate-200 rounded-xl text-sm w-56 focus:outline-none focus:ring-2 focus:ring-purple-300"
          />
          <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
            <input type="checkbox" checked={babyOnly} onChange={e => setBabyOnly(e.target.checked)} className="accent-purple-600" />
            Baby foods only
          </label>
          <span className="ml-auto text-xs text-slate-400">{foods.length} items</span>
        </div>
        <DataTable columns={columns} data={foods} loading={loading} emptyText="No foods found." />
      </div>
    </div>
  );
}
