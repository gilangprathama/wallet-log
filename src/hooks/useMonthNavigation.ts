'use client';
import { useState } from 'react';
import { useFinanceStore } from '@/store/useFinanceStore';
import { prevMonth, nextMonth, addMonths, formatMonth } from '@/lib/utils';

export function useMonthNavigation() {
  const { currentMonth, setCurrentMonth, windowStart, setWindowStart } = useFinanceStore();
  const [showSlideConfirm, setShowSlideConfirm] = useState(false);

  const windowEnd = addMonths(windowStart, 2);
  const canGoPrev = currentMonth > windowStart;
  const isAtWindowEnd = currentMonth >= windowEnd;

  function goPrev() {
    if (canGoPrev) setCurrentMonth(prevMonth(currentMonth));
  }

  function goNext() {
    if (!isAtWindowEnd) {
      setCurrentMonth(nextMonth(currentMonth));
    } else {
      setShowSlideConfirm(true);
    }
  }

  async function slideWindow() {
    await fetch(`/api/months/${windowStart}`, { method: 'DELETE' });
    const newWindowStart = nextMonth(windowStart);
    const newCurrentMonth = nextMonth(windowEnd);
    setWindowStart(newWindowStart);
    setCurrentMonth(newCurrentMonth);
    setShowSlideConfirm(false);
  }

  return {
    currentMonth,
    windowStart,
    windowEnd,
    canGoPrev,
    isAtWindowEnd,
    goPrev,
    goNext,
    showSlideConfirm,
    setShowSlideConfirm,
    slideWindow,
    droppingMonth: formatMonth(windowStart),
    incomingMonth: formatMonth(nextMonth(windowEnd)),
  };
}
