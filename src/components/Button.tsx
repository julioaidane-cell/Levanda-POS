import { ActivityIndicator, Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, elevation, hitSize, radius, spacing, typography } from '@/theme';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  style?: StyleProp<ViewStyle>;
  fullWidth?: boolean;
  accessibilityHint?: string;
}

const CONTAINER: Record<ButtonVariant, ViewStyle> = {
  primary: { backgroundColor: colors.primary },
  secondary: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderStrong },
  ghost: { backgroundColor: 'transparent' },
  danger: { backgroundColor: colors.danger },
};

const LABEL_COLOR: Record<ButtonVariant, string> = {
  primary: colors.textInverse,
  secondary: colors.text,
  ghost: colors.primaryDark,
  danger: colors.textInverse,
};

const ICON_COLOR: Record<ButtonVariant, string> = {
  primary: colors.textInverse,
  secondary: colors.textSecondary,
  ghost: colors.primaryDark,
  danger: colors.textInverse,
};

const CONTAINER_SIZE: Record<ButtonSize, ViewStyle> = {
  sm: { minHeight: hitSize.min, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  md: { minHeight: hitSize.control, paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  lg: { minHeight: 54, paddingHorizontal: spacing.xl, paddingVertical: spacing.lg },
};

const LABEL_SIZE: Record<ButtonSize, number> = { sm: 13, md: 15, lg: 16 };

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  style,
  fullWidth = false,
  accessibilityHint,
}: ButtonProps) {
  const isInactive = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isInactive, busy: loading }}
      accessibilityHint={accessibilityHint}
      disabled={isInactive}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        CONTAINER_SIZE[size],
        CONTAINER[variant],
        variant === 'primary' && !isInactive && elevation.card,
        fullWidth && styles.fullWidth,
        style,
        pressed && !isInactive && styles.pressed,
        isInactive && styles.disabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={ICON_COLOR[variant]} size="small" />
      ) : (
        <View style={styles.content}>
          {icon ? <Ionicons name={icon} size={LABEL_SIZE[size] + 2} color={ICON_COLOR[variant]} /> : null}
          <Text numberOfLines={1} style={[styles.label, { color: LABEL_COLOR[variant], fontSize: LABEL_SIZE[size] }]}>
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
  },
  content: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  label: { ...typography.bodyStrong },
  fullWidth: { alignSelf: 'stretch' },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.55 },
});