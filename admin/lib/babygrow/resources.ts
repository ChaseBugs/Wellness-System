'use client';

import { useMemo } from 'react';
import { useFetch } from '@/hooks/useFetch';
import { ADMIN, ASSET_ORIGIN, api, assetUrl } from '@/lib/babygrow/api';
import type { Activity, Baby, MilestoneDefinition, MilestoneType, Recipe, RecipeIngredient, Story, User } from '@/types/babygrow';

/**
 * BabyGrow admin on the Wellness Platform. Every list comes from the Resource kit under
 * /apps/babygrow/admin/{resource} as `{ items, total, page, limit }`; these mappers turn its records into
 * the shapes the pages were written for, and turn page payloads back into kit bodies.
 */

export interface KitList<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

type Params = Record<string, string | number | boolean | undefined | null>;

function query(params: Params): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') search.set(key, String(value));
  }
  return search.toString();
}

/** A kit list mapped to page shapes. `map` must be a stable (module-level) function. */
export function useResourceList<R, T>(resource: string | null, params: Params, map: (record: R) => T) {
  const url = resource ? `${ADMIN}/${resource}?${query({ limit: 500, ...params })}` : null;
  const { data, loading, error, refetch } = useFetch<KitList<R>>(url);
  const items = useMemo(() => (data?.items ?? []).map(map), [data, map]);
  return { items, total: data?.total ?? 0, loading, error, refetch };
}

/** Every page of a list (the kit caps `limit` at 500). */
export async function fetchAll<R>(resource: string, params: Params = {}): Promise<R[]> {
  const items: R[] = [];
  for (let page = 1; ; page++) {
    const res = await api.get(`${ADMIN}/${resource}?${query({ ...params, limit: 500, page })}`);
    const list = res.data.data as KitList<R>;
    items.push(...list.items);
    if (list.items.length === 0 || items.length >= list.total) return items;
  }
}

export function saveResource(resource: string, id: string | undefined, body: Record<string, unknown>) {
  return id ? api.put(`${ADMIN}/${resource}/${id}`, body) : api.post(`${ADMIN}/${resource}`, body);
}

export function deleteResource(resource: string, id: string) {
  return api.delete(`${ADMIN}/${resource}/${id}`);
}

// ─── Content Factory records ────────────────────────────────────────────────

export interface ContentRecord {
  id: string;
  title: string;
  summary: string | null;
  body: string | null;
  category: string | null;
  tags: string[];
  durationMinutes: number | null;
  steps: Array<string | { text: string }>;
  media: Record<string, string | undefined>;
  attributes: Record<string, unknown>;
  isPremium: boolean;
  reviewStatus: string;
  expertReviewed: boolean;
  createdAt: string;
  ageMonthsMin: number | null;
  ageMonthsMax: number | null;
}

const str = (value: unknown) => (typeof value === 'string' && value ? value : undefined);
const num = (value: unknown) => (typeof value === 'number' && Number.isFinite(value) ? value : undefined);
const strings = (value: unknown) => (Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : []);
const stepTexts = (steps: ContentRecord['steps']) => steps.map((s) => (typeof s === 'string' ? s : s.text));

/** Pages show absolute image URLs; the platform stores paths such as /static/babygrow/images/... */
const toStoredUrl = (url: unknown) => {
  const value = str(url);
  return value && value.startsWith(ASSET_ORIGIN) ? value.slice(ASSET_ORIGIN.length) : value ?? null;
};

/** Drops undefined/null so merged attributes only hold real values. */
function compact(record: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(record).filter(([, v]) => v !== undefined && v !== null));
}

// ─── Activities ─────────────────────────────────────────────────────────────

export function activityFromKit(r: ContentRecord): Activity {
  const a = r.attributes;
  return {
    id: r.id,
    title: r.title,
    description: r.summary ?? undefined,
    category: r.category ?? '',
    sub_category: str(a.subCategory),
    month_min: r.ageMonthsMin ?? 0,
    month_max: r.ageMonthsMax ?? 0,
    age_range_min_months: r.ageMonthsMin ?? 0,
    age_range_max_months: r.ageMonthsMax ?? 0,
    duration_minutes: r.durationMinutes ?? undefined,
    difficulty_level: str(a.difficultyLevel),
    benefits: strings(a.benefits),
    frequency: str(a.frequency),
    materials_needed: strings(a.materialsNeeded),
    instructions: r.body ?? undefined,
    image_url: assetUrl(r.media.imageUrl) ?? undefined,
    video_url: assetUrl(r.media.videoUrl) ?? undefined,
    done_count: num(a.doneCount),
    is_premium: r.isPremium,
    doctor_verified: r.expertReviewed,
    created_at: r.createdAt,
    _record: r,
  };
}

/** Legacy activity payload (snake_case) -> kit body; keeps attributes the form does not edit. */
export function activityToKit(p: Record<string, unknown>, existing?: ContentRecord): Record<string, unknown> {
  const subCategory = str(p.sub_category);
  return {
    title: p.title,
    summary: p.description ?? null,
    body: p.instructions ?? null,
    category: p.category,
    durationMinutes: p.duration_minutes ?? null,
    isPremium: p.is_premium ?? false,
    expertReviewed: p.doctor_verified ?? false,
    tags: subCategory ? [subCategory] : [],
    media: compact({ ...existing?.media, imageUrl: toStoredUrl(p.image_url) }),
    attributes: compact({
      ...existing?.attributes,
      subCategory: subCategory ?? null,
      ageMonthsMin: p.month_min,
      ageMonthsMax: p.month_max,
      frequency: p.frequency ?? null,
      benefits: p.benefits,
      materialsNeeded: p.materials_needed,
    }),
  };
}

// ─── Milestone definitions ──────────────────────────────────────────────────

export interface MilestoneRecord {
  id: string;
  month: number;
  milestoneType: MilestoneType;
  title: string;
  description: string | null;
  question: string | null;
  relatedActivity: string | null;
  displayOrder: number;
  isPublished: boolean;
  expertReviewed: boolean;
  createdAt: string;
  updatedAt: string;
}

export function milestoneFromKit(r: MilestoneRecord): MilestoneDefinition {
  return {
    id: r.id,
    month: r.month,
    milestone_type: r.milestoneType,
    title: r.title,
    description: r.description ?? '',
    question: r.question ?? undefined,
    related_activity: r.relatedActivity ?? undefined,
    display_order: r.displayOrder,
    doctor_verified: r.expertReviewed,
    is_published: r.isPublished,
    created_at: r.createdAt,
    updated_at: r.updatedAt,
  };
}

export function milestoneToKit(p: Record<string, unknown>): Record<string, unknown> {
  return {
    month: p.month,
    milestoneType: p.milestone_type,
    title: p.title,
    description: p.description ?? null,
    question: p.question ?? null,
    relatedActivity: p.related_activity ?? null,
    displayOrder: p.display_order ?? 0,
    // Definitions cover one month; the age window follows it.
    ageMonthsMin: p.month,
    ageMonthsMax: p.month,
    isPublished: p.is_published ?? true,
    expertReviewed: p.doctor_verified ?? false,
  };
}

// ─── Recipes ────────────────────────────────────────────────────────────────

export function recipeFromKit(r: ContentRecord): Recipe {
  const a = r.attributes;
  const rawIngredients = Array.isArray(a.ingredients) ? a.ingredients : [];
  const rows: RecipeIngredient[] = rawIngredients.map((entry) =>
    typeof entry === 'string'
      ? { name: entry }
      : {
          name: String((entry as Record<string, unknown>).name ?? ''),
          amount: (entry as Record<string, unknown>).amount != null ? String((entry as Record<string, unknown>).amount) : undefined,
          unit: str((entry as Record<string, unknown>).unit),
          notes: str((entry as Record<string, unknown>).notes),
          image_url: assetUrl(str((entry as Record<string, unknown>).imageUrl)) ?? undefined,
        }
  );
  return {
    id: r.id,
    title: r.title,
    description: r.summary ?? undefined,
    target: (str(a.target) as Recipe['target']) ?? undefined,
    meal_slot: str(a.mealSlot),
    baby_age_group: str(a.ageGroup),
    age_range_min_months: r.ageMonthsMin ?? 0,
    age_range_max_months: r.ageMonthsMax ?? 0,
    recipe_type: str(a.recipeType) ?? r.category ?? '',
    ingredients: rows.map((row) => (row.amount ? `${row.name} (${[row.amount, row.unit].filter(Boolean).join(' ')})` : row.name)),
    recipe_ingredients: rows,
    instructions: stepTexts(r.steps),
    nutrition_info: (a.nutritionInfo as Recipe['nutrition_info']) ?? undefined,
    prep_time_minutes: num(a.prepTimeMinutes),
    cooking_time_minutes: num(a.cookingTimeMinutes),
    image_url: assetUrl(r.media.imageUrl) ?? undefined,
    doctor_verified: r.expertReviewed,
    created_at: r.createdAt,
    _record: r,
  };
}

/** Lines such as "Rice (2 tbsp)" become { name, amount }; existing rows keep their image and notes. */
function ingredientRows(lines: string[], existing?: ContentRecord): Array<Record<string, unknown>> {
  const previous = new Map<string, Record<string, unknown>>();
  const old = existing && Array.isArray(existing.attributes.ingredients) ? existing.attributes.ingredients : [];
  for (const entry of old) {
    if (entry && typeof entry === 'object') previous.set(String((entry as Record<string, unknown>).name).toLowerCase(), entry as Record<string, unknown>);
  }
  return lines.map((line) => {
    const match = line.match(/^(.+?)\s*\(([^)]+)\)\s*$/);
    const name = (match ? match[1] : line).trim();
    const before = previous.get(name.toLowerCase());
    return compact({ ...before, name, amount: match ? match[2].trim() : before?.amount, unit: match ? undefined : before?.unit });
  });
}

export function recipeToKit(p: Record<string, unknown>, existing?: ContentRecord): Record<string, unknown> {
  const prep = num(p.prep_time_minutes);
  const cooking = num(p.cooking_time_minutes);
  return {
    title: p.title,
    summary: p.description ?? null,
    category: p.recipe_type,
    tags: [str(p.target), str(p.meal_slot)].filter(Boolean),
    durationMinutes: prep === undefined && cooking === undefined ? null : (prep ?? 0) + (cooking ?? 0),
    steps: strings(p.instructions).map((text) => ({ text })),
    media: compact({ ...existing?.media, imageUrl: toStoredUrl(p.image_url) }),
    attributes: compact({
      ...existing?.attributes,
      ageMonthsMin: p.age_range_min_months,
      ageMonthsMax: p.age_range_max_months,
      recipeType: p.recipe_type,
      target: p.target,
      mealSlot: p.meal_slot ?? null,
      ageGroup: p.baby_age_group ?? null,
      prepTimeMinutes: prep ?? null,
      cookingTimeMinutes: cooking ?? null,
      nutritionInfo: p.nutrition_info ?? null,
      ingredients: ingredientRows(strings(p.ingredients), existing),
    }),
  };
}

// ─── Stories ────────────────────────────────────────────────────────────────

export function storyFromKit(r: ContentRecord): Story {
  return {
    id: r.id,
    title: r.title,
    content: r.body ?? undefined,
    audio_url: assetUrl(r.media.audioUrl) ?? undefined,
    image_url: assetUrl(r.media.imageUrl) ?? undefined,
    duration_minutes: r.durationMinutes ?? undefined,
    age_min_months: r.ageMonthsMin ?? undefined,
    age_max_months: r.ageMonthsMax ?? undefined,
    is_featured: r.attributes.isFeatured === true,
    category: r.category ?? undefined,
    author: str(r.attributes.author),
    created_at: r.createdAt,
  };
}

// ─── Guides ─────────────────────────────────────────────────────────────────

export interface GuideView {
  id: string;
  kind: 'sleep' | 'feeding';
  title: string;
  ageRange: string;
  overview: string;
  tips: string[];
  schedule: Record<string, unknown>;
}

export function guideFromKit(r: ContentRecord): GuideView {
  return {
    id: r.id,
    kind: r.category === 'feeding' ? 'feeding' : 'sleep',
    title: r.title,
    ageRange: r.ageMonthsMin != null ? `${r.ageMonthsMin}–${r.ageMonthsMax ?? '+'} mo` : '—',
    overview: r.body ?? r.summary ?? '',
    tips: stepTexts(r.steps),
    schedule: (r.attributes.scheduleRecommendations as Record<string, unknown>) ?? {},
  };
}

// ─── Children and caregivers ────────────────────────────────────────────────

export interface ChildRecord {
  id: string;
  name: string;
  birthDate: string;
  sex: 'female' | 'male' | 'unspecified';
  birthWeightKg: number | null;
  birthHeightCm: number | null;
  avatarUrl: string | null;
  ageMonths: number;
  ownerEmail: string;
  ownerName: string | null;
  caregiverCount: number;
  createdAt: string;
}

export function babyFromKit(r: ChildRecord): Baby {
  return {
    id: r.id,
    name: r.name,
    birth_date: r.birthDate,
    gender: r.sex === 'unspecified' ? undefined : r.sex,
    birth_weight_kg: r.birthWeightKg ?? undefined,
    birth_height_cm: r.birthHeightCm ?? undefined,
    profile_picture_url: assetUrl(r.avatarUrl) ?? undefined,
    owner_email: r.ownerEmail,
    owner_name: r.ownerName ?? undefined,
    caregiver_count: r.caregiverCount,
    created_at: r.createdAt,
  };
}

export interface ParentRecord {
  id: string;
  email: string;
  name: string | null;
  locale: string;
  phoneNumber: string | null;
  gender: string | null;
  relationToBaby: string | null;
  activeChildId: string | null;
  childCount: number;
  createdAt: string;
}

export function userFromKit(r: ParentRecord): User {
  return {
    id: r.id,
    email: r.email,
    full_name: r.name ?? '',
    phone_number: r.phoneNumber ?? undefined,
    gender: r.gender ?? undefined,
    relation_to_baby: r.relationToBaby ?? undefined,
    active_baby_id: r.activeChildId,
    child_count: r.childCount,
    created_at: r.createdAt,
  };
}
