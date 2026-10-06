import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Button } from './Button';
import { ApiError, isApiError } from '@/api/errors';
import { colors, radius, spacing, typography } from '@/theme';

export interface ErrorViewProps {
  error: unknown;
  onRetry?: () => void;
  retryLabel?: string;
  /** Compact inline variant for use inside a card or form. */
  compact?: boolean;
}

const ICON_FOR_KIND: Record<string, keyof typeof Ionicons.glyphMap> = {
  offline: 'cloud-offline-outline',
  timeout: 'time-outline',
  unauthorized: 'lock-closed-outline',
  forbidden: 'shield-outline',
  notFound: 'help-circle-outline',
  methodNotAllowed: 'swap-horizontal-outline',
  validation: 'alert-circle-outline',
  conflict: 'copy-outline',
  server: 'server-outline',
  client: 'warning-outline',
  cancelled: 'close-circle-outline',
  unknown: 'warning-outline',
};

/** Extracts a message plus an optional technical detail line. */
function describe(error: unknown): { message: string; detail?: string } {
  if (isApiError(error)) {
    return { message: error.message, detail: error.detail };
  }
  if (error instanceof Error) return { message: error.message };
  return { message: 'Something went wrong. Please try again.' };
}

export function ErrorView({ error, onRetry, retryLabel = 'Try again', compact = false }: ErrorViewProps) {
  const { message, detail } = describe(error);
  const icon = isApiError(error) ? ICON_FOR_KIND[error.kind] : 'warning-outline';
  const isValidation = error instanceof ApiError && error.isValidation;

  return (
    <View style={[styles.container, compact && styles.compact]}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={compact ? 20 : 26} color={colors.danger} />
      </View>
      <View style={styles.textWrap}>
        <Text style={styles.message}>{message}</Text>
        {isValidation && Object.keys(error.fieldErrors).length > 0 ? (
          <View style={styles.fieldList}>
            {Object.entries(error.fieldErrors).map(([field, messages]) => (
              <Text key={field} style={styles.fieldText}>
                • {messages.join(', ')}
              </Text>
            ))}
          </View>
        ) : null}
        {!compact && detail && detail !== message ? (
          <Text style={styles.detail} numberOfLines={2}>
            {detail}
          </Text>
        ) : null}
      </View>
      {onRetry ? <Button label={retryLabel} onPress={onRetry} variant="secondary" size="sm" icon="refresh" /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.xl,
    backgroundColor: colors.dangerTint,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: '#F3C6C6',
  },
  compact: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.md,
    gap: spacing.sm,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  textWrap: { flex: 1, gap: spacing.xs, alignItems: 'center' },
  message: { ...typography.bodyStrong, color: colors.danger, textAlign: 'center' },
  fieldList: { gap: 2, alignSelf: 'stretch' },
  fieldText: { ...typography.caption, color: colors.danger },
  detail: { ...typography.caption, color: colors.textSecondary, textAlign: 'center' },
});