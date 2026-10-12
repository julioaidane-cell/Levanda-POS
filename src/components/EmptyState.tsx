import { Ionicons } from '@expo/vector-icons';
import { Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Button } from './Button';
import { makeStyles, radius, spacing, typography, useReduceMotion, useTheme } from '@/theme';

export interface EmptyStateProps {
  title: string;
  message?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  actionLabel?: string;
  onAction?: () => void;
  style?: StyleProp<ViewStyle>;
  /** Optional secondary action. */
  secondaryLabel?: string;
  onSecondary?: () => void;
}

const useStyles = makeStyles(() => ({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.xl,
  },
  art: { width: 96, height: 96, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },
  blob: { position: 'absolute', width: 96, height: 96, borderRadius: radius.pill, opacity: 0.9 },
  blobSmall: { position: 'absolute', width: 54, height: 54, borderRadius: radius.pill, top: -2, right: -2 },
  iconWrap: {
    width: 62,
    height: 62,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  title: { ...typography.subheading, textAlign: 'center' },
  message: { ...typography.body, textAlign: 'center', maxWidth: 300 },
  actions: { marginTop: spacing.lg, gap: spacing.sm, alignItems: 'center', alignSelf: 'stretch' },
  primaryAction: { alignSelf: 'center' },
}));

/** Friendly empty state: layered illustration, heading, copy and a primary CTA. */
export function EmptyState({
  title,
  message,
  icon = 'file-tray-outline',
  actionLabel,
  onAction,
  style,
  secondaryLabel,
  onSecondary,
}: EmptyStateProps) {
  const { colors } = useTheme();
  const styles = useStyles();
  const reduceMotion = useReduceMotion();

  return (
    <Animated.View
      entering={reduceMotion ? undefined : FadeInDown.duration(400)}
      style={[styles.container, style]}
    >
      <View style={styles.art}>
        <View style={[styles.blob, { backgroundColor: colors.primaryTint }]} />
        <View style={[styles.blobSmall, { backgroundColor: colors.surfaceMuted }]} />
        <View style={[styles.iconWrap, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name={icon} size={30} color={colors.primary} />
        </View>
      </View>

      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      {message ? <Text style={[styles.message, { color: colors.textMuted }]}>{message}</Text> : null}

      {actionLabel && onAction ? (
        <View style={styles.actions}>
          <Button label={actionLabel} onPress={onAction} size="md" icon="add" style={styles.primaryAction} />
          {secondaryLabel && onSecondary ? (
            <Button label={secondaryLabel} onPress={onSecondary} variant="ghost" size="sm" />
          ) : null}
        </View>
      ) : null}
    </Animated.View>
  );
}
