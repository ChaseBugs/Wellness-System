"use client";

import { X } from "lucide-react";
import type { FilterDef } from "@/lib/resourceConfigs";

export type FilterValues = Record<string, string>;

export default function FilterBar({
  filters, values, onChange
}: { filters: FilterDef[]; values: FilterValues; onChange: (next: FilterValues) => void }) {
  if (!filters.length) return null;

  function set(key: string, v: string) {
    const next = { ...values };
    if (!v) delete next[key]; else next[key] = v;
    onChange(next);
  }

  function toggleChip(f: Extract<FilterDef, { type: "chip" }>) {
    set(f.key, values[f.key] === f.value ? "" : f.value);
  }

  return (
    <div className="filter-bar">
      {filters.map((f) => {
        if (f.type === "chip") {
          const active = values[f.key] === f.value;
          return (
            <button key={f.key + f.value} type="button" className={`filter-chip ${active ? "active" : ""}`} onClick={() => toggleChip(f)}>
              {f.label}
            </button>
          );
        }
        if (f.type === "select") {
          return (
            <label key={f.key} className="filter-select">
              <span>{f.label}</span>
              <select value={values[f.key] ?? ""} onChange={(e) => set(f.key, e.target.value)}>
                <option value="">All</option>
                {f.options.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </label>
          );
        }
        if (f.type === "range") {
          return (
            <span key={f.key} className="filter-range">
              <span>{f.label}</span>
              <input type="number" placeholder="min" value={values[`${f.key}_gte`] ?? ""} onChange={(e) => set(`${f.key}_gte`, e.target.value)} />
              <input type="number" placeholder="max" value={values[`${f.key}_lte`] ?? ""} onChange={(e) => set(`${f.key}_lte`, e.target.value)} />
            </span>
          );
        }
        return null;
      })}
      {Object.keys(values).length > 0 ? (
        <button type="button" className="filter-clear" onClick={() => onChange({})}><X size={14} /> Clear</button>
      ) : null}
    </div>
  );
}
