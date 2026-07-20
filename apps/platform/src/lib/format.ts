/** Shared helpers for Control Plane pages. */

export function formatBytes(raw: string | number): string {
  const bytes = typeof raw === 'string' ? Number(raw) : raw;
  if (Number.isNaN(bytes)) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
}

export function formatMrrMinor(mrrMinor: number, currency = 'EUR'): string {
  if (!mrrMinor) return '—';
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(mrrMinor / 100);
}
