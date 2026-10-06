export function formatCurrency(value: number, decimals: number = 2): string {
  if (value === undefined || value === null || isNaN(value)) return '$0.00';
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value).replace('USD', '$');
}

export function formatPercent(value: number, decimals: number = 2): string {
  if (value === undefined || value === null || isNaN(value)) return '0.00%';
  // value is usually in 0-1 or 0-100 range depending on context
  const pct = value <= 1 && value >= -1 ? value * 100 : value;
  return `${pct.toFixed(decimals)}%`;
}

export function formatNumber(value: number, decimals: number = 2): string {
  if (value === undefined || value === null || isNaN(value)) return '0.00';
  return new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}
