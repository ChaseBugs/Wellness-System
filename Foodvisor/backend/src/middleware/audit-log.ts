import type { NextFunction, Request, Response } from "express";
import { AuditLog } from "../models/audit-log.js";
import logger from "../utils/logger.js";

type Action = "create" | "update" | "delete" | "bulk-verify" | "bulk-delete";

function methodToAction(method: string, path: string): Action | null {
  const isBulk = path.endsWith("/bulk") || path.endsWith("/bulk-verify");
  if (method === "POST" && !isBulk) return "create";
  if (method === "PUT") return "update";
  if (method === "DELETE" && !isBulk) return "delete";
  if (method === "PATCH" && path.endsWith("/bulk-verify")) return "bulk-verify";
  if (method === "DELETE" && path.endsWith("/bulk")) return "bulk-delete";
  return null;
}

export function auditLog(resource: string) {
  return function (req: Request, res: Response, next: NextFunction) {
    const action = methodToAction(req.method, req.originalUrl || req.path);
    if (!action) return next();

    const byHeader = req.headers["x-admin-user"];
    const by = typeof byHeader === "string" ? byHeader : Array.isArray(byHeader) ? byHeader[0] : "anonymous";
    const reqId = req.id;

    res.on("finish", () => {
      if (res.statusCode >= 400) return;
      const ids: string[] = [];
      const paramId = (req.params as Record<string, string | string[] | undefined>)?.id;
      if (typeof paramId === "string") ids.push(paramId);
      const body = req.body as { ids?: unknown };
      if (Array.isArray(body?.ids)) {
        ids.push(...(body.ids as unknown[]).filter((x) => typeof x === "string").slice(0, 500) as string[]);
      }

      AuditLog.create({ action, resource, ids, by, reqId }).catch((err) => {
        logger.warnWithEmoji("⚠️", "audit-log write failed", "AUDIT", { reqId, err: err instanceof Error ? err.message : String(err) });
      });
    });

    next();
  };
}
