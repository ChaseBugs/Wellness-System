'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '@/lib/api';
import { AxiosRequestConfig } from 'axios';

export interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

// Overload for array types: data defaults to [] so it's always defined
export function useFetch<T extends unknown[]>(url: string | null, config?: AxiosRequestConfig): Omit<FetchState<T>, 'data'> & { data: T };
export function useFetch<T>(url: string | null, config?: AxiosRequestConfig): FetchState<T>;

/**
 * Generic data-fetching hook. Re-fetches when `url` or `params` change.
 *
 * Usage:
 *   const { data, loading, error } = useFetch<Recipe[]>('/recipes');
 *   const { data } = useFetch<Recipe[]>('/recipes', { params: { type: 'puree' } });
 */
export function useFetch<T>(
  url: string | null,
  config?: AxiosRequestConfig,
): FetchState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(!!url);
  const [error, setError]     = useState<string | null>(null);

  // Stable serialized key to detect real config changes
  const configKey = JSON.stringify(config);
  const counter   = useRef(0);

  const fetch = useCallback(() => {
    if (!url) return;
    const id = ++counter.current;
    setLoading(true);
    setError(null);
    api.get<{ success: boolean; data: T }>(url, config)
      .then(r => {
        if (id !== counter.current) return; // stale
        setData(r.data?.data ?? (r.data as unknown as T));
      })
      .catch(err => {
        if (id !== counter.current) return;
        const msg: string = err?.response?.data?.error?.message
          ?? err?.response?.data?.error
          ?? err?.message
          ?? 'Failed to load data.';
        setError(msg);
      })
      .finally(() => {
        if (id === counter.current) setLoading(false);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, configKey]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
}
