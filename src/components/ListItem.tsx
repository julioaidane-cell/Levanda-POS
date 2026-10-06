import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Badge } from './Card';
import { colors, radius, spacing, typography } from '@/theme';

export interface ListItemProps {
  title: string;
  subtitle?: string;
  /** Right-aligned supporting text, e.g. a price. */
  meta?: string;
  metaCaption?: string;
  leading?: React.ReactNode;
  badge?: { label: string; tone?: React.ComponentProps<typeof Badge>['tone'] };
  onPress?: () => void;
  /** Shows a chevron; omit when there is no detail screen to open. */
  showChevron?: boolean;
  isActive?: boolean;
}

export function ListItem({
  title,
  subtitle,
  meta,
  metaCaption,
  leading,
  badge,
  onPress,
  showChevron,
  isActive,
}: ListItemProps) {
  const body = (
    <View style={[styles.row, isActive && styles.activeRow]}>
      {leading ? <View style={styles.leading}>{leading}</View> : null}

      <View style={styles.textWrap}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
        {badge ? (
          <View style={styles.badgeWrap}>
            <Badge label={badge.label} tone={badge.tone} />
          </View>
        ) : null}
      </View>

      {meta || metaCaption ? (
        <View style={styles.metaWrap}>
          {meta ? <Text style={styles.meta} numberOfLines={1}>{meta}</Text> : null}
          {metaCaption ? <Text style={styles.metaCaption} numberOfLines={1}>{metaCaption}</Text> : null}
        </View>
      ) : null}

      {isActive ? <Ionicons name="checkmark-circle" size={20} color={colors.primary} /> : null}
      {showChevron && !isActive ? (
        <Ionicons name="chevron-forward" size={18} color={colors.textDisabled} />
      ) : null}
    </View>
  );

  if (!onPress) return body;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: isActive }}
      onPress={onPress}
      style={({ pressed }) => [pressed && styles.pressed]}
    >
      {body}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 68,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activeRow: { borderColor: colors.primary, backgroundColor: colors.primaryWash },
  pressed: { opacity: 0.9 },
  leading: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  textWrap: { flex: 1, gap: 2 },
  title: { ...typography.subheading, color: colors.text },
  subtitle: { ...typography.caption, color: colors.textMuted },
  badgeWrap: { marginTop: spacing.xxs },
  metaWrap: { alignItems: 'flex-end', gap: 2, maxWidth: 130 },
  meta: { ...typography.subheading, color: colors.text },
  metaCaption: { ...typography.caption, color: colors.textMuted },
});