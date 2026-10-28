# Foods Table — Modern Restyle + Vitamin Column

**Date:** 2026-05-07
**Scope:** sub-project 1 of 4 (table UI only — DB updates, validation, NK language pass deferred to separate specs)
**Files touched:** `web-admin/components/FoodsManager.tsx`, `web-admin/app/globals.css`
**Out of scope:** column set changes (other than the new vitamin column), modal/edit form, behavior, API, label translations.

## Goal

Make the `/foods` admin table look modern and simple while keeping all current information, and add a new compact vitamin column that surfaces only the vitamins each food actually contains.

## Visual Changes (existing 10 columns)

Apply to `globals.css`. No JSX changes for these unless noted.

1. **Looser rows.** Cell padding `9px 10px` → `14px 16px`. Table feels less cramped.
2. **Type refresh.** Body cells 13px (was 12.5px), header 11.5px. Numeric cells get `font-variant-numeric: tabular-nums` so digits align.
3. **Modern category pills.** Replace outlined `.cat-badge` rectangle with a tinted-background pill: `background: <color>14` (8% opacity), `color: <color>` solid, plus a 6px colored dot before the label.
4. **Ghost icon actions.** `.row-btns button` becomes borderless. On hover, edit gets a green tint (`--accent-soft`), delete gets a red tint (`#fef2f2`/`--danger`). Removes the boxed-button noise.
5. **Subtler row dividers.** Bottom border `var(--line)` → `rgba(15, 23, 42, 0.05)`. Hover background stays.
6. **Refined macro bar.** Add a 2px gap between P/F/C segments using `gap: 2px` on `.macro-bar`. Remove the `P 1.0g F 1.0g C 1.0g` text labels above the bar (the toolbar legend already explains; numbers still appear on hover via `title` attribute, which already exists).
7. **Calorie cell.** Drop the two-weight split. `220` (single weight, tabular-nums) followed by tiny gray `kcal`.
8. **Allergen chips toned down.** `#fef3c7 / #92400e` → `#fff7ed / #b45309` (less aggressive when 3+ chips appear).
9. **Status column dedup.** The verified shield is already on the name cell. Replace the `.status-badge` chip in the status column with plain muted text (`verification` / `Not verified`) — the shield stays as the visual anchor.
10. **Sticky header polish.** Header background `rgba(248, 250, 252, 0.92)` + `backdrop-filter: blur(8px)` for subtle translucency on scroll.
11. **Toolbar polish.** Drop the green focus ring on `.search-field` in favor of a solid border darken; tighten macro legend gaps.
12. **CSS dedup.** `globals.css` currently defines the entire FoodsManager block twice (lines ~684–1118 and ~1122–1287). Consolidate into one block. Net ~150 fewer lines, no behavior change.

## New Column 11: Vitamins

**Position:** between "macros" (current col 6) and "sodium" (current col 7). Width: ~190px.
**Header label:** `vitamins`.
**Cell content:** for each vitamin where `value > 0`, render a colored chip with the vitamin's short label. Vitamins with value 0 or missing are not rendered.

### Chip component

Inline JSX in `FoodsManager.tsx` (no new file). Render via a small helper:

```tsx
function VitaminChips({ vitamins }: { vitamins?: Record<string, number> }) {
  if (!vitamins) return <span className="muted-text">—</span>;
  const present = VITAMINS.filter(v => (vitamins[v.key] ?? 0) > 0);
  if (!present.length) return <span className="muted-text">—</span>;
  return (
    <div className="vit-chips">
      {present.map(v => (
        <span key={v.key} className={`vit-chip ${v.cls}`} title={`${v.full}: ${vitamins[v.key]} ${v.unit}`}>
          {v.label}
        </span>
      ))}
    </div>
  );
}
```

### Vitamin definitions (color = option a — A orange, D gold)

| key | label | full (NK) | unit | bg | fg | class |
|---|---|---|---|---|---|---|
| `vitaminA` | A | vitamins A | µg RAE | #fed7aa | `#9a3412` | `vit-A` |
| `vitaminB1` | B1 | vitamins B1 (thiamine) | mg | #dbeafe` | `#1e40af` | `vit-B1` |
| `vitaminB2` | B2 | vitamins B2 (riboflavin) | mg | `#fef9c3` | `#a16207` | `vit-B2` |
| `vitaminB3` | B3 | vitamins B3 (Niacin) | mg | `#cffafe` | `#0e7490` | `vit-B3` |
| `vitaminB6` | B6 | vitamins B6 | mg | `#ccfbf1` | `#115e59` | `vit-B6` |
| `vitaminB12` | B12 | vitamins B12 | µg | `#fce7f3` | `#9f1239` | `vit-B12` |
| `vitaminC` | C | vitamins C | mg | `#dcfce7` | `#166534` | `vit-C` |
| `vitaminD` | D | vitamins D | µg | `#fef3c7` | `#a16207` | `vit-D` |
| `vitaminE` | E | vitamins E | mg | `#ecfccb` | `#3f6212` | `vit-E` |
| `vitaminK` | K | vitamins K | µg | `#bbf7d0` | `#14532d` | `vit-K` |
| `folate` | F | folic acid | µg | `#d9f99d` | `#365314` | `vit-F` |

Order in the table follows the table above (A → folate). Stable ordering keeps the visual scannable.

### CSS

```css
.vit-chips { display: flex; flex-wrap: wrap; gap: 3px; }
.vit-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 18px;
  padding: 0 5px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.02em;
  cursor: help;
}
.vit-A   { background: #fed7aa; color: #9a3412; }
.vit-B1  { background: #dbeafe; color: #1e40af; }
.vit-B2  { background: #fef9c3; color: #a16207; }
.vit-B3  { background: #cffafe; color: #0e7490; }
.vit-B6  { background: #ccfbf1; color: #115e59; }
.vit-B12 { background: #fce7f3; color: #9f1239; }
.vit-C   { background: #dcfce7; color: #166534; }
.vit-D   { background: #fef3c7; color: #a16207; }
.vit-E   { background: #ecfccb; color: #3f6212; }
.vit-K   { background: #bbf7d0; color: #14532d; }
.vit-F   { background: #d9f99d; color: #365314; }
```

### Header column widths

After adding the vitamin column the `<th>` width set becomes:

```
Image 64 · Food name 180 · Chinese name 120 · Category 130 · Calories 76 · 3macronutrients 220 · Vitamin 190 · Sodium 80 · allergen 130 · status 90 · task 100
```

Total ~1380px; current min-width: 900 stays — table scrolls horizontally on narrow viewports as today.

## Out of Scope (deferred to later specs)

- Sub-project 2: switching all UI labels to NK Korean (vocabulary decisions like vitamins ↔ vitamins, calories ↔ calories etc.)
- Sub-project 3: applying `reference.md` Chinese→Korean mappings to the foods collection
- Sub-project 4: validating Mongo `foods` against `food_material.json` + `nutrient.json`
- Edit modal restyling
- Column set changes beyond adding vitamins
- Mobile/responsive tweaks (admin is desktop-first, current 1000px breakpoint stays)

## Verification

No automated tests for the admin (per `CLAUDE.md`). Steps:

1. `npm run build` from repo root — TypeScript and Next.js build must pass.
2. Open http://localhost:3000/foods. Confirm:
   - All 11 columns render with correct widths.
   - Hover state shows tinted row background (no border highlight).
   - Vitamin chips render only for vitamins with value > 0; tooltip shows formatted value.
   - Empty vitamin row shows `—` muted.
   - Allergen chips read as warmer/softer.
   - Sticky header stays legible while scrolling.
   - Modal/edit form is unchanged.
3. Spot-check at viewport widths 1280, 1440, 1920.

## Risks

- **Empty vitamin data.** Many imported records have all-zero vitamin objects (CFD, USDA branded). Those rows will show `—` in the new column. This is the correct behavior given the design — the data is the issue, not the UI. Sub-project 4 (validation) will surface the gap.
- **Color collisions for color-blind users.** A/D both use warm tones, K uses dark green. Labels (A/D/K letters) provide redundant encoding so chips are distinguishable without color. Tooltip on hover gives the full name as a third channel.
