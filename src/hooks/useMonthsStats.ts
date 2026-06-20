'use client';

import { useState, useEffect } from 'react';

export interface MonthStat {
  month: string;
  totalIncome: number;
  totalExpenses: number;
}

export function useMonthsStats() {
  const [stats, setStats] = useState<MonthStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/months')
      .then((r) => r.json())
      .then(setStats)
      .catch(() => setStats([]))
      .finally(() => setLoading(false));
  }, []);

  return { stats, loading };
}
