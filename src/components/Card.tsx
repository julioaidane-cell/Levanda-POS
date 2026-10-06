import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, elevation, radius, spacing, typography } from '@/theme';
import { Pressable } from 'react-native';

export interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  padded?: boolean;
}

export function Card({ children, onPress, style, padded = true }: CardProps) {
  const content = (
    <View style={[styles.card, padded && styles.padded, style]}>{children}</View>
  );

  if (!onPress) return content;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [pressed && styles.pressed]}
    >
      {content}
    </Pressable>
  );
}

export interface BadgeProps {
  label: string;
  tone?: 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'accent';
  icon?: keyof typeof Ionicons.glyphMap;
}

const BADGE_TONE: Record<NonNullable<BadgeProps['tone']>, { bg: string; fg: string }> = {
  neutral: { bg: colors.surfaceMuted, fg: colors.textSecondary },
  primary: { bg: colors.primaryTint, fg: colors.primaryDarker },
  success: { bg: colors.successTint, fg: colors.success },
  warning: { bg: colors.warningTint, fg: colors.warning },
  danger: { bg: colors.dangerTint, fg: colors.danger },
  accent: { bg: colors.accentTint, fg: colors.accent },
};

export function Badge({ label, tone = 'neutral', icon }: BadgeProps) {
  const palette = BADGE_TONE[tone];
  return (
    <View style={[styles.badge, { backgroundColor: palette.bg }]}>
      {icon ? <Ionicons name={icon} size={11} color={palette.fg} /> : null}
      <Text style={[styles.badgeText, { color: palette.fg }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...elevation.card,
  },
  padded: { padding: spacing.lg },
  pressed: { opacity: 0.9 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  badgeText: { ...typography.caption, fontWeight: '600' },
});