'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MonthRecord } from '@/types/finance';
import { getCurrentMonth } from '@/lib/utils';

interface FinanceUIState {
  currentMonth: string;
  setCurrentMonth: (month: string) => void;
  windowStart: string;
  setWindowStart: (month: string) => void;
}

export const useFinanceStore = create<FinanceUIState>()(
  persist(
    (set) => ({
      currentMonth: getCurrentMonth(),
      setCurrentMonth: (month) => set({ currentMonth: month }),
      windowStart: '2026-06',
      setWindowStart: (month) => set({ windowStart: month }),
    }),
    {
      name: 'walletlog-ui',
      partialize: (state) => ({ windowStart: state.windowStart }),
    }
  )
);

// Computed helpers that work on a MonthRecord | null
export function getTotalIncome(data: MonthRecord | null): number {
  if (!data) return 0;
  return data.income.reduce((sum, s) => sum + s.amount, 0);
}

export function getTotalExpenses(data: MonthRecord | null): number {
  if (!data) return 0;
  return data.expenseGroups.reduce(
    (sum, g) => sum + g.items.reduce((gs, item) => gs + item.amount, 0),
    0
  );
}

export function getBalance(data: MonthRecord | null): number {
  return getTotalIncome(data) - getTotalExpenses(data);
}

export function getBalanceStatus(data: MonthRecord | null): 'green' | 'yellow' | 'red' {
  const income = getTotalIncome(data);
  const balance = getBalance(data);
  if (income === 0) return balance <= 0 ? 'red' : 'green';
  if (balance <= 0) return 'red';
  if (balance / income <= 0.1) return 'yellow';
  return 'green';
}
