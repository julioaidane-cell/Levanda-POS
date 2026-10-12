/**
 * Local sample notifications. The Levanda API has no notifications endpoint
 * yet, so the app runs on this seed data behind `notificationsStore` — swap the
 * store's source for a real request when the endpoint lands.
 */

export type NotificationKind = 'low_stock' | 'new_order' | 'sales_summary';

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  message: string;
  /** ISO timestamp used to render a relative time. */
  createdAt: string;
  read: boolean;
}

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;

/** Timestamps are relative to load so the feed always looks recent. */
function ago(milliseconds: number): string {
  return new Date(Date.now() - milliseconds).toISOString();
}

export const mockNotifications: AppNotification[] = [
  {
    id: 'ntf-low-stock-sugar',
    kind: 'low_stock',
    title: 'Low stock: Sugar 1kg',
    message: 'Only 3 left in Kilimani Shop — reorder soon to avoid running out.',
    createdAt: ago(18 * MINUTE),
    read: false,
  },
  {
    id: 'ntf-order-1042',
    kind: 'new_order',
    title: 'New order #1042',
    message: 'Amina Hassan placed an order worth TZS 45,000.',
    createdAt: ago(2 * HOUR),
    read: false,
  },
  {
    id: 'ntf-low-stock-cooking-oil',
    kind: 'low_stock',
    title: 'Low stock: Cooking oil 2L',
    message: 'Down to 5 units — below the minimum stock level.',
    createdAt: ago(5 * HOUR),
    read: false,
  },
  {
    id: 'ntf-daily-sales',
    kind: 'sales_summary',
    title: 'Daily sales summary',
    message: 'Yesterday you made TZS 812,000 across 34 orders.',
    createdAt: ago(20 * HOUR),
    read: true,
  },
];
