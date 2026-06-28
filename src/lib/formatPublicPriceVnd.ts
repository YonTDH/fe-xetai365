import { formatCurrencyVnd } from './formatCurrencyVnd';

function isPlainNumberText(value: string) {
  return /^[\d\s.,-]+$/.test(value.trim());
}

function toWholeVnd(value: string | number | null | undefined) {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? Math.round(value) : 0;
  }

  const normalized = String(value || '').replace(/[^\d-]/g, '');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? Math.round(parsed) : 0;
}

export function formatPublicPriceVnd(value: string | number | null | undefined) {
  const normalized = typeof value === 'number' ? String(value) : String(value || '').trim();
  if (!normalized) {
    return '';
  }

  if (!isPlainNumberText(normalized)) {
    return normalized;
  }

  const amount = toWholeVnd(normalized);
  if (!Number.isFinite(amount) || amount <= 0) {
    return '';
  }

  return formatCurrencyVnd(normalized);
}
