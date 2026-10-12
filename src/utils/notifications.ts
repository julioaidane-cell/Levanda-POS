import Constants, { AppOwnership } from 'expo-constants';
import * as Notifications from 'expo-notifications';

/**
 * Remote push is not available inside Expo Go, so the app degrades to the
 * in-app notification feed there instead of failing.
 */
export function isPushAvailable(): boolean {
  return Constants.appOwnership !== AppOwnership.Expo;
}

/**
 * Asks the OS for notification permission.
 *
 * Returns `true` when alerts may be shown — either because permission was
 * granted, or because push is unavailable on this platform (Expo Go / unsupported
 * runtime) and we fall back to the in-app feed. Returns `false` only when the
 * user explicitly denied permission, so the caller can revert the toggle.
 */
export async function ensureNotificationPermission(): Promise<boolean> {
  if (!isPushAvailable()) return true;

  try {
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return true;
    if (!current.canAskAgain) return false;
    const requested = await Notifications.requestPermissionsAsync();
    return requested.granted;
  } catch {
    // The native module is unavailable here — keep in-app notifications working.
    return true;
  }
}
