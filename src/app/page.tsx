'use client';

import { useState } from 'react';
import { useFinanceStore, getTotalIncome, getTotalExpenses, getBalance, getBalanceStatus } from '@/store/useFinanceStore';
import { useMonthData } from '@/hooks/useMonthData';
import MonthNavigator from '@/components/ui/MonthNavigator';
import { formatIDR, prevMonth, formatMonth } from '@/lib/utils';
import { TrendingUp, TrendingDown, Wallet, DollarSign, Copy } from 'lucide-react';

export default function DashboardPage() {
  const { currentMonth } = useFinanceStore();
  const { data, loading, refresh } = useMonthData(currentMonth);
  const [copying, setCopying] = useState(false);

  const totalIncome = getTotalIncome(data);
  const totalExpenses = getTotalExpenses(data);
  const balance = getBalance(data);
  const status = getBalanceStatus(data);
  const savingsRate = totalIncome > 0 ? (balance / totalIncome) * 100 : 0;

  const expenseGroups = data?.expenseGroups ?? [];
  const prevMonthStr = prevMonth(currentMonth);

  const statusConfig = {
    green: {
      label: '✓ Healthy',
      textClass: 'text-green-400',
      bgClass: 'bg-green-400/10',
      borderClass: 'border-green-400/30',
    },
    yellow: {
      label: '⚠ Watch spending',
      textClass: 'text-yellow-400',
      bgClass: 'bg-yellow-400/10',
      borderClass: 'border-yellow-400/30',
    },
    red: {
      label: '✗ Over budget',
      textClass: 'text-red-400',
      bgClass: 'bg-red-400/10',
      borderClass: 'border-red-400/30',
    },
  };

  const sc = statusConfig[status];

  async function handleCopy() {
    setCopying(true);
    await fetch(`/api/months/${currentMonth}/copy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: prevMonthStr }),
    });
    setCopying(false);
    refresh();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400" />
      </div>
    );
  }

  const isEmpty = !loading && data !== null && data.income.length === 0 && data.expenseGroups.length === 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Dashboard</h1>
          <p className="text-slate-500 text-sm mt-0.5">Financial overview</p>
        </div>
        <MonthNavigator />
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Income card */}
        <div className="bg-midnight-surface border border-midnight-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-slate-400 text-sm font-medium">Total Income</span>
            <div className="p-2 rounded-lg bg-green-400/10">
              <TrendingUp size={16} className="text-green-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-green-400">{formatIDR(totalIncome)}</p>
          <p className="text-slate-500 text-xs mt-1">
            {data?.income.length ?? 0} source{(data?.income.length ?? 0) !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Expenses card */}
        <div className="bg-midnight-surface border border-midnight-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-slate-400 text-sm font-medium">Total Expenses</span>
            <div className="p-2 rounded-lg bg-red-400/10">
              <TrendingDown size={16} className="text-red-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-red-400">{formatIDR(totalExpenses)}</p>
          <p className="text-slate-500 text-xs mt-1">
            {expenseGroups.length} group{expenseGroups.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Balance card */}
        <div className={`bg-midnight-surface border rounded-xl p-5 ${sc.borderClass}`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-slate-400 text-sm font-medium">Balance</span>
            <div className={`p-2 rounded-lg ${sc.bgClass}`}>
              <Wallet size={16} className={sc.textClass} />
            </div>
          </div>
          <p className={`text-2xl font-bold ${sc.textClass}`}>{formatIDR(balance)}</p>
          <div className="flex items-center justify-between mt-1">
            <span className={`text-xs font-medium ${sc.textClass}`}>{sc.label}</span>
            <span className="text-slate-500 text-xs">{savingsRate.toFixed(1)}% of income</span>
          </div>
        </div>
      </div>

      {/* Copy from previous month card */}
      {isEmpty && (
        <div className="bg-midnight-surface border border-dashed border-midnight-border rounded-xl p-6 flex flex-col items-center gap-3 text-center">
          <div className="p-3 rounded-full bg-blue-500/10">
            <Copy size={20} className="text-blue-400" />
          </div>
          <div>
            <p className="text-slate-200 font-medium">No data for this month</p>
            <p className="text-slate-500 text-sm mt-1">
              Copy all income and expenses from{' '}
              <span className="text-slate-300">{formatMonth(prevMonthStr)}</span> to get started quickly
            </p>
          </div>
          <button
            onClick={handleCopy}
            disabled={copying}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-lg text-sm font-medium transition-colors"
          >
            {copying ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            ) : (
              <Copy size={15} />
            )}
            Copy from {formatMonth(prevMonthStr)}
          </button>
        </div>
      )}

      {/* Bottom section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense groups overview */}
        <div className="bg-midnight-surface border border-midnight-border rounded-xl p-5">
          <h2 className="text-slate-200 font-semibold mb-4 flex items-center gap-2">
            <DollarSign size={16} className="text-blue-400" />
            Expense Breakdown
          </h2>
          {expenseGroups.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-8">No expenses yet</p>
          ) : (
            <div className="space-y-3">
              {expenseGroups
                .map((g) => ({
                  ...g,
                  total: g.items.reduce((sum, item) => sum + item.amount, 0),
                }))
                .sort((a, b) => b.total - a.total)
                .map((g) => {
                  const pct = totalExpenses > 0 ? (g.total / totalExpenses) * 100 : 0;
                  return (
                    <div key={g.id}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-slate-300 text-sm truncate mr-2">{g.name}</span>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-slate-400 text-xs">{pct.toFixed(1)}%</span>
                          <span className="text-slate-200 text-sm font-medium">{formatIDR(g.total)}</span>
                        </div>
                      </div>
                      <div className="h-1.5 bg-midnight-surface-2 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full transition-all"
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {/* Income sources */}
        <div className="bg-midnight-surface border border-midnight-border rounded-xl p-5">
          <h2 className="text-slate-200 font-semibold mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-green-400" />
            Income Sources
          </h2>
          {!data || data.income.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-8">No income recorded</p>
          ) : (
            <div className="space-y-2">
              {data.income.map((src) => (
                <div
                  key={src.id}
                  className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-midnight-surface-2"
                >
                  <div>
                    <p className="text-slate-200 text-sm font-medium">{src.name}</p>
                    {src.note && (
                      <p className="text-slate-500 text-xs mt-0.5">{src.note}</p>
                    )}
                  </div>
                  <span className="text-green-400 font-medium text-sm">{formatIDR(src.amount)}</span>
                </div>
              ))}
              <div className="flex items-center justify-between pt-2 border-t border-midnight-border mt-2">
                <span className="text-slate-400 text-sm font-medium">Total</span>
                <span className="text-green-400 font-bold">{formatIDR(totalIncome)}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
