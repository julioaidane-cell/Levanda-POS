import { Ionicons } from '@expo/vector-icons';
import { Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { Touchable } from './Touchable';
import { makeStyles, spacing, typography, useTheme } from '@/theme';

export interface SectionHeaderProps {
  title: string;
  caption?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: StyleProp<ViewStyle>;
}

const useStyles = makeStyles(() => ({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  textWrap: { flex: 1, gap: 2 },
  title: { ...typography.overline, textTransform: 'uppercase' },
  caption: { ...typography.caption },
  action: { flexDirection: 'row', alignItems: 'center', gap: spacing.xxs, paddingVertical: spacing.xs },
  actionLabel: { ...typography.label, fontWeight: '600' },
}));

/** Small uppercase section label with an optional caption and trailing action. */
export function SectionHeader({ title, caption, actionLabel, onAction, style }: SectionHeaderProps) {
  const { colors } = useTheme();
  const styles = useStyles();

  return (
    <View style={[styles.row, style]}>
      <View style={styles.textWrap}>
        <Text style={[styles.title, { color: colors.textMuted }]}>{title}</Text>
        {caption ? <Text style={[styles.caption, { color: colors.textMuted }]}>{caption}</Text> : null}
      </View>
      {actionLabel && onAction ? (
        <Touchable
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          haptic="selection"
          onPress={onAction}
          style={styles.action}
        >
          <Text style={[styles.actionLabel, { color: colors.primary }]}>{actionLabel}</Text>
          <Ionicons name="chevron-forward" size={14} color={colors.primary} />
        </Touchable>
      ) : null}
    </View>
  );
}
