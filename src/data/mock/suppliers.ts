import type { Supplier } from '@/types/modules';

/** Mock suppliers — no backend endpoint is documented for this module. */
export const mockSuppliers: Supplier[] = [
  {
    id: 'sup-001',
    name: 'Tanzania Distributors Ltd',
    contactPerson: 'Joseph Mwakalinga',
    phone: '+255 754 112 233',
    email: 'orders@tzdistributors.co.tz',
    itemsSupplied: 34,
    totalPurchases: 8420000,
    status: 'Active',
  },
  {
    id: 'sup-002',
    name: 'Kilimanjaro Beverages',
    contactPerson: 'Amina Shira',
    phone: '+255 712 908 771',
    email: 'sales@kilimanjarobev.co.tz',
    itemsSupplied: 18,
    totalPurchases: 4150000,
    status: 'Active',
  },
  {
    id: 'sup-003',
    name: 'Mkulima Agro Supplies',
    contactPerson: 'Peter Ndosi',
    phone: '+255 733 445 120',
    email: 'peter@mkulimaagro.co.tz',
    itemsSupplied: 9,
    totalPurchases: 1290000,
    status: 'Active',
  },
  {
    id: 'sup-004',
    name: 'Zanzibar Trading Co.',
    contactPerson: 'Salma Said',
    phone: '+255 765 330 981',
    email: 'salma@zanzibartrading.co.tz',
    itemsSupplied: 0,
    totalPurchases: 0,
    status: 'On hold',
  },
];