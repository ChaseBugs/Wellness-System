"use client";
import { useEffect, useState } from "react";
import { apiFetch } from "./api";

export type DashboardStats = {
  totals: Record<string, number>;
  unverified: Record<string, number>;
};

const EMPTY: DashboardStats = { totals: {}, unverified: {} };

let cached: DashboardStats = EMPTY;
let cachedAt = 0;
const TTL_MS = 60_000;

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats>(cached);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (Date.now() - cachedAt < TTL_MS && cached !== EMPTY) {
        setStats(cached);
        return;
      }
      try {
        const data = await apiFetch<DashboardStats>("/dashboard");
        cached = { totals: data.totals, unverified: data.unverified };
        cachedAt = Date.now();
        if (!cancelled) setStats(cached);
      } catch {
        // ignore — keep last known
      }
    }

    load();
    const timer = setInterval(load, TTL_MS);

    return () => { cancelled = true; clearInterval(timer); };
  }, []);

  return stats;
}
