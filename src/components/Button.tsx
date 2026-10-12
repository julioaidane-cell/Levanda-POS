import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { Touchable } from './Touchable';
import { elevation, hitSize, makeStyles, radius, spacing, typography, useTheme, type ColorPalette } from '@/theme';

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
  /** Icon rendered on the right, e.g. a chevron for "next" actions. */
  trailingIcon?: keyof typeof Ionicons.glyphMap;
  style?: StyleProp<ViewStyle>;
  fullWidth?: boolean;
  accessibilityHint?: string;
}

const containerFor = (c: ColorPalette, variant: ButtonVariant): ViewStyle => {
  switch (variant) {
    case 'primary':
      return { backgroundColor: c.primary };
    case 'secondary':
      return { backgroundColor: c.surface, borderColor: c.borderStrong };
    case 'ghost':
      return { backgroundColor: 'transparent', borderColor: 'transparent' };
    case 'danger':
      return { backgroundColor: c.danger };
  }
};

const labelColorFor = (c: ColorPalette, variant: ButtonVariant): string => {
  switch (variant) {
    case 'primary':
      return c.onPrimary;
    case 'secondary':
      return c.text;
    case 'ghost':
      return c.primaryDark;
    case 'danger':
      return c.onDanger;
  }
};

const SIZE_LABEL: Record<ButtonSize, number> = { sm: 13, md: 15, lg: 16 };
const SIZE_ICON: Record<ButtonSize, number> = { sm: 16, md: 18, lg: 20 };

const useStyles = makeStyles(() => ({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
  },
  sm: { minHeight: hitSize.min, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  md: { minHeight: hitSize.control, paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  lg: { minHeight: 54, paddingHorizontal: spacing.xl, paddingVertical: spacing.lg },
  primaryShadow: { ...elevation.sm },
  content: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  label: { ...typography.button, textAlign: 'center' },
  fullWidth: { alignSelf: 'stretch' },
  disabled: { opacity: 0.5 },
}));

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  trailingIcon,
  style,
  fullWidth = false,
  accessibilityHint,
}: ButtonProps) {
  const { colors } = useTheme();
  const styles = useStyles();
  const isInactive = disabled || loading;
  const labelColor = labelColorFor(colors, variant);

  return (
    <Touchable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: isInactive, busy: loading }}
      disabled={isInactive}
      haptic={isInactive ? 'none' : 'light'}
      onPress={onPress}
      style={[
        styles.base,
        styles[size],
        containerFor(colors, variant),
        variant === 'primary' && !isInactive ? styles.primaryShadow : null,
        fullWidth ? styles.fullWidth : null,
        isInactive ? styles.disabled : null,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={labelColor} size="small" />
      ) : (
        <View style={styles.content}>
          {icon ? <Ionicons name={icon} size={SIZE_ICON[size]} color={labelColor} /> : null}
          <Text numberOfLines={1} style={[styles.label, { color: labelColor, fontSize: SIZE_LABEL[size] }]}>
            {label}
          </Text>
          {trailingIcon ? <Ionicons name={trailingIcon} size={SIZE_ICON[size]} color={labelColor} /> : null}
      </View>
      )}
    </Touchable>
  );
}
