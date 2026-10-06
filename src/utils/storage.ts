import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

/**
 * Persistence split:
 *  - the bearer token goes to expo-secure-store (Keychain / Keystore)
 *  - non-sensitive session data goes to AsyncStorage
 */

const TOKEN_KEY = 'levanda.auth.token';
const USER_KEY = 'levanda.auth.user';
const COMPANY_KEY = 'levanda.auth.company';
const ACTIVE_SHOP_KEY = 'levanda.shops.activeId';

export const secureStore = {
  async getToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(TOKEN_KEY);
    } catch {
      // A corrupt keystore entry should log the user out, not crash the app.
      return null;
    }
  },

  async setToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  },

  async clearToken(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    } catch {
      // Already absent.
    }
  },
};

export const asyncStore = {
  async get<T>(key: string): Promise<T | null> {
    try {
      const raw = await AsyncStorage.getItem(key);
      return raw === null ? null : (JSON.parse(raw) as T);
    } catch {
      return null;
    }
  },

  async set(key: string, value: unknown): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage full or unavailable — non-fatal.
    }
  },

  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch {
      // Already absent.
    }
  },
};

export const keys = {
  user: USER_KEY,
  company: COMPANY_KEY,
  activeShopId: ACTIVE_SHOP_KEY,
} as const;