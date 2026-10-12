import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { Badge } from './Card';
import { Touchable } from './Touchable';
import { makeStyles, radius, spacing, typography, useTheme } from '@/theme';

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
  /** Dims the row content, e.g. inactive products. */
  muted?: boolean;
}

const useStyles = makeStyles((c) => ({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 68,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: c.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: c.border,
  },
  activeRow: { borderColor: c.primary, backgroundColor: c.primaryTint },
  leading: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  textWrap: { flex: 1, gap: 2 },
  title: { ...typography.subheading, color: c.text },
  mutedText: { color: c.textMuted },
  subtitle: { ...typography.caption, color: c.textMuted },
  badgeWrap: { marginTop: spacing.xxs, flexDirection: 'row' },
  metaWrap: { alignItems: 'flex-end', gap: 2, maxWidth: 130 },
  meta: { ...typography.subheading, color: c.text },
  metaCaption: { ...typography.caption, color: c.textMuted },
  chevron: { paddingLeft: spacing.xxs },
}));

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
  muted,
}: ListItemProps) {
  const { colors } = useTheme();
  const styles = useStyles();

  const body = (
    <View style={[styles.row, isActive && styles.activeRow]}>
      {leading ? <View style={styles.leading}>{leading}</View> : null}

      <View style={styles.textWrap}>
        <Text style={[styles.title, muted && styles.mutedText]} numberOfLines={1}>
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
          {meta ? (
            <Text style={[styles.meta, muted && styles.mutedText]} numberOfLines={1} adjustsFontSizeToFit>
              {meta}
            </Text>
          ) : null}
          {metaCaption ? (
            <Text style={styles.metaCaption} numberOfLines={1}>
              {metaCaption}
            </Text>
          ) : null}
        </View>
      ) : null}

      {isActive ? <Ionicons name="checkmark-circle" size={20} color={colors.primary} /> : null}
      {showChevron && !isActive ? (
        <View style={styles.chevron}>
          <Ionicons name="chevron-forward" size={18} color={colors.textDisabled} />
        </View>
      ) : null}
    </View>
  );

  if (!onPress) return body;

  return (
    <Touchable
      accessibilityRole="button"
      accessibilityState={{ selected: isActive }}
      accessibilityLabel={title}
      scaleTo={0.99}
      haptic="light"
      onPress={onPress}
    >
      {body}
    </Touchable>
  );
}
