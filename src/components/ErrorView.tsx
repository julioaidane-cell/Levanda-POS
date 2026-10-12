import { Ionicons } from '@expo/vector-icons';
import { Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { Button } from './Button';
import { ApiError, isApiError } from '@/api/errors';
import { elevation, makeStyles, radius, spacing, typography, useTheme } from '@/theme';

export interface ErrorViewProps {
  error: unknown;
  onRetry?: () => void;
  retryLabel?: string;
  /** Compact inline variant for use inside a card or form. */
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
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
  if (isApiError(error)) return { message: error.message, detail: error.detail };
  if (error instanceof Error) return { message: error.message };
  return { message: 'Something went wrong. Please try again.' };
}

const useStyles = makeStyles((c) => ({
  container: {
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.xl,
    backgroundColor: c.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: c.border,
    ...elevation.xs,
  },
  compact: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.md,
    gap: spacing.sm,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: c.dangerTint,
  },
  compactIconWrap: { width: 36, height: 36 },
  textWrap: { flex: 1, gap: spacing.xs, alignItems: 'center' },
  compactTextWrap: { alignItems: 'flex-start' },
  message: { ...typography.bodyStrong, textAlign: 'center' },
  compactMessage: { textAlign: 'left' },
  fieldList: { gap: 2, alignSelf: 'stretch' },
  fieldText: { ...typography.caption },
  detail: { ...typography.caption, textAlign: 'center' },
}));

export function ErrorView({ error, onRetry, retryLabel = 'Try again', compact = false, style }: ErrorViewProps) {
  const { colors } = useTheme();
  const styles = useStyles();
  const { message, detail } = describe(error);
  const icon = isApiError(error) ? ICON_FOR_KIND[error.kind] : 'warning-outline';
  const isValidation = error instanceof ApiError && error.isValidation;

  return (
    <View style={[styles.container, compact && styles.compact, style]}>
      <View style={[styles.iconWrap, compact && styles.compactIconWrap]}>
        <Ionicons name={icon} size={compact ? 18 : 24} color={colors.danger} />
      </View>
      <View style={[styles.textWrap, compact && styles.compactTextWrap]}>
        <Text style={[styles.message, { color: colors.text }, compact && styles.compactMessage]}>{message}</Text>
        {isValidation && Object.keys(error.fieldErrors).length > 0 ? (
          <View style={styles.fieldList}>
            {Object.entries(error.fieldErrors).map(([field, messages]) => (
              <Text key={field} style={[styles.fieldText, { color: colors.danger }]}>
                • {messages.join(', ')}
              </Text>
            ))}
          </View>
        ) : null}
        {!compact && detail && detail !== message ? (
          <Text style={[styles.detail, { color: colors.textSecondary }]} numberOfLines={2}>
            {detail}
          </Text>
        ) : null}
      </View>
      {onRetry ? <Button label={retryLabel} onPress={onRetry} variant="secondary" size="sm" icon="refresh" /> : null}
    </View>
  );
}
