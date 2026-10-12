/**
 * Small shared value formatters. Keeps screen code free of layout maths and
 * guarantees prices and dates look consistent everywhere.
 */

import { getCurrencyCode } from './currency';

/**
 * Amounts are prefixed with the company's currency code when it is known.
 * Falls back to a bare number rather than assuming a currency.
 */
export function formatCurrency(value: string | number | null | undefined): string {
  const amount = toNumber(value);
  if (amount === null) return '—';
  const formatted = amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const code = getCurrencyCode();
  return code === null ? formatted : `${code} ${formatted}`;
}

export function formatNumber(value: string | number | null | undefined): string {
  const amount = toNumber(value);
  if (amount === null) return '—';
  return amount.toLocaleString('en-US', { maximumFractionDigits: 2 });
}

/**
 * Compact currency for tight surfaces (stat tiles, list rows) where the full
 * value would clip — `350000` → `TZS 350K`, `12500000` → `TZS 12.5M`. Detail
 * screens keep using `formatCurrency` so the exact amount is always available.
 */
export function formatCurrencyCompact(value: string | number | null | undefined): string {
  const amount = toNumber(value);
  if (amount === null) return '—';
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';
  const trim = (n: number) => (Math.round(n * 10) / 10).toString();

  let body: string;
  if (abs >= 1_000_000_000) body = `${trim(abs / 1_000_000_000)}B`;
  else if (abs >= 1_000_000) body = `${trim(abs / 1_000_000)}M`;
  else if (abs >= 1_000) body = `${trim(abs / 1_000)}K`;
  else body = abs.toLocaleString('en-US', { maximumFractionDigits: 2 });

  const code = getCurrencyCode();
  return code === null ? `${sign}${body}` : `${code} ${sign}${body}`;
}

/** `"25.00"` and `25` both become `25`. */
export function toNumber(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined || value === '') return null;
  const parsed = typeof value === 'number' ? value : Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  const parsed = new Date(value.includes('T') ? value : value.replace(' ', 'T'));
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return '—';
  const parsed = new Date(value.includes('T') ? value : value.replace(' ', 'T'));
  if (Number.isNaN(parsed.getTime())) return value;
  return `${parsed.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}, ${parsed.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  })}`;
}

/** `"Kanzu Estate, Plot 1"` style one-liner; empty string when nothing is set. */
export function joinLocation(parts: (string | null | undefined)[]): string {
  return parts
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part))
    .join(', ');
}

export function initialsOf(name: string | null | undefined): string {
  if (!name) return '?';
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  const first = words[0]?.[0] ?? '';
  const second = words.length > 1 ? (words[words.length - 1]?.[0] ?? '') : '';
  return `${first}${second}`.toUpperCase();
}