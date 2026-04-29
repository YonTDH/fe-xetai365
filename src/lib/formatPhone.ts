export function formatPhoneDisplay(value: string) {
  const digits = String(value || '').replace(/\D/g, '');

  if (digits.length === 10 || digits.length === 11) {
    return `${digits.slice(0, 4)}.${digits.slice(4, 7)}.${digits.slice(7)}`;
  }

  return String(value || '').trim();
}
