'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatMonth, prevMonth, nextMonth } from '@/lib/utils';

interface MonthPickerProps {
  month: string;
  onChange: (month: string) => void;
}

export default function MonthPicker({ month, onChange }: MonthPickerProps) {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => onChange(prevMonth(month))}
        className="p-1.5 rounded-lg border border-midnight-border text-slate-400 hover:text-slate-200 hover:bg-midnight-surface-2 transition-colors"
        aria-label="Previous month"
      >
        <ChevronLeft size={16} />
      </button>
      <span className="min-w-[140px] text-center text-slate-100 font-medium text-sm">
        {formatMonth(month)}
      </span>
      <button
        onClick={() => onChange(nextMonth(month))}
        className="p-1.5 rounded-lg border border-midnight-border text-slate-400 hover:text-slate-200 hover:bg-midnight-surface-2 transition-colors"
        aria-label="Next month"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
