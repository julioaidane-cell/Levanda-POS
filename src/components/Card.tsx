import { Ionicons } from '@expo/vector-icons';
import { Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { Touchable } from './Touchable';
import { elevation, makeStyles, radius, spacing, typography, useTheme, type ColorPalette } from '@/theme';

export interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  padded?: boolean;
  /** Removes the default shadow for cards nested inside another card. */
  flat?: boolean;
}

const useStyles = makeStyles(() => ({
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  padded: { padding: spacing.lg },
  shadow: { ...elevation.sm },
}));

export function Card({ children, onPress, style, padded = true, flat = false }: CardProps) {
  const { colors } = useTheme();
  const styles = useStyles();

  const composed: StyleProp<ViewStyle> = [
    styles.card,
    { backgroundColor: colors.surface, borderColor: colors.border },
    !flat && styles.shadow,
    padded && styles.padded,
    style,
  ];

  if (!onPress) return <View style={composed}>{children}</View>;

  return (
    <Touchable
      accessibilityRole="button"
      haptic="light"
      scaleTo={0.98}
      onPress={onPress}
      style={composed}
    >
      {children}
    </Touchable>
  );
}

export type BadgeTone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'accent' | 'info';

export interface BadgeProps {
  label: string;
  tone?: BadgeTone;
  icon?: keyof typeof Ionicons.glyphMap;
}

const badgePalette = (c: ColorPalette, tone: BadgeTone): { bg: string; fg: string } => {
  switch (tone) {
    case 'neutral':
      return { bg: c.surfaceMuted, fg: c.textSecondary };
    case 'primary':
      return { bg: c.primaryTint, fg: c.primaryDarker };
    case 'info':
      return { bg: c.infoTint, fg: c.info };
    case 'success':
      return { bg: c.successTint, fg: c.successStrong };
    case 'warning':
      return { bg: c.warningTint, fg: c.warningStrong };
    case 'danger':
      return { bg: c.dangerTint, fg: c.dangerStrong };
    case 'accent':
      return { bg: c.accentTint, fg: c.accent };
  }
};

const useBadgeStyles = makeStyles(() => ({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  text: { ...typography.caption, fontSize: 12, fontWeight: '600' },
}));

export function Badge({ label, tone = 'neutral', icon }: BadgeProps) {
  const { colors } = useTheme();
  const styles = useBadgeStyles();
  const palette = badgePalette(colors, tone);

  return (
    <View style={[styles.badge, { backgroundColor: palette.bg }]}>
      {icon ? <Ionicons name={icon} size={12} color={palette.fg} /> : null}
      <Text style={[styles.text, { color: palette.fg }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}
