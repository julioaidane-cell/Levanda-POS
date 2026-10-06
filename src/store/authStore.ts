import { router } from 'expo-router';
import { create } from 'zustand';

import * as authApi from '@/api/auth';
import { setToken } from '@/api/tokenProvider';
import { setUnauthorizedHandler } from '@/api/unauthorizedHandler';
import type { AssignedShop, AuthUser, Company, LoginPayload, RegisterPayload } from '@/api/types';
import { toMessage } from '@/api/errors';
import { asyncStore, keys, secureStore } from '@/utils/storage';
import { useShopStore } from '@/store/shopStore';
import { useCompanyStore } from '@/store/companyStore';

export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated';

export interface RegisterResult {
  /** The shop created by registration, when one could be identified. */
  newShopId: number | null;
}

interface AuthState {
  status: AuthStatus;
  token: string | null;
  user: AuthUser | null;
  isSubmitting: boolean;
  error: string | null;

  bootstrap: () => Promise<void>;
  register: (payload: RegisterPayload) => Promise<RegisterResult>;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

/**
 * Registration hands a brand-new company both the shop it just created and a set
 * of pre-existing shops, so the created shop cannot be identified by position.
 * Its `created_at` is the newest, which is the only reliable discriminator.
 */
function pickNewestAssignedShop(shops: AssignedShop[]): AssignedShop | null {
  if (shops.length === 0) return null;
  return [...shops].sort((a, b) => {
    const left = Date.parse(a.created_at ?? '');
    const right = Date.parse(b.created_at ?? '');
    if (Number.isNaN(left) || Number.isNaN(right)) return b.id - a.id;
    return right - left;
  })[0] ?? null;
}

/** Wipes every trace of the session from memory and from disk. */
async function purgeSession(): Promise<void> {
  setToken(null);
  await Promise.all([secureStore.clearToken(), asyncStore.remove(keys.user)]);
}

export const useAuthStore = create<AuthState>((set, get) => ({
  status: 'idle',
  token: null,
  user: null,
  isSubmitting: false,
  error: null,

  /** Restores a persisted session so the user stays signed in after restart. */
  bootstrap: async () => {
    if (get().status === 'loading' || get().status === 'authenticated') return;
    set({ status: 'loading' });
    const [token, user, company] = await Promise.all([
      secureStore.getToken(),
      asyncStore.get<AuthUser>(keys.user),
      asyncStore.get<Company>(keys.company),
    ]);
    if (company !== null) {
      useCompanyStore.setState({ company, hasProductCategories: company.has_product_categories });
    }
    if (token) {
      setToken(token);
      set({ status: 'authenticated', token, user });
    } else {
      set({ status: 'unauthenticated', token: null, user: null });
    }
  },

  register: async (payload) => {
    set({ isSubmitting: true, error: null });
    try {
      const response = await authApi.register(payload);
      setToken(response.token);
      await Promise.all([
        secureStore.setToken(response.token),
        asyncStore.set(keys.user, response.user),
        // Register is the only response that carries the company record, which
        // is where the currency and the category feature flag come from.
        useCompanyStore.getState().setCompany(response.company),
      ]);
      set({ status: 'authenticated', token: response.token, user: response.user, isSubmitting: false });
      return { newShopId: pickNewestAssignedShop(response.assigned_shops ?? [])?.id ?? null };
    } catch (error) {
      set({ error: toMessage(error, 'Could not create your account.'), isSubmitting: false });
      throw error;
    }
  },

  login: async (payload) => {
    set({ isSubmitting: true, error: null });
    try {
      const response = await authApi.login(payload);
      setToken(response.token);
      await Promise.all([secureStore.setToken(response.token), asyncStore.set(keys.user, response.user)]);
      set({ status: 'authenticated', token: response.token, user: response.user, isSubmitting: false });
    } catch (error) {
      set({ error: toMessage(error, 'Could not sign you in.'), isSubmitting: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      // Best effort: the local session must be cleared even if this fails.
      await authApi.logout();
    } catch {
      // Ignored on purpose.
    } finally {
      await purgeSession();
      useShopStore.getState().reset();
      useCompanyStore.getState().reset();
      set({ status: 'unauthenticated', token: null, user: null, error: null, isSubmitting: false });
      router.replace('/(auth)/login');
    }
  },

  clearError: () => set({ error: null }),
}));

// Any 401 from the API layer ends the session and returns the user to login.
setUnauthorizedHandler(async () => {
  if (useAuthStore.getState().status === 'unauthenticated') return;
  await purgeSession();
  useShopStore.getState().reset();
  useCompanyStore.getState().reset();
  useAuthStore.setState({ status: 'unauthenticated', token: null, user: null, error: null });
  router.replace('/(auth)/login');
});