import { Router, type Request } from "express";
import type { Model } from "mongoose";
import { NotFoundError, ValidationError } from "../utils/errors.js";

const RANGE_SUFFIXES = { _gte: "$gte", _lte: "$lte" } as const;

function coerceValue(model: Model<any>, fieldName: string, raw: string): unknown {
  const path = model.schema.path(fieldName);
  const instance = path?.instance;
  if (instance === "Number") return Number(raw);
  if (instance === "Boolean") return raw === "true";
  return raw;
}

function buildFilters(model: Model<any>, query: Record<string, unknown>, allowed: Set<string>) {
  const filters: Record<string, unknown> = {};
  for (const [key, rawValue] of Object.entries(query)) {
    if (rawValue === undefined || rawValue === null || rawValue === "") continue;
    if (key === "q" || key === "page" || key === "limit" || key === "sort") continue;
    const valueStr = String(rawValue);

    let suffixMatch: keyof typeof RANGE_SUFFIXES | null = null;
    for (const suffix of Object.keys(RANGE_SUFFIXES) as (keyof typeof RANGE_SUFFIXES)[]) {
      if (key.endsWith(suffix)) { suffixMatch = suffix; break; }
    }

    if (suffixMatch) {
      const baseField = key.slice(0, -suffixMatch.length);
      if (!allowed.has(baseField)) continue;
      const op = RANGE_SUFFIXES[suffixMatch];
      const coerced = coerceValue(model, baseField, valueStr);
      filters[baseField] = { ...(filters[baseField] as object || {}), [op]: coerced };
      continue;
    }

    if (!allowed.has(key)) continue;
    if (valueStr.includes(",")) {
      const values = valueStr.split(",").map((v) => v.trim()).filter(Boolean).map((v) => coerceValue(model, key, v));
      filters[key] = { $in: values };
    } else {
      filters[key] = coerceValue(model, key, valueStr);
    }
  }
  return filters;
}

function parseSort(req: Request, sortable: Set<string>): Record<string, 1 | -1> {
  const raw = String(req.query.sort ?? "").trim();
  if (!raw) return { createdAt: -1 };
  const desc = raw.startsWith("-");
  const field = desc ? raw.slice(1) : raw;
  if (!sortable.has(field)) return { createdAt: -1 };
  return { [field]: desc ? -1 : 1 };
}

export type CrudOptions = {
  sortableFields?: string[];
  bulkActions?: boolean;
};

export function createCrudRouter(
  model: Model<any>,
  searchFields: string[] = [],
  filterableFields: string[] = [],
  options: CrudOptions = {}
) {
  const router = Router();
  const allowed = new Set(filterableFields);
  const sortable = new Set([...(options.sortableFields ?? []), "createdAt"]);

  router.get("/", async (req, res, next) => {
    try {
      const page = Math.max(Number(req.query.page ?? 1), 1);
      const limit = Math.min(Math.max(Number(req.query.limit ?? 20), 1), 500);
      const q = String(req.query.q ?? "").trim();

      const filters = buildFilters(model, req.query as Record<string, unknown>, allowed);
      const textFilter = q
        ? { $or: searchFields.map((field) => ({ [field]: { $regex: q, $options: "i" } })) }
        : null;
      const filter = textFilter
        ? (Object.keys(filters).length ? { $and: [filters, textFilter] } : textFilter)
        : filters;

      const sort = parseSort(req, sortable);

      const [items, total] = await Promise.all([
        model.find(filter).sort(sort).skip((page - 1) * limit).limit(limit).lean(),
        model.countDocuments(filter)
      ]);

      res.json({ items, total, page, limit });
    } catch (error) { next(error); }
  });

  if (options.bulkActions) {
    router.patch("/bulk-verify", async (req, res, next) => {
      try {
        const { ids, doctor_verified } = req.body as { ids?: unknown; doctor_verified?: unknown };
        if (!Array.isArray(ids) || ids.some((x) => typeof x !== "string") || ids.length > 500) {
          throw new ValidationError("ids must be a string[] of length <= 500");
        }
        if (typeof doctor_verified !== "boolean") {
          throw new ValidationError("doctor_verified must be boolean");
        }
        if (ids.length === 0) {
          res.json({ matched: 0, modified: 0 });
          return;
        }
        const result = await model.updateMany({ _id: { $in: ids } }, { $set: { doctor_verified } });
        res.json({ matched: (result as any).matchedCount ?? 0, modified: (result as any).modifiedCount ?? 0 });
      } catch (error) { next(error); }
    });

    router.delete("/bulk", async (req, res, next) => {
      try {
        const { ids } = req.body as { ids?: unknown };
        if (!Array.isArray(ids) || ids.some((x) => typeof x !== "string") || ids.length > 500) {
          throw new ValidationError("ids must be a string[] of length <= 500");
        }
        if (ids.length === 0) {
          res.json({ deleted: 0 });
          return;
        }
        const result = await model.deleteMany({ _id: { $in: ids } });
        res.json({ deleted: (result as any).deletedCount ?? 0 });
      } catch (error) { next(error); }
    });
  }

  router.get("/:id", async (req, res, next) => {
    try {
      const item = await model.findById(req.params.id).lean();
      if (!item) throw new NotFoundError("Resource");
      res.json(item);
    } catch (error) { next(error); }
  });

  router.post("/", async (req, res, next) => {
    try {
      const item = await model.create({ doctor_verified: false, ...req.body });
      res.status(201).json(item);
    } catch (error) { next(error); }
  });

  router.put("/:id", async (req, res, next) => {
    try {
      const item = await model.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
      if (!item) throw new NotFoundError("Resource");
      res.json(item);
    } catch (error) { next(error); }
  });

  router.delete("/:id", async (req, res, next) => {
    try {
      const item = await model.findByIdAndDelete(req.params.id);
      if (!item) throw new NotFoundError("Resource");
      res.status(204).send();
    } catch (error) { next(error); }
  });

  return router;
}
