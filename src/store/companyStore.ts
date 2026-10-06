import { create } from 'zustand';

import { fetchCurrencies } from '@/api/lookups';
import type { Company } from '@/api/types';
import { asyncStore, keys } from '@/utils/storage';
import { setCurrencyCode } from '@/utils/currency';

export type CompanyStatus = 'idle' | 'loading' | 'ready' | 'error';

interface CompanyState {
  company: Company | null;
  status: CompanyStatus;
  /** False when the backend has product categories switched off for the company. */
  hasProductCategories: boolean | null;
  isSubmitting: boolean;
  error: string | null;

  /** Restores the company saved during registration (login returns none). */
  hydrate: () => Promise<void>;
  setCompany: (company: Company | null) => Promise<void>;
  /** Looks up the company's currency code and caches it for the formatters. */
  loadCurrency: () => Promise<void>;
  reset: () => void;
  clearError: () => void;
}

/** Guards against two concurrent `/currencies` lookups. */
let currencyRequest: Promise<void> | null = null;

export const useCompanyStore = create<CompanyState>((set, get) => ({
  company: null,
  status: 'idle',
  hasProductCategories: null,
  isSubmitting: false,
  error: null,

  hydrate: async () => {
    const stored = await asyncStore.get<Company>(keys.company);
    if (stored !== null && get().company === null) {
      set({ company: stored, hasProductCategories: stored.has_product_categories });
    }
  },

  setCompany: async (company) => {
    set({ company, hasProductCategories: company?.has_product_categories ?? null, error: null });
    if (company === null) {
      await asyncStore.remove(keys.company);
      return;
    }
    await asyncStore.set(keys.company, company);
  },

  loadCurrency: async () => {
    if (currencyRequest !== null) return currencyRequest;

    const currencyId = get().company?.currency_id ?? null;
    if (currencyId === null) {
      // Nothing to look up: format amounts without a symbol.
      setCurrencyCode(null);
      return;
    }

    set({ status: 'loading' });
    currencyRequest = fetchCurrencies()
      .then((currencies) => {
        const match = currencies.find((currency) => currency.id === currencyId);
        setCurrencyCode(match?.code ?? null);
        set({ status: 'ready' });
      })
      .catch(() => {
        // Formatting still works without a symbol.
        setCurrencyCode(null);
        set({ status: 'error', error: 'Could not load your currency.' });
      })
      .finally(() => {
        currencyRequest = null;
      });

    return currencyRequest;
  },

  reset: () => {
    set({
      company: null,
      status: 'idle',
      hasProductCategories: null,
      isSubmitting: false,
      error: null,
    });
    setCurrencyCode(null);
    void asyncStore.remove(keys.company);
  },

  clearError: () => set({ error: null }),
}));