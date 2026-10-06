import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '@/theme';

export interface LoaderProps {
  label?: string;
  /** Fills the available height — useful for full-screen loading states. */
  full?: boolean;
  size?: 'small' | 'large';
}

export function Loader({ label = 'Loading…', full = false, size = 'large' }: LoaderProps) {
  return (
    <View style={[styles.container, full && styles.full]}>
      <ActivityIndicator size={size} color={colors.primary} />
      {label ? <Text style={styles.label}>{label}</Text> : null}
    </View>
  );
}

/** Placeholder block used while a list loads, to avoid a jarring layout jump. */
export function Skeleton({ height, width, style }: { height: number; width?: number | string; style?: object }) {
  return <View style={[styles.skeleton, { height, width: width ?? '100%' }, style]} />;
}

export function SkeletonList({ count = 4, cardHeight = 78 }: { count?: number; cardHeight?: number }) {
  return (
    <View style={styles.skeletonList} accessibilityLabel="Loading content">
      {Array.from({ length: count }, (_, index) => (
        <Skeleton key={index} height={cardHeight} style={styles.skeletonCard} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', gap: spacing.md, padding: spacing.xl },
  full: { flex: 1 },
  label: { ...typography.label, color: colors.textMuted },
  skeleton: { backgroundColor: colors.surfaceMuted, borderRadius: 12 },
  skeletonList: { gap: spacing.md },
  skeletonCard: { borderRadius: 14 },
});