"use client";

import {
  Check, ChevronDown, ChevronLeft, ChevronRight,
  ChevronsLeft, ChevronsRight, Pencil, Plus, Search,
  Shield, Trash2, Upload, X, Zap
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import PageHeader from "@/components/PageHeader";
import { API_URL, apiFetch } from "@/lib/api";

// ─── Types ───────────────────────────────────────────────────────────────────

type Macros = { protein?: number; fat?: number; carbs?: number; fiber?: number };
type Vitamins = Record<string, number>;
type Minerals = Record<string, number>;

type Food = {
  _id?: string;
  koreanName: string;
  chineseName?: string;
  brand?: string;
  category: string;
  foodGroup?: string;
  foodSubgroup?: string;
  servingSize: string;
  calories: number;
  macros?: Macros;
  saturatedFat?: number;
  transFat?: number;
  unsaturatedFat?: number;
  omega3?: number;
  omega6?: number;
  cholesterolMg?: number;
  sugar?: number;
  glycemicIndex?: number;
  oiliness?: string;
  oilinessScore?: number;
  vitamins?: Vitamins;
  minerals?: Minerals;
  bestTimeToEat?: string[];
  goodPairings?: string[];
  avoidPairings?: string[];
  cautionGroups?: string[];
  koreanCautions?: string;
  cautions?: string;
  benefits?: string;
  allergens?: string[];
  ingredients?: string[];
  additives?: string[];
  dietUseCases?: string[];
  dietUseNote?: string;
  dailyValuePercent?: Record<string, number>;
  dataSource?: string;
  sourceNote?: string;
  tags?: string[];
  barcode?: string;
  imageUrl?: string;
  imageStatus?: string;
  icon?: string;
  doctor_verified?: boolean;
};

type ApiList = { items: Food[]; total: number; page: number; limit: number };
type ImageUploadResponse = { imageUrl: string; imageStatus: string };

// ─── Helpers ─────────────────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, string> = {
  vegetable: "#16a34a", fruit: "#ea580c", seafood: "#0284c7", meat: "#dc2626",
  poultry: "#9333ea", egg: "#ca8a04", "egg and poultry": "#9333ea",
  grain: "#854d0e", "grain and legume": "#854d0e", legume: "#65a30d",
  "starch and tuber": "#b45309", "mushroom and algae": "#0f766e",
  "nuts and seeds": "#92400e", seasoning: "#6b7280", beverage: "#1d4ed8",
  "alcoholic beverage": "#7c3aed", snack: "#db2777", "prepared food": "#475569",
  "convenience food": "#64748b", "sweetener and preserved fruit": "#d97706",
  "infant food": "#0ea5e9"
};

function catColor(category: string) {
  return CATEGORY_COLORS[category] ?? "#64748b";
}

function fmt(v?: number, decimals = 1) {
  if (v === undefined || v === null || isNaN(v)) return "—";
  return v === 0 ? "0" : v.toFixed(decimals);
}

function joinList(arr?: string[]) {
  if (!arr?.length) return "—";
  return arr.join(", ");
}

function parseTags(raw: string) {
  return raw.split(",").map(s => s.trim()).filter(Boolean);
}

const IMG_BASE = API_URL.replace(/\/api\/?$/, "");

function resolveImg(url?: string) {
  if (!url) return "";
  return url.startsWith("/") ? `${IMG_BASE}${url}` : url;
}

function fileToBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result ?? "");
      resolve(result.includes(",") ? result.split(",")[1] : result);
    };
    reader.onerror = () => reject(new Error("Could not read image."));
    reader.readAsDataURL(file);
  });
}

// Daily Value (For adults) — used to sort vitamin chips by relative contribution
const VITAMINS: { key: string; label: string; full: string; unit: string; cls: string; dv: number }[] = [
  { key: "vitaminA",   label: "A",   full: "vitamins A",              unit: "µg", cls: "vit-A",   dv: 900 },
  { key: "vitaminB1",  label: "B1",  full: "vitamins B1 (thiamine)",     unit: "mg", cls: "vit-B1",  dv: 1.2 },
  { key: "vitaminB2",  label: "B2",  full: "vitamins B2 (riboflavin)", unit: "mg", cls: "vit-B2",  dv: 1.3 },
  { key: "vitaminB3",  label: "B3",  full: "vitamins B3 (Niacin)",     unit: "mg", cls: "vit-B3",  dv: 16  },
  { key: "vitaminB6",  label: "B6",  full: "vitamins B6",              unit: "mg", cls: "vit-B6",  dv: 1.7 },
  { key: "vitaminB12", label: "B12", full: "vitamins B12",             unit: "µg", cls: "vit-B12", dv: 2.4 },
  { key: "vitaminC",   label: "C",   full: "vitamins C",               unit: "mg", cls: "vit-C",   dv: 90  },
  { key: "vitaminD",   label: "D",   full: "vitamins D",               unit: "µg", cls: "vit-D",   dv: 20  },
  { key: "vitaminE",   label: "E",   full: "vitamins E",               unit: "mg", cls: "vit-E",   dv: 15  },
  { key: "vitaminK",   label: "K",   full: "vitamins K",               unit: "µg", cls: "vit-K",   dv: 120 },
  { key: "folate",     label: "F",   full: "folic acid",                    unit: "µg", cls: "vit-F",  dv: 400 }
];

function VitaminChips({ vitamins }: { vitamins?: Vitamins }) {
  if (!vitamins) return <span className="muted-text">—</span>;
  const present = VITAMINS
    .filter(v => (vitamins[v.key] ?? 0) > 0)
    .sort((a, b) => (vitamins[b.key] ?? 0) / b.dv - (vitamins[a.key] ?? 0) / a.dv);
  if (!present.length) return <span className="muted-text">—</span>;
  return (
    <div className="vit-chips">
      {present.map(v => {
        const value = vitamins[v.key] ?? 0;
        const pct = Math.round((value / v.dv) * 100);
        return (
          <span
            key={v.key}
            className={`vit-chip ${v.cls}`}
            title={`${v.full}: ${fmt(value, 2)} ${v.unit} (recommended daily amount ${pct}%)`}
          >
            {v.label}
          </span>
        );
      })}
    </div>
  );
}

// ─── Tab IDs ─────────────────────────────────────────────────────────────────

type TabId = "basic" | "macros" | "vitamins" | "pairings" | "meta";
const TABS: { id: TabId; label: string }[] = [
  { id: "basic", label: "basic information" },
  { id: "macros", label: "nutrition facts" },
  { id: "vitamins", label: "vitamins · mineral" },
  { id: "pairings", label: "Compatibility · caution" },
  { id: "meta", label: "metadata" }
];

// ─── NumberField helper ───────────────────────────────────────────────────────

function NF({ label, name, value }: { label: string; name: string; value?: number }) {
  return (
    <label className="fm-field">
      <span>{label}</span>
      <input name={name} type="number" step="any" min="0" defaultValue={value ?? ""} />
    </label>
  );
}

function TF({ label, name, value, wide }: { label: string; name: string; value?: string; wide?: boolean }) {
  return (
    <label className={`fm-field${wide ? " fm-wide" : ""}`}>
      <span>{label}</span>
      <input name={name} type="text" defaultValue={value ?? ""} />
    </label>
  );
}

function TagsF({ label, name, value }: { label: string; name: string; value?: string[] }) {
  return (
    <label className="fm-field fm-wide">
      <span>{label} <em>(comma separated)</em></span>
      <input name={name} type="text" defaultValue={value?.join(", ") ?? ""} />
    </label>
  );
}

function TextareaF({ label, name, value, wide }: { label: string; name: string; value?: string; wide?: boolean }) {
  return (
    <label className={`fm-field${wide ? " fm-wide" : ""}`}>
      <span>{label}</span>
      <textarea name={name} defaultValue={value ?? ""} />
    </label>
  );
}

// ─── Edit Form ────────────────────────────────────────────────────────────────

function FoodForm({ food, onClose, onSaved }: { food: Partial<Food>; onClose: () => void; onSaved: () => void }) {
  const [tab, setTab] = useState<TabId>("basic");
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState("");
  const [imageUrl, setImageUrl] = useState(food.imageUrl ?? "");
  const [imageStatus, setImageStatus] = useState(food.imageStatus ?? "missing");
  const imageInputRef = useRef<HTMLInputElement>(null);
  const isNew = !food._id;

  async function handleImageUpload(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("You can only upload image files.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError("Image 8MBmust be smaller than.");
      return;
    }

    setUploadingImage(true);
    setError("");
    try {
      const data = await fileToBase64(file);
      const uploaded = await apiFetch<ImageUploadResponse>("/foods/image-upload", {
        method: "POST",
        body: JSON.stringify({ fileName: file.name, mimeType: file.type, data })
      });
      setImageUrl(uploaded.imageUrl);
      setImageStatus(uploaded.imageStatus || "uploaded");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Image upload failed");
    } finally {
      setUploadingImage(false);
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const fd = new FormData(e.currentTarget);

    const num = (key: string) => { const v = Number(fd.get(key)); return isNaN(v) ? 0 : v; };
    const tags = (key: string) => parseTags(String(fd.get(key) ?? ""));
    const str = (key: string) => String(fd.get(key) ?? "").trim();

    const payload: Record<string, unknown> = {
      koreanName: str("koreanName"),
      chineseName: str("chineseName"),
      brand: str("brand"),
      category: str("category"),
      foodGroup: str("foodGroup"),
      foodSubgroup: str("foodSubgroup"),
      servingSize: str("servingSize") || "100 g",
      calories: num("calories"),
      macros: {
        protein: num("macros.protein"),
        fat: num("macros.fat"),
        carbs: num("macros.carbs"),
        fiber: num("macros.fiber")
      },
      saturatedFat: num("saturatedFat"),
      transFat: num("transFat"),
      unsaturatedFat: num("unsaturatedFat"),
      omega3: num("omega3"),
      omega6: num("omega6"),
      cholesterolMg: num("cholesterolMg"),
      sugar: num("sugar"),
      glycemicIndex: num("glycemicIndex"),
      oiliness: str("oiliness"),
      oilinessScore: num("oilinessScore"),
      vitamins: {
        vitaminA: num("vit.A"), vitaminB1: num("vit.B1"), vitaminB2: num("vit.B2"),
        vitaminB3: num("vit.B3"), vitaminB6: num("vit.B6"), vitaminB12: num("vit.B12"),
        vitaminC: num("vit.C"), vitaminD: num("vit.D"), vitaminE: num("vit.E"),
        vitaminK: num("vit.K"), folate: num("vit.folate")
      },
      minerals: {
        calcium: num("min.calcium"), iron: num("min.iron"), magnesium: num("min.magnesium"),
        potassium: num("min.potassium"), sodium: num("min.sodium"), zinc: num("min.zinc")
      },
      bestTimeToEat: tags("bestTimeToEat"),
      goodPairings: tags("goodPairings"),
      avoidPairings: tags("avoidPairings"),
      cautionGroups: tags("cautionGroups"),
      koreanCautions: str("koreanCautions"),
      cautions: str("cautions"),
      benefits: str("benefits"),
      allergens: tags("allergens"),
      ingredients: tags("ingredients"),
      additives: tags("additives"),
      dietUseCases: tags("dietUseCases"),
      dietUseNote: str("dietUseNote"),
      dataSource: str("dataSource"),
      sourceNote: str("sourceNote"),
      tags: tags("tags"),
      barcode: str("barcode"),
      imageUrl,
      imageStatus,
      icon: str("icon"),
      doctor_verified: fd.get("doctor_verified") === "true"
    };

    try {
      if (isNew) {
        await apiFetch("/foods", { method: "POST", body: JSON.stringify(payload) });
      } else {
        await apiFetch(`/foods/${food._id}`, { method: "PUT", body: JSON.stringify(payload) });
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fm-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="fm-modal">
        {/* Header */}
        <div className="fm-modal-head">
          <div>
            <h2>{isNew ? "Add new food" : `edit: ${food.koreanName}`}</h2>
            {food.chineseName && <span className="fm-chinese">{food.chineseName}</span>}
          </div>
          <button type="button" onClick={onClose} className="fm-close-btn"><X size={18} /></button>
        </div>

        {/* Tabs */}
        <div className="fm-tabs">
          {TABS.map(t => (
            <button key={t.id} type="button" className={`fm-tab${tab === t.id ? " active" : ""}`} onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="fm-body">
            {/* ── BASIC ── */}
            {tab === "basic" && (
              <div className="fm-grid">
                <label className="fm-field fm-wide">
                  <span>food name (Joseon language) <em>*required</em></span>
                  <input name="koreanName" type="text" defaultValue={food.koreanName ?? ""} required />
                </label>
                <TF label="food name (chinese)" name="chineseName" value={food.chineseName} />
                <TF label="brand" name="brand" value={food.brand} />
                <TF label="Classification (category) *" name="category" value={food.category} wide />
                <TF label="food group (foodGroup)" name="foodGroup" value={food.foodGroup} />
                <TF label="Detailed classification (subgroup)" name="foodSubgroup" value={food.foodSubgroup} />
                <TF label="1Serving Size (servingSize)" name="servingSize" value={food.servingSize} />
                <NF label="calories (kcal/100g) *" name="calories" value={food.calories} />
                <label className="fm-field">
                  <span>greasiness (oiliness)</span>
                  <select name="oiliness" defaultValue={food.oiliness ?? ""}>
                    <option value="">selection</option>
                    <option value="low">low</option>
                    <option value="medium">Normal</option>
                    <option value="high">high</option>
                    <option value="very high">very high</option>
                  </select>
                </label>
                <NF label="greasiness score (0–5)" name="oilinessScore" value={food.oilinessScore} />
                <NF label="glycemic index (GI)" name="glycemicIndex" value={food.glycemicIndex} />
                <TagsF label="allergen" name="allergens" value={food.allergens} />
                <TagsF label="tag" name="tags" value={food.tags} />
                <TF label="barcode" name="barcode" value={food.barcode} />
                <label className="fm-field fm-wide">
                  <span>doctor verification</span>
                  <select name="doctor_verified" defaultValue={String(food.doctor_verified ?? false)}>
                    <option value="false">Not verified</option>
                    <option value="true">Verification completed</option>
                  </select>
                </label>
              </div>
            )}

            {/* ── MACROS ── */}
            {tab === "macros" && (
              <div className="fm-grid">
                <div className="fm-section-title fm-wide">key nutrients (per 100 g)</div>
                <NF label="protein g" name="macros.protein" value={food.macros?.protein} />
                <NF label="fat g" name="macros.fat" value={food.macros?.fat} />
                <NF label="carbohydrates g" name="macros.carbs" value={food.macros?.carbs} />
                <NF label="dietary fiber g" name="macros.fiber" value={food.macros?.fiber} />
                <NF label="sugar g" name="sugar" value={food.sugar} />
                <NF label="saturated fat g" name="saturatedFat" value={food.saturatedFat} />
                <NF label="trans fat g" name="transFat" value={food.transFat} />
                <NF label="unsaturated fat g" name="unsaturatedFat" value={food.unsaturatedFat} />
                <NF label="omega-3 g" name="omega3" value={food.omega3} />
                <NF label="omega-6 g" name="omega6" value={food.omega6} />
                <NF label="cholesterol mg" name="cholesterolMg" value={food.cholesterolMg} />
              </div>
            )}

            {/* ── VITAMINS ── */}
            {tab === "vitamins" && (
              <div className="fm-grid">
                <div className="fm-section-title fm-wide">vitamins (per 100 g)</div>
                <NF label="vitamins A μg RAE" name="vit.A" value={food.vitamins?.vitaminA} />
                <NF label="vitamins B1 mg" name="vit.B1" value={food.vitamins?.vitaminB1} />
                <NF label="vitamins B2 mg" name="vit.B2" value={food.vitamins?.vitaminB2} />
                <NF label="vitamins B3 mg" name="vit.B3" value={food.vitamins?.vitaminB3} />
                <NF label="vitamins B6 mg" name="vit.B6" value={food.vitamins?.vitaminB6} />
                <NF label="vitamins B12 μg" name="vit.B12" value={food.vitamins?.vitaminB12} />
                <NF label="vitamins C mg" name="vit.C" value={food.vitamins?.vitaminC} />
                <NF label="vitamins D μg" name="vit.D" value={food.vitamins?.vitaminD} />
                <NF label="vitamins E mg" name="vit.E" value={food.vitamins?.vitaminE} />
                <NF label="vitamins K μg" name="vit.K" value={food.vitamins?.vitaminK} />
                <NF label="folic acid μg" name="vit.folate" value={food.vitamins?.folate} />
                <div className="fm-section-title fm-wide">mineral (per 100 g)</div>
                <NF label="calcium mg" name="min.calcium" value={food.minerals?.calcium} />
                <NF label="iron mg" name="min.iron" value={food.minerals?.iron} />
                <NF label="magnesium mg" name="min.magnesium" value={food.minerals?.magnesium} />
                <NF label="potassium mg" name="min.potassium" value={food.minerals?.potassium} />
                <NF label="sodium mg" name="min.sodium" value={food.minerals?.sodium} />
                <NF label="zinc mg" name="min.zinc" value={food.minerals?.zinc} />
              </div>
            )}

            {/* ── PAIRINGS & CAUTIONS ── */}
            {tab === "pairings" && (
              <div className="fm-grid">
                <TagsF label="Recommended intake time" name="bestTimeToEat" value={food.bestTimeToEat} />
                <TagsF label="Foods that go well together" name="goodPairings" value={food.goodPairings} />
                <TagsF label="Foods to Avoid" name="avoidPairings" value={food.avoidPairings} />
                <TagsF label="Constitution that requires attention" name="cautionGroups" value={food.cautionGroups} />
                <TextareaF label="Precautions (Korean)" name="koreanCautions" value={food.koreanCautions} wide />
                <TextareaF label="Precautions (Chinese original text)" name="cautions" value={food.cautions} wide />
                <TextareaF label="Efficacy · Features" name="benefits" value={food.benefits} wide />
                <TagsF label="Dietary Uses (dietUseCases)" name="dietUseCases" value={food.dietUseCases} />
                <TextareaF label="Diet Use Description" name="dietUseNote" value={food.dietUseNote} wide />
                <TagsF label="Ingredients List" name="ingredients" value={food.ingredients} />
                <TagsF label="additives" name="additives" value={food.additives} />
              </div>
            )}

            {/* ── META ── */}
            {tab === "meta" && (
              <div className="fm-grid">
                <TF label="data source" name="dataSource" value={food.dataSource} wide />
                <TextareaF label="Source Note (JSON possible)" name="sourceNote" value={food.sourceNote} wide />
                <label className="fm-field fm-wide">
                  <span>Upload image</span>
                  <div className="fm-image-uploader">
                    <div className="fm-image-preview-box">
                      {imageUrl
                        ? <img src={resolveImg(imageUrl)} alt="" />
                        : <span>no image</span>
                      }
                    </div>
                    <div className="fm-image-upload-controls">
                      <input ref={imageInputRef} name="imageUpload" type="file" accept="image/*" onChange={e => handleImageUpload(e.target.files?.[0])} />
                      <input name="imageUrlDisplay" type="text" value={imageUrl} readOnly placeholder="When uploaded, the image path is automatically entered.." />
                      <button type="button" className="fm-upload-btn" disabled={uploadingImage} onClick={() => imageInputRef.current?.click()}>
                        <Upload size={15} /> {uploadingImage ? "Uploading..." : "Select file"}
                      </button>
                    </div>
                  </div>
                </label>
                <label className="fm-field">
                  <span>image status</span>
                  <select name="imageStatus" value={imageStatus} onChange={e => setImageStatus(e.target.value)}>
                    <option value="missing">missing</option>
                    <option value="uploaded">uploaded</option>
                    <option value="downloaded">downloaded</option>
                    <option value="download_failed">download_failed</option>
                    <option value="needs_real_download">needs_real_download</option>
                  </select>
                </label>
                <TF label="icon" name="icon" value={food.icon} />
              </div>
            )}
          </div>

          {/* Footer */}
          {error && <p className="fm-error">{error}</p>}
          <div className="fm-footer">
            <button type="button" onClick={onClose}><X size={15} /> Cancel</button>
            <button type="submit" className="primary" disabled={saving || uploadingImage}>
              <Check size={15} /> {saving ? "Saving..." : "save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Nutrition Bar ────────────────────────────────────────────────────────────

function MacroBar({ protein = 0, fat = 0, carbs = 0 }: { protein?: number; fat?: number; carbs?: number }) {
  const total = protein + fat + carbs;
  const title = `protein ${fmt(protein)}g · fat ${fmt(fat)}g · carbohydrates ${fmt(carbs)}g`;
  if (!total) {
    return <div className="macro-bar macro-bar-empty" title={title} />;
  }
  const p = (v: number) => `${((v / total) * 100).toFixed(0)}%`;
  return (
    <div className="macro-bar" title={title}>
      <div style={{ width: p(protein), background: "#16a34a" }} />
      <div style={{ width: p(fat), background: "#f59e0b" }} />
      <div style={{ width: p(carbs), background: "#3b82f6" }} />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function FoodsManager() {
  const [items, setItems] = useState<Food[]>([]);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [editing, setEditing] = useState<Partial<Food> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [previewImg, setPreviewImg] = useState("");

  const pages = Math.max(Math.ceil(total / limit), 1);
  const start = total ? (page - 1) * limit + 1 : 0;
  const end = Math.min(page * limit, total);

  async function load(nextPage = page) {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ page: String(nextPage), limit: String(limit) });
      if (query) params.set("q", query);
      const data = await apiFetch<ApiList>(`/foods?${params.toString()}`);
      setItems(data.items);
      setTotal(data.total);
      setPage(data.page ?? nextPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : "load failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(1); }, [limit]);

  async function remove(id?: string) {
    if (!id || !confirm("Are you sure you want to delete this food??")) return;
    await apiFetch(`/foods/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <section className="page">
      <PageHeader
        title="food database"
        subtitle="100g Standard Nutritional Ingredients, Korean food name, Classification, Manage compatibility and precautions."
        action={
          <button className="primary" onClick={() => setEditing({})} type="button">
            <Plus size={16} /> Add food
          </button>
        }
      />

      <div className="foods-panel panel">
        {/* Toolbar */}
        <div className="toolbar">
          <label className="search-field">
            <Search size={15} />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && load(1)}
              placeholder="food name, Classification, Search by tag..."
            />
          </label>
          <button onClick={() => load(1)} type="button">Search</button>
          <select className="limit-select" value={limit} onChange={e => { setPage(1); setLimit(Number(e.target.value)); }}>
            {[25, 50, 100, 250].map(n => <option key={n} value={n}>{n}dog</option>)}
          </select>
          <span className="toolbar-count">
            {loading ? "Loading..." : `${start}–${end} / ${total}gun`}
          </span>
          {/* Legend */}
          <div className="macro-legend">
            <span style={{ background: "#16a34a" }} /> protein
            <span style={{ background: "#f59e0b" }} /> fat
            <span style={{ background: "#3b82f6" }} /> carbohydrates
          </div>
        </div>

        {error && <p className="error" style={{ margin: "12px 14px" }}>{error}</p>}

        {/* Table */}
        <div className="foods-table-wrap">
          <table className="foods-table">
            <thead>
              <tr>
                <th style={{ width: 64 }}>image</th>
                <th style={{ width: 180 }}>food name (Korean)</th>
                <th style={{ width: 120 }}>Chinese name</th>
                <th style={{ width: 130 }}>Classification</th>
                <th style={{ width: 76 }}>calories</th>
                <th style={{ width: 220 }}>3macronutrients</th>
                <th style={{ width: 190 }}>vitamins</th>
                <th style={{ width: 80 }}>sodium</th>
                <th style={{ width: 130 }}>allergen</th>
                <th style={{ width: 90 }}>status</th>
                <th style={{ width: 100 }}>work</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => {
                const imgSrc = resolveImg(item.imageUrl);
                const color = catColor(item.category);
                return (
                  <tr
                    key={String(item._id)}
                    onDoubleClick={(event) => {
                      const target = event.target as HTMLElement;
                      if (target.closest("button, a, input, select, textarea")) return;
                      setEditing(item);
                    }}
                  >
                    {/* Image */}
                    <td>
                      {imgSrc
                        ? <button className="img-thumb-btn" onClick={() => setPreviewImg(imgSrc)} type="button">
                            <img src={imgSrc} alt="" className="img-thumb" />
                          </button>
                        : <div className="img-empty">None</div>
                      }
                    </td>
                    {/* Korean name */}
                    <td>
                      <div className="food-name-cell">
                        <strong>{item.koreanName}</strong>
                        {item.doctor_verified && (
                          <span className="verified-badge" title="doctor verification"><Shield size={12} /></span>
                        )}
                      </div>
                    </td>
                    {/* Chinese name */}
                    <td className="chinese-cell">{item.chineseName || "—"}</td>
                    {/* Category */}
                    <td>
                      <span className="cat-badge" style={{ borderColor: color, color }}>
                        {item.category}
                      </span>
                      {item.foodSubgroup && item.foodSubgroup !== item.category && (
                        <div className="subgroup-text">{item.foodSubgroup}</div>
                      )}
                    </td>
                    {/* Calories */}
                    <td className="num-cell">
                      <span className="kcal-value">{item.calories}</span>
                      <span className="kcal-unit">kcal</span>
                    </td>
                    {/* Macro bar — always rendered */}
                    <td>
                      <div className="macro-nums">
                        <span className="macro-num macro-p" title="protein">P {fmt(item.macros?.protein ?? 0)}g</span>
                        <span className="macro-num macro-f" title="fat">F {fmt(item.macros?.fat ?? 0)}g</span>
                        <span className="macro-num macro-c" title="carbohydrates">C {fmt(item.macros?.carbs ?? 0)}g</span>
                      </div>
                      <MacroBar protein={item.macros?.protein} fat={item.macros?.fat} carbs={item.macros?.carbs} />
                    </td>
                    {/* Vitamins */}
                    <td>
                      <VitaminChips vitamins={item.vitamins} />
                    </td>
                    {/* Sodium */}
                    <td className="num-cell">{fmt(item.minerals?.sodium, 0)} mg</td>
                    {/* Allergens */}
                    <td>
                      {item.allergens?.length
                        ? <div className="allergen-chips">
                            {item.allergens.slice(0, 3).map((a, index) => <span key={`${a}-${index}`} className="allergen-chip">{a}</span>)}
                            {item.allergens.length > 3 && <span className="allergen-chip more">+{item.allergens.length - 3}</span>}
                          </div>
                        : <span className="muted-text">None</span>
                      }
                    </td>
                    {/* Verified */}
                    <td>
                      <span className={`status-text${item.doctor_verified ? " ok" : ""}`}>
                        {item.doctor_verified ? "verification" : "Not verified"}
                      </span>
                    </td>
                    {/* Actions */}
                    <td>
                      <div className="row-btns">
                        <button onClick={() => setEditing(item)} type="button" title="edit" aria-label="edit">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => remove(String(item._id))} type="button" title="Delete" aria-label="Delete" className="danger-btn">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!loading && items.length === 0 && (
                <tr><td colSpan={11} className="empty-row">No search results.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="pagination">
          <button disabled={page <= 1 || loading} onClick={() => load(1)} type="button"><ChevronsLeft size={15} /></button>
          <button disabled={page <= 1 || loading} onClick={() => load(page - 1)} type="button"><ChevronLeft size={15} /> Previous</button>
          <span>page {page} / {pages}</span>
          <button disabled={page >= pages || loading} onClick={() => load(page + 1)} type="button">next <ChevronRight size={15} /></button>
          <button disabled={page >= pages || loading} onClick={() => load(pages)} type="button"><ChevronsRight size={15} /></button>
        </div>
      </div>

      {/* Image preview */}
      {previewImg && (
        <button className="image-preview-backdrop" onClick={() => setPreviewImg("")} type="button" aria-label="close">
          <img className="image-preview" src={previewImg} alt="" />
        </button>
      )}

      {/* Edit / Create modal */}
      {editing !== null && (
        <FoodForm food={editing} onClose={() => setEditing(null)} onSaved={() => load()} />
      )}
    </section>
  );
}
