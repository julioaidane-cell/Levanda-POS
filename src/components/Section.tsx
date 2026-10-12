import { Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { SectionHeader } from './SectionHeader';
import { elevation, makeStyles, radius, spacing, typography, useTheme, type ColorPalette } from '@/theme';

export interface SectionProps {
  title?: string;
  caption?: string;
  children: React.ReactNode;
  /** Groups fields into a titled card. */
  inCard?: boolean;
  style?: StyleProp<ViewStyle>;
}

const useStyles = makeStyles((c) => ({
  container: { gap: spacing.sm },
  card: {
    gap: spacing.lg,
    padding: spacing.lg,
    backgroundColor: c.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: c.border,
  },
}));

/** Titled block used to group related fields on the longer forms. */
export function Section({ title, caption, children, inCard = false, style }: SectionProps) {
  const styles = useStyles();

  return (
    <View style={[styles.container, style]}>
      {title ? <SectionHeader title={title} caption={caption} /> : null}
      {inCard ? <View style={styles.card}>{children}</View> : children}
    </View>
  );
}

export type StatTone = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';

export interface StatTileProps {
  label: string;
  value: string;
  tone?: StatTone;
  icon?: React.ReactNode;
  /** Optional supporting line, e.g. "+12% this week". */
  delta?: string;
  onPress?: () => void;
}

const toneColor = (c: ColorPalette, tone: StatTone): { accent: string; tint: string } => {
  switch (tone) {
    case 'primary':
      return { accent: c.primaryDark, tint: c.primaryTint };
    case 'success':
      return { accent: c.success, tint: c.successTint };
    case 'warning':
      return { accent: c.warning, tint: c.warningTint };
    case 'danger':
      return { accent: c.danger, tint: c.dangerTint };
    case 'info':
      return { accent: c.info, tint: c.infoTint };
    default:
      return { accent: c.text, tint: c.surfaceMuted };
  }
};

const useTileStyles = makeStyles((c) => ({
  tile: {
    flex: 1,
    minWidth: 0,
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: c.surface,
    borderWidth: 1,
    borderColor: c.border,
    ...elevation.xs,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  iconWrap: {
    width: 30,
    height: 30,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { ...typography.label, flex: 1 },
  value: { ...typography.title, fontSize: 26, letterSpacing: -0.5 },
  delta: { ...typography.caption },
}));

/** Compact metric tile used on the dashboard and module screens. */
export function StatTile({ label, value, tone = 'default', icon, delta }: StatTileProps) {
  const { colors } = useTheme();
  const styles = useTileStyles();
  const { accent, tint } = toneColor(colors, tone);

  return (
    <View style={styles.tile}>
      <View style={styles.header}>
        {icon ? <View style={[styles.iconWrap, { backgroundColor: tint }]}>{icon}</View> : null}
        <Text style={[styles.label, { color: colors.textMuted }]} numberOfLines={1}>
          {label}
        </Text>
      </View>
      <Text style={[styles.value, { color: accent }]} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      {delta ? <Text style={[styles.delta, { color: colors.textMuted }]}>{delta}</Text> : null}
    </View>
  );
}
