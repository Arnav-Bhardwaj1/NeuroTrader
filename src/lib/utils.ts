export function formatCurrency(value: number, compact = false): string {
  if (compact && Math.abs(value) >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (compact && Math.abs(value) >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  if (compact && Math.abs(value) >= 1e3) return `$${(value / 1e3).toFixed(1)}K`;
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}

export function formatPercent(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
}

export function formatVolume(value: number): string {
  if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
  return value.toString();
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function getChangeColor(value: number): string {
  return value >= 0 ? 'var(--accent-green)' : 'var(--accent-red)';
}

export function getSignalColor(action: 'BUY' | 'SELL' | 'HOLD'): string {
  switch (action) {
    case 'BUY': return 'var(--accent-green)';
    case 'SELL': return 'var(--accent-red)';
    case 'HOLD': return 'var(--accent-amber)';
  }
}
