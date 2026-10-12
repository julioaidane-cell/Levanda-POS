import { Ionicons } from '@expo/vector-icons';
import { Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { Touchable } from './Touchable';
import { makeStyles, radius, spacing, typography, useTheme } from '@/theme';

export interface ChipProps {
  label: string;
  active?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

const useStyles = makeStyles(() => ({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    minHeight: 36,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  label: { ...typography.label, fontWeight: '600' },
}));

/**
 * Compact, selectable pill used for filters and category rows. Non-interactive
 * when no `onPress` is supplied (renders a plain `View`).
 */
export function Chip({ label, active = false, icon, onPress, style }: ChipProps) {
  const { colors } = useTheme();
  const styles = useStyles();

  const backgroundColor = active ? colors.primary : colors.surface;
  const borderColor = active ? colors.primary : colors.border;
  const contentColor = active ? colors.onPrimary : colors.textSecondary;

  const content = (
    <>
      {icon ? <Ionicons name={icon} size={14} color={contentColor} /> : null}
      <Text style={[styles.label, { color: contentColor }]} numberOfLines={1}>
        {label}
      </Text>
    </>
  );

  const composed: StyleProp<ViewStyle> = [styles.base, { backgroundColor, borderColor }, style];

  if (!onPress) return <View style={composed}>{content}</View>;

  return (
    <Touchable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={label}
      haptic="selection"
      scaleTo={0.95}
      onPress={onPress}
      style={composed}
    >
      {content}
    </Touchable>
  );
}
