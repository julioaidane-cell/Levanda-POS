import type { Href } from 'expo-router';

/**
 * The horizontal "section tabs" shown under the app header on every main screen.
 *
 * The list is the single source of truth for both the pill labels and the
 * active-pill logic: a pill is active when the current pathname matches (or is
 * nested under) `path`, so the selection is always derived from the route and
 * survives back navigation and deep links.
 */
export interface SectionTab {
  key: string;
  label: string;
  /** Destination used by `router.replace` when the pill is tapped. */
  href: Href;
  /** Pathname that marks this pill active. Nested routes also match. */
  path: string;
}

export const SECTIONS: readonly SectionTab[] = [
  { key: 'home', label: 'Home', href: '/', path: '/' },
  { key: 'products', label: 'Products', href: '/products', path: '/products' },
  { key: 'sell', label: 'Sell', href: '/sell', path: '/sell' },
  { key: 'orders', label: 'Orders', href: '/orders', path: '/orders' },
  { key: 'sales-reports', label: 'Sales Reports', href: '/sales-reports', path: '/sales-reports' },
  { key: 'expenses', label: 'Expenses', href: '/expenses', path: '/expenses' },
  { key: 'customers', label: 'Customers', href: '/customers', path: '/customers' },
  { key: 'suppliers', label: 'Suppliers', href: '/suppliers', path: '/suppliers' },
];

/** True when `pathname` belongs to the given section (exact or nested). */
export function isSectionActive(section: SectionTab, pathname: string): boolean {
  if (section.path === '/') return pathname === '/';
  return pathname === section.path || pathname.startsWith(`${section.path}/`);
}

/** The section matching the current pathname, if any. */
export function activeSectionKey(pathname: string): string | null {
  return SECTIONS.find((section) => isSectionActive(section, pathname))?.key ?? null;
}
