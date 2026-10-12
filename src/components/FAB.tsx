import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Touchable } from './Touchable';
import { elevation, layout, makeStyles, radius, spacing, typography, useReduceMotion, useTheme } from '@/theme';

export interface FABProps {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  /** Shows a label and widens the button. */
  label?: string;
  accessibilityLabel?: string;
  /** Lifts the button above the tab bar by default. */
  offsetBottom?: number;
}

const useStyles = makeStyles((c) => ({
  host: { position: 'absolute', right: layout.screenPadding, zIndex: 50 },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    minWidth: 56,
    height: 56,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    backgroundColor: c.primary,
    ...elevation.lg,
  },
  label: { ...typography.button, color: c.onPrimary },
}));

/** Floating primary action, anchored to the bottom-right of the screen. */
export function FAB({ icon, onPress, label, accessibilityLabel, offsetBottom }: FABProps) {
  const { colors } = useTheme();
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const reduceMotion = useReduceMotion();

  const bottom = offsetBottom ?? insets.bottom + layout.tabBarHeight + spacing.md;

  return (
    <Animated.View
      entering={reduceMotion ? undefined : FadeInDown.duration(300).delay(120)}
      style={[styles.host, { bottom }]}
    >
      <Touchable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? label ?? 'Add'}
        haptic="medium"
        scaleTo={0.94}
        onPress={onPress}
        style={styles.button}
      >
        <LinearGradient
          colors={[colors.primarySoft, colors.primary, colors.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            borderRadius: radius.pill,
          }}
        />
        <Ionicons name={icon} size={24} color={colors.onPrimary} />
        {label ? <Text style={styles.label}>{label}</Text> : null}
      </Touchable>
    </Animated.View>
  );
}
