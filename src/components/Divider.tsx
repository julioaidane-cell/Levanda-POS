import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { spacing, typography, useTheme, makeStyles } from '@/theme';

export interface DividerProps {
  /** Optional centred label, e.g. "or". */
  label?: string;
  style?: StyleProp<ViewStyle>;
}

const useStyles = makeStyles(() => ({
  line: { flex: 1, height: StyleSheet.hairlineWidth },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  label: { ...typography.caption, fontWeight: '500' },
}));

/** Hairline separator; optionally split by a centred label. */
export function Divider({ label, style }: DividerProps) {
  const { colors } = useTheme();
  const styles = useStyles();

  if (!label) {
    return <View style={[styles.line, { backgroundColor: colors.divider }, style]} />;
  }

  return (
    <View style={[styles.row, style]}>
      <View style={[styles.line, { backgroundColor: colors.divider }]} />
      <Text style={[styles.label, { color: colors.textMuted }]}>{label}</Text>
      <View style={[styles.line, { backgroundColor: colors.divider }]} />
    </View>
  );
}
