import type { ContentStep, RecipeAttributes } from "./models/content-item.js";

/**
 * Admin forms (e.g. the Foodvisor web-admin's tag inputs) store ingredients and steps as plain strings,
 * while the Content Factory API uses objects. Every reader normalises through these helpers.
 */
export function normalizeIngredients(raw: unknown): RecipeAttributes["ingredients"] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((entry) => {
      if (typeof entry === "string") return { name: entry.trim() };
      if (entry && typeof entry === "object" && typeof (entry as { name?: unknown }).name === "string") {
        const { name, quantity, unit } = entry as { name: string; quantity?: unknown; unit?: unknown };
        return {
          name: name.trim(),
          quantity: typeof quantity === "number" && Number.isFinite(quantity) ? quantity : undefined,
          unit: typeof unit === "string" && unit.trim() ? unit.trim() : undefined
        };
      }
      return { name: "" };
    })
    .filter((ingredient) => ingredient.name.length > 0);
}

export function normalizeSteps(raw: unknown): ContentStep[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((entry): ContentStep | null => {
      if (typeof entry === "string") return entry.trim() ? { text: entry.trim() } : null;
      if (entry && typeof entry === "object" && typeof (entry as ContentStep).text === "string") return entry as ContentStep;
      return null;
    })
    .filter((step): step is ContentStep => step !== null);
}
