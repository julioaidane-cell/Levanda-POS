import { useCallback, useState } from 'react';
import { Linking } from 'react-native';

import { useToast } from '@/components/Toast';
import { useNotificationsStore } from '@/store/notificationsStore';
import { haptic } from '@/utils/haptics';
import { ensureNotificationPermission } from '@/utils/notifications';

export interface ToggleNotifications {
  enabled: boolean;
  /** True while the permission request is in flight. */
  busy: boolean;
  setEnabled: (next: boolean) => Promise<void>;
}

/**
 * Shared "turn notifications on/off" behaviour used by the More screen and the
 * notifications screen: haptic feedback, a first-time OS permission request and
 * a settings shortcut when permission is denied.
 */
export function useToggleNotifications(): ToggleNotifications {
  const toast = useToast();
  const enabled = useNotificationsStore((state) => state.enabled);
  const storeSetEnabled = useNotificationsStore((state) => state.setEnabled);
  const [busy, setBusy] = useState(false);

  const setEnabled = useCallback(
    async (next: boolean) => {
      if (busy) return;
      haptic.selection();

      if (!next) {
        await storeSetEnabled(false);
        return;
      }

      setBusy(true);
      const granted = await ensureNotificationPermission();
      if (granted) {
        await storeSetEnabled(true);
      } else {
        await storeSetEnabled(false);
        toast.show({
          message: 'Notifications permission denied. Enable it in system settings',
          tone: 'error',
          actionLabel: 'Open settings',
          onAction: () => void Linking.openSettings().catch(() => undefined),
        });
      }
      setBusy(false);
    },
    [busy, storeSetEnabled, toast],
  );

  return { enabled, busy, setEnabled };
}
