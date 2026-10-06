import type { Expense } from '@/types/modules';

/**
 * Mock expenses. These modules have no documented endpoints, so the data is
 * local and clearly separated from anything that comes from the API.
 */
export const mockExpenses: Expense[] = [
  {
    id: 'exp-001',
    title: 'Monthly shop rent',
    category: 'Rent',
    amount: 450000,
    date: '2026-10-01',
    note: 'Kanzu Estate, main hall',
  },
  {
    id: 'exp-002',
    title: 'NEECSA electricity bill',
    category: 'Utilities',
    amount: 98500,
    date: '2026-09-28',
    note: 'August reading',
  },
  {
    id: 'exp-003',
    title: 'Sales assistant salary',
    category: 'Salaries',
    amount: 320000,
    date: '2026-09-25',
    note: 'Two staff',
  },
  {
    id: 'exp-004',
    title: 'Delivery fuel',
    category: 'Transport',
    amount: 46500,
    date: '2026-09-22',
  },
  {
    id: 'exp-005',
    title: 'Freezer servicing',
    category: 'Maintenance',
    amount: 75000,
    date: '2026-09-18',
    note: 'Chest freezer #2',
  },
  {
    id: 'exp-006',
    title: 'Bannermill flyers',
    category: 'Marketing',
    amount: 60000,
    date: '2026-09-10',
  },
  {
    id: 'exp-007',
    title: 'Packaging bags',
    category: 'Other',
    amount: 27500,
    date: '2026-09-05',
  },
];