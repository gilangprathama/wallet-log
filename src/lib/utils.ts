export function formatIDR(amount: number): string {
  return `Rp ${Math.floor(amount).toLocaleString('en-US')}`;
}

// Strip non-digits, reformat with commas: "1000000" → "1,000,000"
export function formatInputNumber(raw: string): string {
  const digits = raw.replace(/[^0-9]/g, '');
  if (!digits) return '';
  return parseInt(digits, 10).toLocaleString('en-US');
}

// Strip commas, parse to integer: "1,000,000" → 1000000
export function parseInputNumber(formatted: string): number {
  const digits = formatted.replace(/[^0-9]/g, '');
  return digits ? parseInt(digits, 10) : 0;
}

/**
 * Format month string "YYYY-MM" to display "June 2026"
 */
export function formatMonth(month: string): string {
  const [year, mon] = month.split('-');
  const date = new Date(parseInt(year), parseInt(mon) - 1, 1);
  return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
}

/**
 * Get current month as "YYYY-MM"
 */
export function getCurrentMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Generate previous month
 */
export function prevMonth(month: string): string {
  const [year, mon] = month.split('-').map(Number);
  const date = new Date(year, mon - 2, 1); // mon-1 is current, mon-2 is prev
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

/**
 * Generate next month
 */
export function nextMonth(month: string): string {
  const [year, mon] = month.split('-').map(Number);
  const date = new Date(year, mon, 1); // mon is next month (0-indexed: mon+1-1)
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

export function addMonths(month: string, n: number): string {
  let m = month;
  for (let i = 0; i < n; i++) m = nextMonth(m);
  return m;
}

/**
 * Get last 6 months as array from given month (inclusive, descending)
 */
export function getLast6Months(month: string): string[] {
  const result: string[] = [month];
  let current = month;
  for (let i = 0; i < 5; i++) {
    current = prevMonth(current);
    result.push(current);
  }
  return result;
}
