import { create } from 'zustand';

import { mockNotifications, type AppNotification } from '@/data/mock/notifications';
import { asyncStore, keys } from '@/utils/storage';

// TODO: replace with API — the feed is seeded from local mock data until the
// Levanda backend exposes a notifications endpoint.

interface NotificationsState {
  /** Master switch persisted to AsyncStorage (`notifications_enabled`). */
  enabled: boolean;
  /** True once the persisted preference has been read on app start. */
  hydrated: boolean;
  notifications: AppNotification[];

  hydrate: () => Promise<void>;
  setEnabled: (enabled: boolean) => Promise<void>;
  /** Prepend a freshly received alert (used when notifications are on). */
  addNotification: (notification: AppNotification) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  /** Unread count, forced to zero while notifications are switched off. */
  unreadCount: () => number;
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  enabled: true,
  hydrated: false,
  notifications: mockNotifications,

  hydrate: async () => {
    if (get().hydrated) return;
    const stored = await asyncStore.get<boolean>(keys.notificationsEnabled);
    set({ enabled: stored ?? true, hydrated: true });
  },

  setEnabled: async (enabled) => {
    set({ enabled });
    await asyncStore.set(keys.notificationsEnabled, enabled);
  },

  addNotification: (notification) =>
    set((state) => ({ notifications: [notification, ...state.notifications] })),

  markAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((item) => (item.id === id ? { ...item, read: true } : item)),
    })),

  markAllAsRead: () =>
    set((state) => ({ notifications: state.notifications.map((item) => ({ ...item, read: true })) })),

  unreadCount: () => (get().enabled ? get().notifications.filter((item) => !item.read).length : 0),
}));
