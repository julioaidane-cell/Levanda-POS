import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { makeStyles, radius, spacing, typography, useReduceMotion, useTheme, type ColorPalette } from '@/theme';

export interface LoaderProps {
  label?: string;
  /** Fills the available height — useful for full-screen loading states. */
  full?: boolean;
  size?: 'small' | 'large';
}

const useStyles = makeStyles((c) => ({
  container: { alignItems: 'center', justifyContent: 'center', gap: spacing.md, padding: spacing.xl },
  full: { flex: 1 },
  label: { ...typography.label, color: c.textMuted },
}));

export function Loader({ label = 'Loading…', full = false, size = 'large' }: LoaderProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <View style={[styles.container, full && styles.full]}>
      <ActivityIndicator size={size} color={colors.primary} />
      {label ? <Text style={styles.label}>{label}</Text> : null}
    </View>
  );
}

interface ShimmerProps {
  height: number;
  width?: number | `${number}%`;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

/** A single shimmering placeholder block that mimics the real layout. */
export function Skeleton({ height, width = '100%', borderRadius, style }: ShimmerProps) {
  const { colors } = useTheme();
  const reduceMotion = useReduceMotion();
  const [measuredWidth, setMeasuredWidth] = useState(0);
  const progress = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;
    progress.value = withRepeat(withTiming(1, { duration: 1300, easing: Easing.linear }), -1, false);
  }, [progress, reduceMotion]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(progress.value, [0, 1], [-measuredWidth, measuredWidth]) }],
  }));

  return (
    <View
      accessibilityLabel="Loading content"
      onLayout={(event) => setMeasuredWidth(event.nativeEvent.layout.width)}
      style={[
        { height, width, borderRadius: borderRadius ?? radius.sm, backgroundColor: colors.skeleton, overflow: 'hidden' },
        style,
      ]}
    >
      {!reduceMotion && measuredWidth > 0 ? (
        <Animated.View style={[StyleSheet.absoluteFill, { width: measuredWidth }, animatedStyle]}>
          <LinearGradient
            colors={['transparent', colors.skeletonHighlight, 'transparent']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      ) : null}
    </View>
  );
}

const useRenderStyles = makeStyles((c: ColorPalette) => ({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: c.surface,
    borderWidth: 1,
    borderColor: c.border,
  },
  lines: { flex: 1, gap: spacing.sm },
}));

/** Skeleton rows shaped like `ListItem` rows. */
export function SkeletonList({ count = 4 }: { count?: number }) {
  const styles = useRenderStyles();
  return (
    <View style={{ gap: spacing.sm }} accessibilityLabel="Loading list">
      {Array.from({ length: count }, (_, index) => (
        <View key={index} style={styles.row}>
          <Skeleton height={40} width={40} borderRadius={radius.md} />
          <View style={styles.lines}>
            <Skeleton height={12} width="65%" />
            <Skeleton height={10} width="40%" />
          </View>
        </View>
      ))}
    </View>
  );
}

/** Skeleton shaped like a metric card, for stat rows. */
export function SkeletonStats({ count = 2 }: { count?: number }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', gap: spacing.md }} accessibilityLabel="Loading stats">
      {Array.from({ length: count }, (_, index) => (
        <View
          key={index}
          style={{
            flex: 1,
            gap: spacing.md,
            padding: spacing.lg,
            borderRadius: radius.lg,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Skeleton height={10} width="55%" />
          <Skeleton height={22} width="75%" />
        </View>
      ))}
    </View>
  );
}
