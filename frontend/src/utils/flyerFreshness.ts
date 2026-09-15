/** Flyer date helpers for Offers UI. */

export function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Whole days remaining until end_date (inclusive). Negative = expired. */
export function daysLeftUntil(endDate: string, today = todayIsoDate()): number | null {
  if (!endDate) return null;
  const end = Date.parse(`${endDate}T23:59:59Z`);
  const now = Date.parse(`${today}T12:00:00Z`);
  if (Number.isNaN(end) || Number.isNaN(now)) return null;
  return Math.ceil((end - now) / 86_400_000);
}

export function flyerFreshnessLabel(
  endDate: string,
  t: (key: string, opts?: Record<string, unknown>) => string,
  today = todayIsoDate(),
): { key: 'expired' | 'lastDay' | 'daysLeft'; label: string; tone: 'error' | 'warning' | 'success' } | null {
  const days = daysLeftUntil(endDate, today);
  if (days == null) return null;
  if (days < 0) return { key: 'expired', label: t('offers.expired'), tone: 'error' };
  if (days === 0) return { key: 'lastDay', label: t('offers.lastDay'), tone: 'warning' };
  return {
    key: 'daysLeft',
    label: t('offers.daysLeft', { count: days }),
    tone: days <= 2 ? 'warning' : 'success',
  };
}
