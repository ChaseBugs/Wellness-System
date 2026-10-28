'use client';

import { useState, useEffect } from 'react';
import { useFetch } from '@/hooks/useFetch';
import { api } from '@/lib/api';
import { Recipe, RecipeNutritionInfo } from '@/types/api';
import PageHeader from '@/components/PageHeader';
import Modal from '@/components/Modal';
import Pagination from '@/components/Pagination';
import { usePagination } from '@/hooks/usePagination';

// ─── Constants ────────────────────────────────────────────────────────────────

const BABY_AGE_GROUPS = ['0-6', '7-11', '12-17', '18-24', '25-30', '31-36'];
const BABY_MEAL_SLOTS = ['breakfast', 'lunch', 'dinner', 'snack'];
const MUM_MEAL_SLOTS  = ['early_morning', 'breakfast', 'mid_morning', 'lunch', 'evening', 'dinner', 'bedtime'];
const RECIPE_TYPES    = ['puree', 'finger_food', 'snack', 'meal', 'drink', 'other'];
const slotLabel = (s: string) => s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

// Route relative /images/... URLs through the Next.js same-origin proxy
// (defined in next.config.ts) to avoid cross-origin header issues from the backend.
function imgSrc(url?: string | null): string | null {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  if (url.startsWith('/images/')) return `/api-images${url.slice('/images'.length)}`;
  return url;
}

// Parse "Name (amount)" → { name, amount }
function parseIngredient(raw: string): { name: string; amount: string } {
  const m = raw.match(/^(.+?)\s*\(([^)]+)\)\s*$/);
  if (m) return { name: m[1].trim(), amount: m[2].trim() };
  return { name: raw.trim(), amount: '' };
}

function ni(info: RecipeNutritionInfo | undefined, key: keyof RecipeNutritionInfo): string[] {
  const v = info?.[key];
  return Array.isArray(v) ? (v as string[]) : [];
}

// Keyword → material image slug mapping
const INGREDIENT_IMG_MAP: [RegExp, string][] = [
  [/almond\s*butter/i,                   'almond-butter'],
  [/almond/i,                            'almonds'],
  [/avocado/i,                           'avocado'],
  [/breast[\s-]?milk|breastmilk|formula/i, 'breast-milk-formula'],
  [/egg\s*yolk/i,                        'egg-yolk'],
  [/eggs?/i,                             'egg'],
  [/mango/i,                             'mango'],
  [/kiwi/i,                              'kiwi'],
  [/orange/i,                            'orange'],
  [/papaya/i,                            'papaya'],
  [/pumpkin/i,                           'pumpkin'],
  [/sweet\s*potato/i,                    'other-starchy-vegetables'],
  [/potato|mash/i,                       'mashed-potato'],
  [/carrot/i,                            'carrot'],
  [/tomato/i,                            'tomato'],
  [/quinoa/i,                            'quinoa'],
  [/salmon/i,                            'salmon'],
  [/fish|cod|tilapia|halibut/i,          'fish'],
  [/chicken/i,                           'chicken'],
  [/liver/i,                             'liver'],
  [/lentil/i,                            'lentils'],
  [/edamame/i,                           'edamame'],
  [/bean|chickpea/i,                     'beans'],
  [/soy/i,                               'soybean'],
  [/walnut/i,                            'walnuts'],
  [/milk/i,                              'milk'],
  [/cheese/i,                            'cheese'],
  [/yogh?urt/i,                          'dairy-products'],
  [/dairy|butter|cream/i,                'dairy-products'],
  [/cereal|oat|waffle|grain|flour|bread|toast|rice|pasta/i, 'cereals'],
  [/seed|sesame|flax|chia/i,             'seeds-like-sesame'],
  [/oil/i,                               'vegetable-oils'],
  [/spinach|kale|lettuce|greens?/i,      'green-leafy-vegetables'],
  [/broccoli|zucchini|cabbage|vegetable|veggie/i, 'fruits-and-vegetables'],
  [/fruit|berry|berries|peach|pear|plum|apple/i, 'fruits'],
];

function ingredientImg(name: string): string | null {
  for (const [pattern, slug] of INGREDIENT_IMG_MAP) {
    if (pattern.test(name)) return `/api-images/nutrition/materials/${slug}.png`;
  }
  return null;
}

// ─── Recipe Form Modal ────────────────────────────────────────────────────────

interface RecipeFormData {
  title: string;
  description: string;
  target: 'baby' | 'mum';
  meal_slot: string;
  baby_age_group: string;
  age_range_min_months: string;
  age_range_max_months: string;
  recipe_type: string;
  ingredients: string;   // newline-separated
  instructions: string;  // newline-separated
  prep_time_minutes: string;
  cooking_time_minutes: string;
  image_url: string;
  nutrition_info: string;
}

function RecipeModal({
  initial,
  defaultTarget,
  defaultAgeGroup,
  defaultSlot,
  onClose,
  onSaved,
}: {
  initial?: Recipe;
  defaultTarget: 'baby' | 'mum';
  defaultAgeGroup?: string;
  defaultSlot?: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<RecipeFormData>({
    title: initial?.title ?? '',
    description: initial?.description ?? '',
    target: initial?.target ?? defaultTarget,
    meal_slot: initial?.meal_slot ?? defaultSlot ?? (defaultTarget === 'baby' ? 'breakfast' : 'early_morning'),
    baby_age_group: initial?.baby_age_group ?? defaultAgeGroup ?? '7-11',
    age_range_min_months: String(initial?.age_range_min_months ?? 7),
    age_range_max_months: String(initial?.age_range_max_months ?? 11),
    recipe_type: initial?.recipe_type ?? 'puree',
    ingredients: Array.isArray(initial?.ingredients) ? initial.ingredients.join('\n') : '',
    instructions: Array.isArray(initial?.instructions) ? initial.instructions.join('\n') : '',
    prep_time_minutes: String(initial?.prep_time_minutes ?? ''),
    cooking_time_minutes: String(initial?.cooking_time_minutes ?? ''),
    image_url: initial?.image_url ?? '',
    nutrition_info: initial?.nutrition_info ? JSON.stringify(initial.nutrition_info, null, 2) : '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (k: keyof RecipeFormData, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const mealSlots = form.target === 'baby' ? BABY_MEAL_SLOTS : MUM_MEAL_SLOTS;

  async function submit(e: React.SyntheticEvent) {
    e.preventDefault();
    if (!form.title.trim()) { setError('Title is required.'); return; }
    let nutritionInfo: Record<string, unknown> | null = null;
    if (form.nutrition_info.trim()) {
      try {
        nutritionInfo = JSON.parse(form.nutrition_info);
      } catch {
        setError('Nutrition info must be valid JSON.');
        return;
      }
    }
    setSaving(true);
    setError('');
    try {
      const payload: Record<string, unknown> = {
        title: form.title.trim(),
        description: form.description || null,
        target: form.target,
        meal_slot: form.meal_slot || null,
        baby_age_group: form.target === 'baby' ? (form.baby_age_group || null) : null,
        age_range_min_months: Number(form.age_range_min_months) || 0,
        age_range_max_months: Number(form.age_range_max_months) || 36,
        recipe_type: form.recipe_type,
        ingredients: form.ingredients.split('\n').map((s) => s.trim()).filter(Boolean),
        instructions: form.instructions.split('\n').map((s) => s.trim()).filter(Boolean),
        prep_time_minutes: form.prep_time_minutes ? Number(form.prep_time_minutes) : null,
        cooking_time_minutes: form.cooking_time_minutes ? Number(form.cooking_time_minutes) : null,
        image_url: form.image_url || null,
        nutrition_info: nutritionInfo,
        language: 'en',
      };
      if (initial?.id) {
        await api.put(`/recipes/${initial.id}`, payload);
      } else {
        await api.post('/recipes', payload);
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
    <Modal onClose={onClose}>
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
        <h2 className="text-base font-semibold text-slate-800">
          {initial ? 'Edit Recipe' : 'Add Recipe'}
        </h2>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">&times;</button>
      </div>

        <form onSubmit={submit} className="p-6 space-y-4">
          {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

          {/* Target + meal slot row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">For *</label>
              <select
                value={form.target}
                onChange={(e) => {
                  const t = e.target.value as 'baby' | 'mum';
                  const slots = t === 'baby' ? BABY_MEAL_SLOTS : MUM_MEAL_SLOTS;
                  setForm((p) => ({ ...p, target: t, meal_slot: slots[0] }));
                }}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
              >
                <option value="baby">Baby</option>
                <option value="mum">Mum</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Meal Slot *</label>
              <select
                value={form.meal_slot}
                onChange={(e) => set('meal_slot', e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
              >
                {mealSlots.map((s) => (
                  <option key={s} value={s}>{slotLabel(s)}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Baby age group (only when target=baby) */}
          {form.target === 'baby' && (
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Age Group</label>
              <div className="flex flex-wrap gap-2">
                {BABY_AGE_GROUPS.map((ag) => (
                  <button
                    key={ag}
                    type="button"
                    onClick={() => {
                      const [min, max] = ag.split('-').map(Number);
                      setForm((p) => ({ ...p, baby_age_group: ag, age_range_min_months: String(min), age_range_max_months: String(max) }));
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${
                      form.baby_age_group === ag
                        ? 'bg-purple-600 text-white border-purple-600'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {ag}m
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Title *</label>
            <input
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="Recipe name…"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 resize-none"
            />
          </div>

          {/* Type + times row */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Type</label>
              <select
                value={form.recipe_type}
                onChange={(e) => set('recipe_type', e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
              >
                {RECIPE_TYPES.map((t) => <option key={t} value={t}>{slotLabel(t)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Prep (min)</label>
              <input
                type="number" min={0}
                value={form.prep_time_minutes}
                onChange={(e) => set('prep_time_minutes', e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Cook (min)</label>
              <input
                type="number" min={0}
                value={form.cooking_time_minutes}
                onChange={(e) => set('cooking_time_minutes', e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Ingredients (one per line)</label>
            <textarea
              value={form.ingredients}
              onChange={(e) => set('ingredients', e.target.value)}
              rows={4}
              placeholder={"100g sweet potato\n50ml breast milk"}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-300 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Instructions (one per line)</label>
            <textarea
              value={form.instructions}
              onChange={(e) => set('instructions', e.target.value)}
              rows={4}
              placeholder={"Peel and chop the potato\nSteam for 15 minutes"}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-300 resize-none"
            />
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

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Nutrition Info JSON</label>
            <textarea
              value={form.nutrition_info}
              onChange={(e) => set('nutrition_info', e.target.value)}
              rows={6}
              placeholder={'{\n  "nutrients": ["Iron", "Vitamin C"],\n  "safety_notes": []\n}'}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-300 resize-none"
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
              {saving ? 'Saving…' : initial ? 'Save Changes' : 'Add Recipe'}
            </button>
          </div>
        </form>
    </Modal>
  );
}

// ─── Recipe Detail Modal ──────────────────────────────────────────────────────

function IngredientCard({ raw }: { raw: string }) {
  const { name, amount } = parseIngredient(raw);
  const [imgFailed, setImgFailed] = useState(false);
  const src = ingredientImg(name);
  return (
    <div className="flex flex-col items-center gap-1.5 min-w-[80px] max-w-[96px]">
      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 overflow-hidden">
        {src && !imgFailed ? (
          <img
            src={src}
            alt={name}
            onError={() => setImgFailed(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 2a9 9 0 0 1 9 9c0 4.17-2.84 7.67-6.71 8.66L12 22l-2.29-2.34C5.84 18.67 3 15.17 3 11a9 9 0 0 1 9-9z"/>
            <circle cx="12" cy="11" r="3"/>
          </svg>
        )}
      </div>
      <p className="text-[11px] font-medium text-slate-700 text-center leading-tight line-clamp-2">{name}</p>
      {amount && <p className="text-[10px] text-teal-600 font-semibold text-center">({amount})</p>}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-sm font-bold text-slate-800 mb-3">{children}</h3>
  );
}

function NumberedList({ items }: { items: string[] }) {
  if (!items.length) return <p className="text-sm text-slate-400">None listed.</p>;
  return (
    <ol className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="text-sm text-slate-700 leading-5 flex gap-2.5">
          <span className="shrink-0 w-5 h-5 rounded-full bg-purple-100 text-purple-700 text-[10px] font-bold flex items-center justify-center mt-0.5">{i + 1}</span>
          <span>{item}</span>
        </li>
      ))}
    </ol>
  );
}

function RecipeDetailModal({
  recipe,
  onClose,
  onEdit,
}: {
  recipe: Recipe;
  onClose: () => void;
  onEdit: () => void;
}) {
  const [imgFailed, setImgFailed] = useState(false);
  useEffect(() => { setImgFailed(false); }, [recipe.id]);

  const info       = recipe.nutrition_info;
  const nutrients  = ni(info, 'nutrients');
  const steps      = ni(info, 'steps');
  const instrGuide = ni(info, 'instructions');
  const genNotes   = ni(info, 'general_notes');
  const isVerified = info?.doctor_verified === true;
  const isUISource = info?.source === 'ui/babyG/nutritions';
  const imageSource = imgSrc(recipe.image_url);

  const ingredients = recipe.ingredients ?? [];
  const totalTime   = (recipe.prep_time_minutes ?? 0) + (recipe.cooking_time_minutes ?? 0);

  return (
    <Modal onClose={onClose} maxWidth="max-w-2xl">
      {/* Sticky header */}
      <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between gap-3 sticky top-0 bg-white z-10">
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <span className="text-sm font-semibold text-slate-800 truncate">{recipe.title}</span>
          <span className="shrink-0 px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-500 capitalize">{recipe.target ?? 'baby'}</span>
          <span className="shrink-0 px-2 py-0.5 rounded-md text-[10px] font-medium bg-purple-50 text-purple-600">
            {recipe.baby_age_group ? `${recipe.baby_age_group}m` : `${recipe.age_range_min_months}–${recipe.age_range_max_months}m`}
          </span>
          {isVerified && (
            <span className="shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-green-50 text-green-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              Doctor Verified
            </span>
          )}
          {!isVerified && (
            <span className="shrink-0 px-2 py-0.5 rounded-md text-[10px] font-medium bg-amber-50 text-amber-600">Pending Review</span>
          )}
          {isUISource && (
            <span className="shrink-0 px-2 py-0.5 rounded-md text-[10px] font-medium bg-blue-50 text-blue-600">UI Seed</span>
          )}
        </div>
        <button onClick={onClose} className="shrink-0 text-slate-400 hover:text-slate-600 text-xl leading-none">&times;</button>
      </div>

      <div className="divide-y divide-slate-50">

        {/* ── Image ─────────────────────────────────────────────────── */}
        {imageSource && !imgFailed && (
          <div className="bg-slate-50 flex items-center justify-center" style={{ minHeight: 220 }}>
            <img
              src={imageSource}
              alt={recipe.title}
              onError={() => setImgFailed(true)}
              className="max-w-full max-h-72 object-contain"
            />
          </div>
        )}

        {/* ── Meta bar ──────────────────────────────────────────────── */}
        <div className="px-5 py-3 flex items-center gap-5 text-xs text-slate-500">
          {totalTime > 0 && (
            <span className="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              {totalTime} min
            </span>
          )}
          <span className="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 2h18l-2 7H5L3 2z"/><path d="M5 9l1 11h12l1-11"/></svg>
            {ingredients.length} ingredients
          </span>
          <span className="capitalize">{slotLabel(recipe.meal_slot ?? '')} · {slotLabel(recipe.recipe_type ?? '')}</span>
        </div>

        {/* ── Title + description ────────────────────────────────────── */}
        <div className="px-5 py-4">
          <h2 className="text-lg font-bold text-purple-700 leading-snug mb-1">{recipe.title}</h2>
          {recipe.description && (
            <p className="text-sm text-slate-600 leading-6">{recipe.description}</p>
          )}
        </div>

        {/* ── Ingredients ───────────────────────────────────────────── */}
        {ingredients.length > 0 && (
          <div className="px-5 py-4">
            <SectionTitle>Ingredients</SectionTitle>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {ingredients.map((raw, i) => (
                <IngredientCard key={i} raw={raw} />
              ))}
            </div>
          </div>
        )}

        {/* ── Nutrients ─────────────────────────────────────────────── */}
        {nutrients.length > 0 && (
          <div className="px-5 py-4">
            <SectionTitle>Nutrients</SectionTitle>
            <p className="text-sm text-slate-700 leading-6">
              {nutrients.join(', ')}
            </p>
          </div>
        )}

        {/* ── Steps ─────────────────────────────────────────────────── */}
        {steps.length > 0 && (
          <div className="px-5 py-4">
            <SectionTitle>Steps</SectionTitle>
            <NumberedList items={steps} />
          </div>
        )}

        {/* ── Instructions (serving/safety guidelines) ──────────────── */}
        {instrGuide.length > 0 && (
          <div className="px-5 py-4">
            <SectionTitle>Instructions</SectionTitle>
            <NumberedList items={instrGuide} />
          </div>
        )}

        {/* ── General Notes ─────────────────────────────────────────── */}
        {genNotes.length > 0 && (
          <div className="px-5 py-4">
            <SectionTitle>General Notes</SectionTitle>
            <NumberedList items={genNotes} />
          </div>
        )}

        {/* ── Actions ───────────────────────────────────────────────── */}
        <div className="px-5 py-4 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">
            Close
          </button>
          <button onClick={onEdit} className="px-5 py-2 text-sm font-medium text-white bg-purple-600 rounded-xl hover:bg-purple-700 transition-colors">
            Edit Recipe
          </button>
        </div>
      </div>
    </Modal>
  );
}

function RecipeThumbnail({ url, title }: { url?: string | null; title: string }) {
  const [failed, setFailed] = useState(false);
  const src = imgSrc(url);
  if (!src || failed) {
    return (
      <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-slate-300 shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
        </svg>
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={title}
      onError={() => setFailed(true)}
      className="w-12 h-12 rounded-lg object-cover border border-slate-100 shrink-0"
    />
  );
}

function RecipeList({
  recipes,
  loading,
  search,
  onView,
  onEdit,
  onDelete,
  deleting,
}: {
  recipes: Recipe[];
  loading: boolean;
  search: string;
  onView: (r: Recipe) => void;
  onEdit: (r: Recipe) => void;
  onDelete: (r: Recipe) => void;
  deleting: number | null;
}) {
  if (loading) return <div className="flex items-center justify-center h-48 text-slate-400 text-sm">Loading…</div>;

  const q = search.trim().toLowerCase();
  const filtered = q
    ? recipes.filter((r) => r.title.toLowerCase().includes(q) || r.description?.toLowerCase().includes(q))
    : recipes;

  if (!filtered.length) {
    return (
      <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
        {q ? `No recipes match "${search}"` : 'No recipes yet'}
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-50">
      {filtered.map((r) => (
        <div
          key={r.id}
          className="px-5 py-3 flex items-center gap-3 hover:bg-slate-50 transition-colors cursor-pointer"
          onClick={() => onView(r)}
        >
          <RecipeThumbnail url={r.image_url} title={r.title} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-slate-800">{r.title}</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-500 capitalize">
                {r.recipe_type?.replace('_', ' ')}
              </span>
              {(r.prep_time_minutes || r.cooking_time_minutes) && (
                <span className="text-[10px] text-slate-400">
                  {(r.prep_time_minutes ?? 0) + (r.cooking_time_minutes ?? 0)} min
                </span>
              )}
            </div>
            {r.description && (
              <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{r.description}</p>
            )}
            {Array.isArray(r.ingredients) && r.ingredients.length > 0 && (
              <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                {r.ingredients.slice(0, 4).map((raw) => parseIngredient(raw).name).join(' · ')}
                {r.ingredients.length > 4 ? ` +${r.ingredients.length - 4} more` : ''}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => onView(r)}
              className="px-2.5 py-1 text-xs text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
            >
              Details
            </button>
            <button
              onClick={() => onEdit(r)}
              className="px-2.5 py-1 text-xs text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(r)}
              disabled={deleting === r.id}
              className="px-2.5 py-1 text-xs text-red-600 bg-red-50 rounded-lg hover:bg-red-100 disabled:opacity-50 transition-colors"
            >
              {deleting === r.id ? '…' : 'Delete'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Baby Tab ─────────────────────────────────────────────────────────────────

function BabyTab() {
  const [ageGroup, setAgeGroup] = useState('7-11');
  const [mealSlot, setMealSlot] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<{ open: boolean; recipe?: Recipe }>({ open: false });
  const [detail, setDetail] = useState<Recipe | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);

  const url = `/recipes/baby/age-group/${ageGroup}${mealSlot !== 'All' ? `?meal_slot=${mealSlot}` : ''}`;
  const { data: recipesRaw, loading, refetch } = useFetch<Recipe[]>(url);
  const recipes = recipesRaw ?? [];
  const { paged, page, totalPages, setPage } = usePagination(recipes);

  async function handleDelete(r: Recipe) {
    if (!confirm(`Delete "${r.title}"?`)) return;
    setDeleting(r.id);
    try { await api.delete(`/recipes/${r.id}`); refetch(); } finally { setDeleting(null); }
  }

  return (
    <div>
      {/* Search bar */}
      <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2">
        <div className="relative flex-1 max-w-xs">
          <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search recipes…"
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
          />
        </div>
      </div>

      {/* Age group row */}
      <div className="px-5 py-3 border-b border-slate-100 flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-slate-500 mr-1">Age Group:</span>
        {BABY_AGE_GROUPS.map((ag) => (
          <button
            key={ag}
            onClick={() => setAgeGroup(ag)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              ageGroup === ag ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {ag}m
          </button>
        ))}
      </div>

      {/* Meal slot row */}
      <div className="px-5 py-2.5 border-b border-slate-100 flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-slate-500 mr-1">Meal Slot:</span>
        {['All', ...BABY_MEAL_SLOTS].map((s) => (
          <button
            key={s}
            onClick={() => setMealSlot(s)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors capitalize ${
              mealSlot === s ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {s}
          </button>
        ))}
        <div className="ml-auto">
          <button
            onClick={() => setModal({ open: true })}
            className="px-3 py-1.5 text-xs font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
          >
            + Add Recipe
          </button>
        </div>
      </div>

      <RecipeList
        recipes={paged}
        loading={loading}
        search={search}
        onView={setDetail}
        onEdit={(r) => setModal({ open: true, recipe: r })}
        onDelete={handleDelete}
        deleting={deleting}
      />
      <Pagination page={page} totalPages={totalPages} onPage={setPage} />

      <div className="px-5 py-2.5 text-xs text-slate-400 border-t border-slate-50">
        {recipes.length} recipes · age group {ageGroup}m{mealSlot !== 'All' ? ` · ${mealSlot}` : ''}
      </div>

      {modal.open && (
        <RecipeModal
          initial={modal.recipe}
          defaultTarget="baby"
          defaultAgeGroup={ageGroup}
          defaultSlot={mealSlot !== 'All' ? mealSlot : 'breakfast'}
          onClose={() => setModal({ open: false })}
          onSaved={refetch}
        />
      )}
      {detail && (
        <RecipeDetailModal
          recipe={detail}
          onClose={() => setDetail(null)}
          onEdit={() => {
            setModal({ open: true, recipe: detail });
            setDetail(null);
          }}
        />
      )}
    </div>
  );
}

// ─── Mum Tab ──────────────────────────────────────────────────────────────────

function MumTab() {
  const [mealSlot, setMealSlot] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<{ open: boolean; recipe?: Recipe }>({ open: false });
  const [detail, setDetail] = useState<Recipe | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);

  const url = mealSlot === 'All' ? '/recipes/mum' : `/recipes/mum/slot/${mealSlot}`;
  const { data: recipesRaw, loading, refetch } = useFetch<Recipe[]>(url);
  const recipes = recipesRaw ?? [];
  const { paged, page, totalPages, setPage } = usePagination(recipes);

  async function handleDelete(r: Recipe) {
    if (!confirm(`Delete "${r.title}"?`)) return;
    setDeleting(r.id);
    try { await api.delete(`/recipes/${r.id}`); refetch(); } finally { setDeleting(null); }
  }

  return (
    <div>
      {/* Search bar */}
      <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2">
        <div className="relative flex-1 max-w-xs">
          <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search recipes…"
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
          />
        </div>
      </div>

      {/* Meal slot row */}
      <div className="px-5 py-3 border-b border-slate-100 flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-slate-500 mr-1">Meal Slot:</span>
        {['All', ...MUM_MEAL_SLOTS].map((s) => (
          <button
            key={s}
            onClick={() => setMealSlot(s)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${
              mealSlot === s ? 'bg-pink-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {slotLabel(s)}
          </button>
        ))}
        <div className="ml-auto">
          <button
            onClick={() => setModal({ open: true })}
            className="px-3 py-1.5 text-xs font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
          >
            + Add Recipe
          </button>
        </div>
      </div>

      <RecipeList
        recipes={paged}
        loading={loading}
        search={search}
        onView={setDetail}
        onEdit={(r) => setModal({ open: true, recipe: r })}
        onDelete={handleDelete}
        deleting={deleting}
      />
      <Pagination page={page} totalPages={totalPages} onPage={setPage} />

      <div className="px-5 py-2.5 text-xs text-slate-400 border-t border-slate-50">
        {recipes.length} recipes{mealSlot !== 'All' ? ` · ${slotLabel(mealSlot)}` : ''}
      </div>

      {modal.open && (
        <RecipeModal
          initial={modal.recipe}
          defaultTarget="mum"
          defaultSlot={mealSlot !== 'All' ? mealSlot : 'early_morning'}
          onClose={() => setModal({ open: false })}
          onSaved={refetch}
        />
      )}
      {detail && (
        <RecipeDetailModal
          recipe={detail}
          onClose={() => setDetail(null)}
          onEdit={() => {
            setModal({ open: true, recipe: detail });
            setDetail(null);
          }}
        />
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function RecipesPage() {
  const [tab, setTab] = useState<'baby' | 'mum'>('baby');

  return (
    <div className="p-8">
      <PageHeader title="Recipes" subtitle="Manage baby and mum meal plans" />

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
        {/* Tab bar */}
        <div className="px-5 pt-4 flex gap-1 border-b border-slate-100">
          {(['baby', 'mum'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2.5 rounded-t-lg text-sm font-medium transition-colors capitalize border-b-2 -mb-px ${
                tab === t
                  ? 'text-purple-700 border-purple-600 bg-purple-50/50'
                  : 'text-slate-500 border-transparent hover:text-slate-700'
              }`}
            >
              {t === 'baby' ? '👶 Baby' : '👩 Mum'}
            </button>
          ))}
        </div>

        {tab === 'baby' ? <BabyTab /> : <MumTab />}
      </div>
    </div>
  );
}
