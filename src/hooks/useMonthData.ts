'use client';

import { useState, useEffect, useCallback } from 'react';
import { MonthRecord } from '@/types/finance';

export function useMonthData(month: string) {
  const [data, setData] = useState<MonthRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Silent fetch — does NOT touch loading state, so no scroll reset
  const refresh = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch(`/api/months/${month}`);
      if (!res.ok) throw new Error('Failed to fetch');
      setData(await res.json());
    } catch {
      setError('Failed to load data');
    }
  }, [month]);

  // Initial load + month change → show spinner, clear stale data
  useEffect(() => {
    setLoading(true);
    setData(null);
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  return { data, loading, error, refresh };
}
