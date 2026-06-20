'use client';

import { useFinanceStore, getTotalIncome, getTotalExpenses, getBalance } from '@/store/useFinanceStore';
import { useMonthData } from '@/hooks/useMonthData';
import { useMonthsStats } from '@/hooks/useMonthsStats';
import MonthNavigator from '@/components/ui/MonthNavigator';
import { formatIDR, formatMonth } from '@/lib/utils';
import { TrendingUp, TrendingDown, Wallet, Percent, BarChart3 } from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const CHART_COLORS = [
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#06b6d4',
  '#f43f5e',
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}

function CustomBarTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-midnight-surface border border-midnight-border rounded-lg p-3 shadow-xl">
      <p className="text-slate-300 text-xs font-medium mb-2">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          <span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-slate-400">{entry.name}:</span>
          <span className="text-slate-200 font-medium">{formatIDR(entry.value)}</span>
        </div>
      ))}
    </div>
  );
}

interface CustomPieTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: { pct: number } }>;
}

function CustomPieTooltip({ active, payload }: CustomPieTooltipProps) {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  return (
    <div className="bg-midnight-surface border border-midnight-border rounded-lg p-3 shadow-xl">
      <p className="text-slate-300 text-xs font-medium mb-1">{entry.name}</p>
      <p className="text-slate-200 text-sm font-bold">{formatIDR(entry.value)}</p>
      <p className="text-slate-400 text-xs">{entry.payload.pct.toFixed(1)}% of expenses</p>
    </div>
  );
}

export default function StatisticsPage() {
  const { currentMonth } = useFinanceStore();
  const { data, loading } = useMonthData(currentMonth);
  const { stats } = useMonthsStats();

  const totalIncome = getTotalIncome(data);
  const totalExpenses = getTotalExpenses(data);
  const balance = getBalance(data);
  const savingsRate = totalIncome > 0 ? (balance / totalIncome) * 100 : 0;

  const expenseGroups = data?.expenseGroups ?? [];

  // Pie chart data from current month's expenseGroups
  const pieData = expenseGroups
    .map((g) => ({
      name: g.name,
      value: g.items.reduce((sum, item) => sum + item.amount, 0),
    }))
    .filter((d) => d.value > 0)
    .map((d) => ({
      ...d,
      pct: totalExpenses > 0 ? (d.value / totalExpenses) * 100 : 0,
    }));

  // Bar chart: use stats from API (all months with data), take last 6 sorted ascending
  const barData = stats
    .slice()
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-6)
    .map((s) => ({
      month: formatMonth(s.month).split(' ')[0].slice(0, 3) + ' ' + formatMonth(s.month).split(' ')[1].slice(2),
      Income: s.totalIncome,
      Expenses: s.totalExpenses,
    }));

  // Sorted groups table
  const sortedGroups = expenseGroups
    .map((g) => ({
      id: g.id,
      name: g.name,
      total: g.items.reduce((sum, item) => sum + item.amount, 0),
      pct:
        totalExpenses > 0
          ? (g.items.reduce((sum, item) => sum + item.amount, 0) / totalExpenses) * 100
          : 0,
    }))
    .sort((a, b) => b.total - a.total);

  const summaryCards = [
    {
      label: 'Total Income',
      value: formatIDR(totalIncome),
      icon: TrendingUp,
      colorClass: 'text-green-400',
      bgClass: 'bg-green-400/10',
    },
    {
      label: 'Total Expenses',
      value: formatIDR(totalExpenses),
      icon: TrendingDown,
      colorClass: 'text-red-400',
      bgClass: 'bg-red-400/10',
    },
    {
      label: 'Balance',
      value: formatIDR(balance),
      icon: Wallet,
      colorClass: balance >= 0 ? 'text-blue-400' : 'text-red-400',
      bgClass: 'bg-blue-400/10',
    },
    {
      label: 'Savings Rate',
      value: `${savingsRate.toFixed(1)}%`,
      icon: Percent,
      colorClass: savingsRate > 10 ? 'text-green-400' : savingsRate > 0 ? 'text-yellow-400' : 'text-red-400',
      bgClass: 'bg-slate-400/10',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Statistics</h1>
          <p className="text-slate-500 text-sm mt-0.5">Financial insights and trends</p>
        </div>
        <MonthNavigator />
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map(({ label, value, icon: Icon, colorClass, bgClass }) => (
          <div key={label} className="bg-midnight-surface border border-midnight-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-xs font-medium">{label}</span>
              <div className={`p-1.5 rounded-lg ${bgClass}`}>
                <Icon size={14} className={colorClass} />
              </div>
            </div>
            <p className={`text-lg font-bold ${colorClass}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie chart */}
        <div className="bg-midnight-surface border border-midnight-border rounded-xl p-5">
          <h2 className="text-slate-200 font-semibold mb-4 flex items-center gap-2">
            <BarChart3 size={16} className="text-blue-400" />
            Expense Breakdown
          </h2>
          {pieData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-slate-500 text-sm">
              No expense data
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
                <Legend
                  formatter={(value) => (
                    <span className="text-slate-400 text-xs">{value}</span>
                  )}
                  iconSize={8}
                  iconType="circle"
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Bar chart */}
        <div className="bg-midnight-surface border border-midnight-border rounded-xl p-5">
          <h2 className="text-slate-200 font-semibold mb-4">Last 6 Months</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={barData} barGap={2}>
              <CartesianGrid stroke="#1a2744" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                axisLine={{ stroke: '#1a2744' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#94a3b8', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => {
                  if (v >= 1000000) return `${(v / 1000000).toFixed(0)}M`;
                  if (v >= 1000) return `${(v / 1000).toFixed(0)}K`;
                  return String(v);
                }}
                width={45}
              />
              <Tooltip content={<CustomBarTooltip />} cursor={{ fill: '#1a2744' }} />
              <Legend
                formatter={(value) => (
                  <span className="text-slate-400 text-xs">{value}</span>
                )}
                iconSize={8}
                iconType="square"
              />
              <Bar dataKey="Income" fill="#22c55e" radius={[3, 3, 0, 0]} maxBarSize={30} />
              <Bar dataKey="Expenses" fill="#ef4444" radius={[3, 3, 0, 0]} maxBarSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Expense groups table */}
      {sortedGroups.length > 0 && (
        <div className="bg-midnight-surface border border-midnight-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-midnight-border">
            <h2 className="text-slate-200 font-semibold">Expense Groups Detail</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-midnight-border">
                  <th className="text-left px-5 py-3 text-slate-400 text-xs font-medium uppercase tracking-wider">
                    Group
                  </th>
                  <th className="text-right px-5 py-3 text-slate-400 text-xs font-medium uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="text-right px-5 py-3 text-slate-400 text-xs font-medium uppercase tracking-wider">
                    % of Total
                  </th>
                  <th className="text-right px-5 py-3 text-slate-400 text-xs font-medium uppercase tracking-wider hidden sm:table-cell">
                    Bar
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-midnight-border">
                {sortedGroups.map((g, i) => (
                  <tr key={g.id} className="hover:bg-midnight-surface-2 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                        />
                        <span className="text-slate-200 text-sm">{g.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right text-slate-200 text-sm font-medium">
                      {formatIDR(g.total)}
                    </td>
                    <td className="px-5 py-3 text-right text-slate-400 text-sm">
                      {g.pct.toFixed(1)}%
                    </td>
                    <td className="px-5 py-3 hidden sm:table-cell">
                      <div className="flex items-center justify-end">
                        <div className="w-24 h-1.5 bg-midnight-surface-2 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${Math.min(g.pct, 100)}%`,
                              backgroundColor: CHART_COLORS[i % CHART_COLORS.length],
                            }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-midnight-border bg-midnight-surface-2">
                  <td className="px-5 py-3 text-slate-400 text-sm font-medium">Total</td>
                  <td className="px-5 py-3 text-right text-red-400 font-bold text-sm">
                    {formatIDR(totalExpenses)}
                  </td>
                  <td className="px-5 py-3 text-right text-slate-400 text-sm">100%</td>
                  <td className="px-5 py-3 hidden sm:table-cell" />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
