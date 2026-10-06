import { create } from 'zustand';

import { toMessage } from '@/api/errors';
import * as shopsApi from '@/api/shops';
import type { Shop, ShopPayload } from '@/api/types';
import { asyncStore, keys } from '@/utils/storage';

export type ShopsStatus = 'idle' | 'loading' | 'ready' | 'error';

interface ShopState {
  shops: Shop[];
  activeShopId: number | null;
  /**
   * A shop the user intends to use, recorded before its list is loaded.
   * Registration knows the id of the shop it just created, but the shop list
   * is still empty at that moment; `refresh` honours this afterwards.
   */
  pendingActiveShopId: number | null;
  status: ShopsStatus;
  error: string | null;
  isSubmitting: boolean;

  hydrate: () => Promise<void>;
  refresh: () => Promise<void>;
  setActiveShop: (id: number) => Promise<void>;
  /** Picks the shop created during registration, bypassing "first shop wins". */
  adoptShop: (id: number | null) => Promise<void>;
  create: (payload: ShopPayload) => Promise<Shop>;
  update: (id: number, payload: ShopPayload) => Promise<Shop>;
  remove: (id: number) => Promise<void>;
  /** Clears every trace of the previous user's shops. */
  reset: () => void;
  clearError: () => void;
}

/**
 * Keeps the active shop pointing at something that still exists.
 * Falls back to the first available shop when the stored id is stale — for
 * example after that shop was deleted, or on a fresh account with no selection.
 */
function resolveActiveShopId(shops: Shop[], preferred: number | null): number | null {
  if (shops.length === 0) return null;
  if (preferred !== null && shops.some((shop) => shop.id === preferred)) return preferred;
  return shops[0]?.id ?? null;
}

async function persistActiveShopId(id: number | null): Promise<void> {
  if (id === null) await asyncStore.remove(keys.activeShopId);
  else await asyncStore.set(keys.activeShopId, id);
}

export const useShopStore = create<ShopState>((set, get) => ({
  shops: [],
  activeShopId: null,
  pendingActiveShopId: null,
  status: 'idle',
  error: null,
  isSubmitting: false,

  hydrate: async () => {
    const stored = await asyncStore.get<number>(keys.activeShopId);
    if (stored !== null && get().activeShopId === null) {
      set({ activeShopId: stored, pendingActiveShopId: stored });
    }
  },

  refresh: async () => {
    set({ status: 'loading', error: null });
    try {
      const shops = await shopsApi.fetchShops();
      // A pending choice wins over the stored one, so a freshly created shop
      // survives the first refresh that follows registration.
      const preferred = get().pendingActiveShopId ?? get().activeShopId;
      const nextActiveId = resolveActiveShopId(shops, preferred);
      set({ shops, activeShopId: nextActiveId, pendingActiveShopId: nextActiveId, status: 'ready', error: null });
      await persistActiveShopId(nextActiveId);
    } catch (error) {
      set({ status: 'error', error: toMessage(error, 'Could not load your shops.') });
      throw error;
    }
  },

  setActiveShop: async (id) => {
    set({ activeShopId: id, pendingActiveShopId: id });
    await persistActiveShopId(id);
  },

  adoptShop: async (id) => {
    // The shop list is usually still empty here, so the id is remembered as a
    // pending choice and reconciled by the next `refresh`.
    set({ activeShopId: id, pendingActiveShopId: id });
    await persistActiveShopId(id);
  },

  create: async (payload) => {
    set({ isSubmitting: true, error: null });
    try {
      const shop = await shopsApi.createShop(payload);
      set((state) => ({ shops: [...state.shops, shop], status: 'ready' }));
      // A newly created shop becomes the active one straight away.
      set({ activeShopId: shop.id, pendingActiveShopId: shop.id });
      await persistActiveShopId(shop.id);
      set({ isSubmitting: false });
      return shop;
    } catch (error) {
      set({ error: toMessage(error, 'Could not create the shop.'), isSubmitting: false });
      throw error;
    }
  },

  update: async (id, payload) => {
    set({ isSubmitting: true, error: null });
    try {
      const updated = await shopsApi.updateShop(id, payload);
      set((state) => ({
        shops: state.shops.map((shop) => (shop.id === id ? { ...shop, ...updated } : shop)),
        isSubmitting: false,
      }));
      return updated;
    } catch (error) {
      set({ error: toMessage(error, 'Could not update the shop.'), isSubmitting: false });
      throw error;
    }
  },

  remove: async (id) => {
    set({ isSubmitting: true, error: null });
    try {
      await shopsApi.deleteShop(id);
      set((state) => {
        const remaining = state.shops.filter((shop) => shop.id !== id);
        const nextActiveId = resolveActiveShopId(remaining, state.activeShopId);
        return {
          shops: remaining,
          // Deleting the active shop falls back to any other remaining shop.
          activeShopId: nextActiveId,
          pendingActiveShopId: nextActiveId,
        };
      });
      await persistActiveShopId(get().activeShopId);
      set({ isSubmitting: false });
    } catch (error) {
      set({ error: toMessage(error, 'Could not delete the shop.'), isSubmitting: false });
      throw error;
    }
  },

  /**
   * Called when a session ends. The persisted id is cleared too, so the next
   * person to sign in on this device never inherits a stale selection.
   */
  reset: () => {
    set({
      shops: [],
      activeShopId: null,
      pendingActiveShopId: null,
      status: 'idle',
      error: null,
      isSubmitting: false,
    });
    void persistActiveShopId(null);
  },

  clearError: () => set({ error: null }),
}));

/** The shop every product request is scoped to. */
export function  useActiveShop(): Shop | null {
  return useShopStore((state) => state.shops.find((shop) => shop.id === state.activeShopId) ?? null);
}