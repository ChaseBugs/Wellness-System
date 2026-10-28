export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

export type FieldType = "text" | "number" | "textarea" | "select" | "date" | "tags" | "boolean";

export type ResourceField = {
  name: string;
  label: string;
  type: FieldType;
  options?: string[];
  required?: boolean;
};

export type ResourceColumn = {
  key: string;
  label: string;
  kind?: "image" | "boolean" | "date";
};

type ApiEnvelope<T> = {
  success?: boolean;
  data?: T;
  error?: {
    code?: string;
    message?: string;
    details?: unknown;
    reqId?: string;
  };
  meta?: Record<string, unknown>;
};

export class ApiError extends Error {
  code?: string;
  details?: unknown;
  reqId?: string;
  status?: number;
  constructor(message: string, opts: { code?: string; details?: unknown; reqId?: string; status?: number } = {}) {
    super(message);
    this.name = "ApiError";
    this.code = opts.code;
    this.details = opts.details;
    this.reqId = opts.reqId;
    this.status = opts.status;
  }
}

function isEnvelope<T>(value: unknown): value is ApiEnvelope<T> {
  return Boolean(value && typeof value === "object" && "success" in value);
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    },
    cache: "no-store"
  });

  if (!response.ok) {
    const body: ApiEnvelope<unknown> = await response.json().catch(() => ({}));
    const e = body.error;
    throw new ApiError(e?.message ?? `Request failed: ${response.status}`, {
      code: e?.code,
      details: e?.details,
      reqId: e?.reqId,
      status: response.status
    });
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const body = await response.json();
  if (isEnvelope<T>(body)) {
    if (body.success === false) {
      throw new ApiError(body.error?.message ?? `Request failed: ${response.status}`, {
        code: body.error?.code,
        details: body.error?.details,
        reqId: body.error?.reqId,
        status: response.status
      });
    }
    return body.data as T;
  }

  return body as T;
}

export async function bulkVerify(endpoint: string, ids: string[], doctor_verified: boolean) {
  return apiFetch<{ matched: number; modified: number }>(`${endpoint}/bulk-verify`, {
    method: "PATCH",
    body: JSON.stringify({ ids, doctor_verified })
  });
}

export async function bulkDelete(endpoint: string, ids: string[]) {
  return apiFetch<{ deleted: number }>(`${endpoint}/bulk`, {
    method: "DELETE",
    body: JSON.stringify({ ids })
  });
}
