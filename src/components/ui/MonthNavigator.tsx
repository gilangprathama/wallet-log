'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMonthNavigation } from '@/hooks/useMonthNavigation';
import { formatMonth } from '@/lib/utils';
import Modal from '@/components/ui/Modal';

export default function MonthNavigator() {
  const {
    currentMonth,
    canGoPrev,
    goPrev,
    goNext,
    showSlideConfirm,
    setShowSlideConfirm,
    slideWindow,
    droppingMonth,
    incomingMonth,
  } = useMonthNavigation();

  return (
    <>
      <div className="flex items-center gap-3">
        <button
          onClick={goPrev}
          disabled={!canGoPrev}
          className={`p-1.5 rounded-lg border border-midnight-border text-slate-400 hover:text-slate-200 hover:bg-midnight-surface-2 transition-colors ${!canGoPrev ? 'opacity-40 cursor-not-allowed' : ''}`}
          aria-label="Previous month"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="min-w-[140px] text-center text-slate-100 font-medium text-sm">
          {formatMonth(currentMonth)}
        </span>
        <button
          onClick={goNext}
          className="p-1.5 rounded-lg border border-midnight-border text-slate-400 hover:text-slate-200 hover:bg-midnight-surface-2 transition-colors"
          aria-label="Next month"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <Modal
        isOpen={showSlideConfirm}
        onClose={() => setShowSlideConfirm(false)}
        title="Confirm Month Change"
      >
        <div className="space-y-5">
          <p className="text-slate-300 text-sm leading-relaxed">
            Moving to <span className="font-semibold text-white">{incomingMonth}</span> will
            permanently delete all data for{' '}
            <span className="font-semibold text-white">{droppingMonth}</span>. This cannot be
            undone.
          </p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setShowSlideConfirm(false)}
              className="px-4 py-2 rounded-lg border border-midnight-border text-slate-300 hover:bg-midnight-surface-2 transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              onClick={slideWindow}
              className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors text-sm font-medium"
            >
              Confirm &amp; Delete
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
