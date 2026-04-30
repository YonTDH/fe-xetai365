function toWholeVnd(value: string | number | null | undefined) {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? Math.round(value) : 0;
  }

  const normalized = String(value || '').replace(/[^\d-]/g, '');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? Math.round(parsed) : 0;
}

export function formatCurrencyVnd(value: string | number | null | undefined) {
  const amount = toWholeVnd(value);
  return `${amount.toLocaleString('vi-VN')}VNĐ`;
}
