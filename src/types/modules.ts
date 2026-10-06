/**
 * Types for the modules that have no backend yet (Expenses, Suppliers,
 * Customers). These screens are backed by mock data only, per the assignment.
 */

export type ExpenseCategory = 'Rent' | 'Utilities' | 'Salaries' | 'Transport' | 'Maintenance' | 'Marketing' | 'Other';

export interface Expense {
  id: string;
  title: string;
  category: ExpenseCategory;
  /** Positive amount in TZS. */
  amount: number;
  date: string;
  note?: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  /** Number of products supplied. */
  itemsSupplied: number;
  totalPurchases: number;
  status: 'Active' | 'On hold';
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  /** Total spent, in TZS. */
  totalSpent: number;
  orders: number;
  lastVisit: string;
  status: 'Active' | 'New';
}