'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { AxiosRequestConfig } from 'axios';

type Method = 'post' | 'put' | 'patch' | 'delete';

export interface MutationState<T> {
  loading: boolean;
  error: string | null;
  data: T | null;
  mutate: (body?: unknown, config?: AxiosRequestConfig) => Promise<T | null>;
  reset: () => void;
}

/**
 * Generic mutation hook for POST / PUT / PATCH / DELETE.
 *
 * Usage:
 *   const { mutate, loading } = useMutation<Article>('post', '/articles');
 *   await mutate({ title: 'Hello' });
 *
 *   const { mutate } = useMutation('delete', `/articles/${id}`);
 *   await mutate();
 */
export function useMutation<T = unknown>(
  method: Method,
  url: string,
): MutationState<T> {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const [data,    setData]    = useState<T | null>(null);

  const mutate = async (body?: unknown, config?: AxiosRequestConfig): Promise<T | null> => {
    setLoading(true);
    setError(null);
    try {
      const res = method === 'delete'
        ? await api.delete<{ data: T }>(url, config)
        : await (api[method] as (u: string, d?: unknown, c?: AxiosRequestConfig) => Promise<{ data: { data: T } }>)(url, body, config);

      const result: T = (res.data as { data: T })?.data ?? (res.data as unknown as T);
      setData(result);
      return result;
    } catch (err: unknown) {
      const msg: string = (err as { response?: { data?: { error?: { message?: string } | string } } })
        ?.response?.data?.error as string
        ?? (err as Error)?.message
        ?? 'An error occurred while processing the request.';
      setError(typeof msg === 'object' ? JSON.stringify(msg) : msg);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, data, mutate, reset: () => { setError(null); setData(null); } };
}
