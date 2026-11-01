export interface PageQuery {
  page: number;
  limit: number;
  offset: number;
}

export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export const MAX_PAGE_LIMIT = 100;

export function toPageQuery(page?: unknown, limit?: unknown, defaultLimit = 20): PageQuery {
  const parsedPage = Math.max(1, Number.parseInt(String(page ?? 1), 10) || 1);
  const parsedLimit = Math.min(MAX_PAGE_LIMIT, Math.max(1, Number.parseInt(String(limit ?? defaultLimit), 10) || defaultLimit));
  return { page: parsedPage, limit: parsedLimit, offset: (parsedPage - 1) * parsedLimit };
}

export function toPage<T, R>(items: T[], total: number, query: PageQuery, map: (item: T) => R): Page<R> {
  return { items: items.map(map), total, page: query.page, limit: query.limit };
}
