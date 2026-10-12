import { Ionicons } from '@expo/vector-icons';
import { Switch, Text, View } from 'react-native';

import { useToggleNotifications } from '@/hooks/useToggleNotifications';
import { makeStyles, radius, spacing, typography, useTheme } from '@/theme';

const useStyles = makeStyles((c) => ({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    backgroundColor: c.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: c.border,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: c.primaryTint,
  },
  text: { flex: 1, gap: 2 },
  title: { ...typography.subheading, color: c.text },
  helper: { ...typography.caption, color: c.textMuted },
}));

/**
 * "Push notifications" switch backed by `notificationsStore`. Turning it on for
 * the first time asks the OS for permission; a denial reverts the switch and
 * offers a shortcut to system settings. Haptic feedback on every toggle.
 */
export function NotificationToggle() {
  const { colors } = useTheme();
  const styles = useStyles();
  const { enabled, busy, setEnabled } = useToggleNotifications();

  return (
    <View style={styles.row}>
      <View style={styles.icon}>
        <Ionicons
          name={enabled ? 'notifications' : 'notifications-off-outline'}
          size={18}
          color={colors.primaryDark}
        />
      </View>
      <View style={styles.text}>
        <Text style={styles.title}>Push notifications</Text>
        <Text style={styles.helper}>Get alerts for low stock, orders and daily sales</Text>
      </View>
      <Switch
        value={enabled}
        onValueChange={(next) => void setEnabled(next)}
        disabled={busy}
        trackColor={{ false: colors.borderStrong, true: colors.primary }}
        thumbColor={enabled ? colors.onPrimary : colors.surface}
        ios_backgroundColor={colors.borderStrong}
        accessibilityRole="switch"
        accessibilityLabel="Push notifications"
        accessibilityState={{ checked: enabled, disabled: busy }}
      />
    </View>
  );
}
