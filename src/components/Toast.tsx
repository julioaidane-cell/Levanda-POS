import { Ionicons } from '@expo/vector-icons';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Text, View } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Touchable } from './Touchable';
import { elevation, makeStyles, radius, spacing, typography, useTheme } from '@/theme';

export type ToastTone = 'success' | 'error' | 'info';

export interface ToastOptions {
  message: string;
  tone?: ToastTone;
  /** Milliseconds before auto-dismiss. Defaults to 3200. */
  duration?: number;
  /** Optional action rendered at the end of the toast (e.g. "Open settings"). */
  actionLabel?: string;
  onAction?: () => void;
}

interface ToastItem {
  id: number;
  message: string;
  tone: ToastTone;
  duration: number;
  actionLabel?: string;
  onAction?: () => void;
}

interface ToastContextValue {
  show: (options: ToastOptions) => void;
  success: (message: string) => void;
  error: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue>({
  show: () => undefined,
  success: () => undefined,
  error: () => undefined,
});

const ICON_FOR_TONE: Record<ToastTone, keyof typeof Ionicons.glyphMap> = {
  success: 'checkmark-circle',
  error: 'alert-circle',
  info: 'information-circle',
};

const useStyles = makeStyles((c) => ({
  host: { position: 'absolute', left: spacing.lg, right: spacing.lg, zIndex: 1000 },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    backgroundColor: c.surface,
    borderColor: c.border,
    ...elevation.lg,
  },
  icon: {
    width: 26,
    height: 26,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: { ...typography.bodyStrong, flex: 1 },
  action: { paddingVertical: spacing.xxs, paddingHorizontal: spacing.sm },
  actionLabel: { ...typography.button, color: c.primary },
}));

export function ToastProvider({ children }: { children: ReactNode }) {
  const [item, setItem] = useState<ToastItem | null>(null);
  const idRef = useRef(0);

  const show = useCallback((options: ToastOptions) => {
    idRef.current += 1;
    setItem({
      id: idRef.current,
      message: options.message,
      tone: options.tone ?? 'info',
      duration: options.duration ?? 3200,
      actionLabel: options.actionLabel,
      onAction: options.onAction,
    });
  }, []);

  const value = useMemo<ToastContextValue>(
    () => ({
      show,
      success: (message: string) => show({ message, tone: 'success' }),
      error: (message: string) => show({ message, tone: 'error' }),
    }),
    [show],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastHost item={item} onDismiss={() => setItem(null)} />
    </ToastContext.Provider>
  );
}

function ToastHost({ item, onDismiss }: { item: ToastItem | null; onDismiss: () => void }) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useStyles();

  useEffect(() => {
    if (!item) return;
    const timer = setTimeout(onDismiss, item.duration);
    return () => clearTimeout(timer);
  }, [item, onDismiss]);

  if (!item) return null;

  const toneColor =
    item.tone === 'success' ? colors.success : item.tone === 'error' ? colors.danger : colors.primary;
  const toneTint =
    item.tone === 'success' ? colors.successTint : item.tone === 'error' ? colors.dangerTint : colors.primaryTint;

  return (
    <Animated.View
      entering={FadeInUp.duration(250)}
      exiting={FadeOutUp.duration(200)}
      style={[styles.host, { top: insets.top + spacing.sm }]}
      pointerEvents="box-none"
    >
      <Touchable
        accessibilityRole="alert"
        accessibilityLabel={`${item.tone}: ${item.message}`}
        haptic="none"
        scaleTo={0.98}
        onPress={onDismiss}
        style={styles.toast}
      >
        <View style={[styles.icon, { backgroundColor: toneTint }]}>
          <Ionicons name={ICON_FOR_TONE[item.tone]} size={16} color={toneColor} />
        </View>
        <Text style={[styles.message, { color: colors.text }]} numberOfLines={2}>
          {item.message}
        </Text>
        {item.actionLabel && item.onAction ? (
          <Touchable
            accessibilityRole="button"
            accessibilityLabel={item.actionLabel}
            haptic="light"
            scaleTo={0.94}
            hitSlop={6}
            onPress={() => {
              item.onAction?.();
              onDismiss();
            }}
            style={styles.action}
          >
            <Text style={styles.actionLabel}>{item.actionLabel}</Text>
          </Touchable>
        ) : null}
      </Touchable>
    </Animated.View>
  );
}

/** Show success/error/info toasts after create, update and delete actions. */
export function useToast(): ToastContextValue {
  return useContext(ToastContext);
}
