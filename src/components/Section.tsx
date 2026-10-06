import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';

export interface SectionProps {
  title?: string;
  caption?: string;
  children: React.ReactNode;
  /** Groups fields into a titled card. */
  inCard?: boolean;
}

/** Titled block used to group related fields on the longer forms. */
export function Section({ title, caption, children, inCard = false }: SectionProps) {
  return (
    <View style={styles.container}>
      {title ? (
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          {caption ? <Text style={styles.caption}>{caption}</Text> : null}
        </View>
      ) : null}
      <View style={[inCard && styles.card]}>{children}</View>
    </View>
  );
}

export interface StatTileProps {
  label: string;
  value: string;
  tone?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  icon?: React.ReactNode;
}

const TONE_COLOR: Record<NonNullable<StatTileProps['tone']>, string> = {
  default: colors.text,
  primary: colors.primaryDark,
  success: colors.success,
  warning: colors.warning,
  danger: colors.danger,
};

/** Compact metric tile used on the dashboard. */
export function StatTile({ label, value, tone = 'default', icon }: StatTileProps) {
  return (
    <View style={styles.tile}>
      <View style={styles.tileHeader}>
        {icon}
        <Text style={styles.tileLabel} numberOfLines={1}>
          {label}
        </Text>
      </View>
      <Text style={[styles.tileValue, { color: TONE_COLOR[tone] }]} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.sm },
  header: { gap: 2 },
  title: { ...typography.overline, color: colors.textMuted, textTransform: 'uppercase' },
  caption: { ...typography.caption, color: colors.textMuted },
  card: {
    gap: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tile: {
    flex: 1,
    minWidth: 140,
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tileHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  tileLabel: { ...typography.caption, color: colors.textMuted, flex: 1 },
  tileValue: { ...typography.title, fontSize: 22 },
});