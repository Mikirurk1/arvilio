export function formatMoneyMinor(minor: number, currency: string): string {
  return `${(minor / 100).toFixed(2)} ${currency}`;
}
