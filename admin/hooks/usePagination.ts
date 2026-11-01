import { useState, useEffect, useMemo } from 'react';

const PAGE_SIZE = 10;

export function usePagination<T>(items: T[], resetDeps?: unknown[]) {
  const [page, setPage] = useState(1);

  // Reset to page 1 whenever the source list changes (filter/search applied)
  useEffect(() => {
    setPage(1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length, ...(resetDeps ?? [])]);

  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));

  const paged = useMemo(
    () => items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [items, page]
  );

  return { paged, page, totalPages, setPage };
}
