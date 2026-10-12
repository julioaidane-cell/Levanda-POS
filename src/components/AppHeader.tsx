import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ShopSwitcher } from './ShopSwitcher';
import { Touchable } from './Touchable';
import { useAuthStore } from '@/store/authStore';
import { useNotificationsStore } from '@/store/notificationsStore';
import { useActiveShop } from '@/store/shopStore';
import { borderWidth, layout, makeStyles, radius, spacing, typography, useTheme } from '@/theme';
import { initialsOf } from '@/utils/format';

export interface AppHeaderProps {
  onAddShop: () => void;
  onManageShops?: () => void;
  onPressNotifications: () => void;
  onPressAvatar: () => void;
  /** Adds the top safe-area inset. Disable when the parent already insets. */
  inset?: boolean;
}

const useStyles = makeStyles((c) => ({
  container: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  shopTrigger: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  shopIcon: {
    width: layout.headerControl,
    height: layout.headerControl,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: c.primary,
  },
  shopText: { flexShrink: 1, gap: 1 },
  shopLabel: { ...typography.overline, color: c.headerSubtext },
  shopNameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xxs },
  shopName: { ...typography.bodyStrong, color: c.headerText, flexShrink: 1 },
  control: {
    width: layout.headerControl,
    height: layout.headerControl,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: c.headerPill,
    borderWidth: borderWidth.hairline,
    borderColor: c.headerPillBorder,
  },
  dot: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    width: spacing.sm,
    height: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: c.danger,
    borderWidth: borderWidth.thick,
    borderColor: c.headerBackground,
  },
  avatar: { backgroundColor: c.primary, borderColor: c.primary },
  avatarText: { ...typography.bodyStrong, color: c.onPrimary },
}));

/**
 * The app-header chrome shared by every main screen: a compact shop selector on
 * the left (opens the existing {@link ShopSwitcher}), then a notification bell
 * and the signed-in user's initials avatar on the right.
 */
export function AppHeader({
  onAddShop,
  onManageShops,
  onPressNotifications,
  onPressAvatar,
  inset = true,
}: AppHeaderProps) {
  const { colors } = useTheme();
  const styles = useStyles();
  const insets = useSafeAreaInsets();

  const activeShop = useActiveShop();
  const user = useAuthStore((state) => state.user);
  const notificationsEnabled = useNotificationsStore((state) => state.enabled);
  const unread = useNotificationsStore((state) => state.unreadCount());

  const showDot = notificationsEnabled && unread > 0;
  const bellLabel = !notificationsEnabled
    ? 'Notifications, turned off'
    : unread > 0
      ? `Notifications, ${unread} unread`
      : 'Notifications';

  return (
    <View style={[styles.container, { paddingTop: (inset ? insets.top : 0) + spacing.md }]}>
      <View style={styles.topRow}>
        <ShopSwitcher
          onAddShop={onAddShop}
          onManageShops={onManageShops}
          renderTrigger={({ open, expanded }) => (
            <Touchable
              accessibilityRole="button"
              accessibilityLabel={`Active shop: ${activeShop?.name ?? 'none selected'}. Tap to switch shop.`}
              accessibilityState={{ expanded }}
              haptic="selection"
              scaleTo={0.98}
              onPress={open}
              style={styles.shopTrigger}
            >
              <View style={styles.shopIcon}>
                <Ionicons name="storefront" size={18} color={colors.onPrimary} />
              </View>
              <View style={styles.shopText}>
                <Text style={styles.shopLabel} allowFontScaling={false}>
                  Shop
                </Text>
                <View style={styles.shopNameRow}>
                  <Text style={styles.shopName} numberOfLines={1}>
                    {activeShop?.name ?? 'Select a shop'}
                  </Text>
                  <Ionicons name="chevron-down" size={15} color={colors.headerSubtext} />
                </View>
              </View>
            </Touchable>
          )}
        />

        <Touchable
          accessibilityRole="button"
          accessibilityLabel={bellLabel}
          haptic="light"
          scaleTo={0.9}
          hitSlop={spacing.xs}
          onPress={onPressNotifications}
          style={styles.control}
        >
          <Ionicons
            name={notificationsEnabled ? 'notifications-outline' : 'notifications-off-outline'}
            size={20}
            color={notificationsEnabled ? colors.headerIcon : colors.textMuted}
          />
          {showDot ? <View style={styles.dot} /> : null}
        </Touchable>

        <Touchable
          accessibilityRole="button"
          accessibilityLabel={user?.name ? `${user.name} account` : 'Account'}
          haptic="light"
          scaleTo={0.9}
          hitSlop={spacing.xs}
          onPress={onPressAvatar}
          style={[styles.control, styles.avatar]}
        >
          <Text style={styles.avatarText} allowFontScaling={false}>
            {initialsOf(user?.name ?? user?.username ?? null)}
          </Text>
        </Touchable>
      </View>
    </View>
  );
}
