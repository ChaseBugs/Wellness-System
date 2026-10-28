'use client';

import { useMemo, useState } from 'react';
import { useFetch } from '@/hooks/useFetch';
import { api } from '@/lib/api';
import { NutritionCategory, NutritionFood } from '@/types/api';
import PageHeader from '@/components/PageHeader';
import Modal from '@/components/Modal';
import Pagination from '@/components/Pagination';
import { usePagination } from '@/hooks/usePagination';

const AGE_GROUP_OPTIONS = ['0-6', '7-11', '12-17', '18-24', '25-30', '31-36'];
const ALL_AGES = 'All';
const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api/v1').replace(/\/api\/v1\/?$/, '');

function imgSrc(url?: string | null) {
  if (!url) return null;
  return url.startsWith('http') ? url : `${API_BASE}${url}`;
}

// ─── Food Form Modal ──────────────────────────────────────────────────────────

interface FoodFormData {
  category_id: number;
  name: string;
  description: string;
  is_vegetarian: boolean;
  age_groups: string;
  image_url: string;
}

function FoodModal({
  categories,
  initial,
  onClose,
  onSaved,
}: {
  categories: NutritionCategory[];
  initial?: NutritionFood;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<FoodFormData>({
    category_id: initial?.category_id ?? (categories[0]?.id ?? 0),
    name: initial?.name ?? '',
    description: initial?.description ?? '',
    is_vegetarian: initial?.is_vegetarian ?? false,
    age_groups: initial?.age_groups ?? '',
    image_url: initial?.image_url ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (k: keyof FoodFormData, v: string | boolean | number) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const toggleAgeGroup = (ag: string) => {
    const current = form.age_groups ? form.age_groups.split(',').map((s) => s.trim()).filter(Boolean) : [];
    const next = current.includes(ag) ? current.filter((x) => x !== ag) : [...current, ag];
    set('age_groups', next.join(','));
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setError('Name is required.'); return; }
    if (!form.category_id) { setError('Category is required.'); return; }
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        description: form.description || null,
        image_url: form.image_url || null,
        age_groups: form.age_groups || null,
      };
      if (initial?.id) {
        await api.put(`/nutrition/foods/${initial.id}`, payload);
      } else {
        await api.post('/nutrition/foods', payload);
      }
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.error?.message ?? err?.response?.data?.error ?? 'Failed to save.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal onClose={onClose} maxWidth="max-w-lg">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-800">
          {initial ? 'Edit Food' : 'Add Food'}
        </h2>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">&times;</button>
      </div>

        <form onSubmit={submit} className="p-6 space-y-4">
          {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Category *</label>
            <select
              value={form.category_id}
              onChange={(e) => set('category_id', Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Name *</label>
            <input
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="e.g. Sweet Potato"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              rows={2}
              placeholder="Brief description…"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Age Groups</label>
            <div className="flex flex-wrap gap-2">
              {AGE_GROUP_OPTIONS.map((ag) => {
                const active = form.age_groups?.split(',').map((s) => s.trim()).includes(ag);
                return (
                  <button
                    key={ag}
                    type="button"
                    onClick={() => toggleAgeGroup(ag)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${
                      active
                        ? 'bg-purple-600 text-white border-purple-600'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {ag}m
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-slate-400 mt-1">Leave none selected = all ages</p>
          </div>

          <div className="flex items-center gap-3">
            <input
              id="veg"
              type="checkbox"
              checked={form.is_vegetarian}
              onChange={(e) => set('is_vegetarian', e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-400"
            />
            <label htmlFor="veg" className="text-sm text-slate-700">Vegetarian</label>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Image URL</label>
            <input
              value={form.image_url}
              onChange={(e) => set('image_url', e.target.value)}
              placeholder="https://…"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 text-sm font-medium text-white bg-purple-600 rounded-xl hover:bg-purple-700 disabled:opacity-50 transition-colors"
            >
              {saving ? 'Saving…' : initial ? 'Save Changes' : 'Add Food'}
            </button>
          </div>
        </form>
    </Modal>
  );
}

function FoodDetailModal({
  food,
  onClose,
  onEdit,
}: {
  food: NutritionFood;
  onClose: () => void;
  onEdit: () => void;
}) {
  const ages = food.age_groups?.split(',').map((ag) => ag.trim()).filter(Boolean) ?? [];
  const source = imgSrc(food.image_url);

  return (
    <Modal onClose={onClose} maxWidth="max-w-xl">
      <div className="px-6 py-4 border-b border-slate-100 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-base font-semibold text-slate-800">{food.name}</h2>
            {food.is_vegetarian && (
              <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-green-50 text-green-700">Veg</span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">{food.category_name ?? 'Nutrition food'}</p>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">&times;</button>
      </div>

      <div className="p-6 space-y-5">
        {source && (
          <img src={source} alt={food.name} className="w-full h-48 object-cover rounded-xl border border-slate-100" />
        )}

        <div>
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Description</h3>
          <p className="text-sm text-slate-700 leading-6">{food.description || 'No description yet.'}</p>
        </div>

        <div>
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Age Groups</h3>
          <div className="flex flex-wrap gap-2">
            {(ages.length ? ages : [ALL_AGES]).map((ag) => (
              <span key={ag} className="px-2 py-1 rounded-md text-xs bg-slate-100 text-slate-600">
                {ag === ALL_AGES ? 'All ages' : `${ag}m`}
              </span>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button onClick={onClose} className="px-4 py-2 text-sm text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">
            Close
          </button>
          <button onClick={onEdit} className="px-5 py-2 text-sm font-medium text-white bg-purple-600 rounded-xl hover:bg-purple-700 transition-colors">
            Edit Food
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function NutritionPage() {
  const { data: categoriesRaw, loading: catLoading, refetch: refetchCats } = useFetch<NutritionCategory[]>('/nutrition/categories');
  const categories: NutritionCategory[] = categoriesRaw ?? [];
  const [selectedCat, setSelectedCat] = useState<NutritionCategory | null>(null);
  const [ageFilter, setAgeFilter] = useState<string>(ALL_AGES);
  const [vegetarianOnly, setVegetarianOnly] = useState(false);
  const [search, setSearch] = useState('');

  const selectedId = selectedCat?.id ?? categories[0]?.id;
  const activeCat = selectedCat ?? categories[0] ?? null;
  const query = [
    ageFilter !== ALL_AGES ? `age_group=${encodeURIComponent(ageFilter)}` : '',
    vegetarianOnly ? 'vegetarian=true' : '',
  ].filter(Boolean).join('&');

  const { data: catData, loading: foodsLoading, refetch: refetchFoods } = useFetch<{ category: NutritionCategory; foods: NutritionFood[] }>(
    selectedId ? `/nutrition/categories/${selectedId}/foods${query ? `?${query}` : ''}` : null
  );

  const foods = catData?.foods ?? [];
  const filteredFoods = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return foods;
    return foods.filter((food) =>
      [food.name, food.description, food.age_groups].some((value) => value?.toLowerCase().includes(q))
    );
  }, [foods, search]);
  const { paged: pagedFoods, page: foodPage, totalPages: foodTotalPages, setPage: setFoodPage } = usePagination(filteredFoods);

  const [modal, setModal] = useState<{ open: boolean; food?: NutritionFood }>({ open: false });
  const [detail, setDetail] = useState<NutritionFood | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);

  async function handleDelete(food: NutritionFood) {
    if (!confirm(`Delete "${food.name}"?`)) return;
    setDeleting(food.id);
    try {
      await api.delete(`/nutrition/foods/${food.id}`);
      refetchFoods();
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="p-8">
      <PageHeader
        title="Nutrition & Foods"
        subtitle="Manage foods by nutrient category"
        action={
          <button
            onClick={() => setModal({ open: true })}
            className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-xl hover:bg-purple-700 transition-colors"
          >
            + Add Food
          </button>
        }
      />

      <div className="flex gap-6 mt-2">
        {/* Category sidebar */}
        <div className="w-52 shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Categories
            </div>
            {catLoading ? (
              <div className="p-4 text-sm text-slate-400">Loading…</div>
            ) : (
              <ul>
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <button
                      onClick={() => setSelectedCat(cat)}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                        (selectedCat?.id ?? categories[0]?.id) === cat.id
                          ? 'bg-purple-50 text-purple-700 font-medium'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {cat.name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Foods panel */}
        <div className="flex-1">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-800">
                {activeCat?.name ?? '—'}
              </h2>
              <p className="text-xs text-slate-500 mt-1 leading-5">{activeCat?.description ?? 'No benefit description yet.'}</p>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-3 items-center">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search foods..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                />
                <select
                  value={ageFilter}
                  onChange={(e) => setAgeFilter(e.target.value)}
                  className="px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                >
                  <option value={ALL_AGES}>All ages</option>
                  {AGE_GROUP_OPTIONS.map((ag) => <option key={ag} value={ag}>{ag}m</option>)}
                </select>
                <label className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={vegetarianOnly}
                    onChange={(e) => setVegetarianOnly(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-400"
                  />
                  Veg only
                </label>
              </div>
              <p className="text-xs text-slate-400 mt-3">{filteredFoods.length} foods</p>
            </div>

            {foodsLoading ? (
              <div className="flex items-center justify-center h-48 text-slate-400 text-sm">Loading…</div>
            ) : foods.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-slate-400 text-sm">No foods yet</div>
            ) : (
              <div className="divide-y divide-slate-50">
                {pagedFoods.map((food) => (
                  <div key={food.id} className="px-5 py-3 flex items-start gap-3 hover:bg-slate-50 transition-colors group">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-800">{food.name}</span>
                        {food.is_vegetarian && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-green-50 text-green-700">Veg</span>
                        )}
                      </div>
                      {food.description && (
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{food.description}</p>
                      )}
                      {food.age_groups && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {food.age_groups.split(',').map((ag) => (
                            <span key={ag.trim()} className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-500">
                              {ag.trim()}m
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button
                        onClick={() => setDetail(food)}
                        className="px-2.5 py-1 text-xs text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                      >
                        Details
                      </button>
                      <button
                        onClick={() => setModal({ open: true, food })}
                        className="px-2.5 py-1 text-xs text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(food)}
                        disabled={deleting === food.id}
                        className="px-2.5 py-1 text-xs text-red-600 bg-red-50 rounded-lg hover:bg-red-100 disabled:opacity-50 transition-colors"
                      >
                        {deleting === food.id ? '…' : 'Delete'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Pagination page={foodPage} totalPages={foodTotalPages} onPage={setFoodPage} />
          </div>
        </div>
      </div>

      {modal.open && (
        <FoodModal
          categories={categories}
          initial={modal.food}
          onClose={() => setModal({ open: false })}
          onSaved={() => { refetchFoods(); refetchCats(); }}
        />
      )}
      {detail && (
        <FoodDetailModal
          food={detail}
          onClose={() => setDetail(null)}
          onEdit={() => {
            setModal({ open: true, food: detail });
            setDetail(null);
          }}
        />
      )}
    </div>
  );
}
