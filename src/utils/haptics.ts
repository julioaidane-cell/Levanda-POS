import * as Haptics from 'expo-haptics';

/**
 * Thin, fire-and-forget wrappers around `expo-haptics`. Every call is guarded
 * so unsupported platforms (web) and disabled haptics never throw.
 */
export const haptic = {
  light: () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
  },
  medium: () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);
  },
  heavy: () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => undefined);
  },
  selection: () => {
    void Haptics.selectionAsync().catch(() => undefined);
  },
  success: () => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
  },
  warning: () => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => undefined);
  },
  error: () => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => undefined);
  },
} as const;

export type HapticKind = keyof typeof haptic;
