import { Ionicons } from '@expo/vector-icons';
import { memo, useCallback, useState } from 'react';
import { Text, View } from 'react-native';

import { Button, EmptyState, Header, NotificationToggle, ScreenScroll, Touchable } from '@/components/';
import type { AppNotification, NotificationKind } from '@/data/mock/notifications';
import { useToggleNotifications } from '@/hooks/useToggleNotifications';
import { useNotificationsStore } from '@/store/notificationsStore';
import { makeStyles, radius, spacing, typography, useTheme, type ColorPalette } from '@/theme';
import { formatRelativeTime } from '@/utils/format';

interface NotificationVisual {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  tint: string;
}

function visualFor(kind: NotificationKind, colors: ColorPalette): NotificationVisual {
  switch (kind) {
    case 'low_stock':
      return { icon: 'warning-outline', color: colors.warning, tint: colors.warningTint };
    case 'new_order':
      return { icon: 'cart-outline', color: colors.primary, tint: colors.primaryTint };
    case 'sales_summary':
      return { icon: 'bar-chart-outline', color: colors.success, tint: colors.successTint };
  }
}

const useStyles = makeStyles((c) => ({
  root: { flex: 1, backgroundColor: c.background },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  toolbarText: { ...typography.caption, color: c.textMuted },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: c.surfaceMuted,
    borderWidth: 1,
    borderColor: c.border,
  },
  bannerText: { flex: 1, gap: spacing.xxs },
  bannerTitle: { ...typography.subheading, color: c.text },
  bannerMessage: { ...typography.caption, color: c.textMuted },
  list: { gap: spacing.sm },
  item: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: c.surface,
    borderWidth: 1,
    borderColor: c.border,
  },
  itemUnread: { borderColor: c.primary, backgroundColor: c.primaryWash },
  icon: { width: 40, height: 40, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1, gap: spacing.xxs },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  title: { ...typography.subheading, color: c.text, flex: 1 },
  dot: { width: spacing.sm, height: spacing.sm, borderRadius: radius.pill, backgroundColor: c.primary },
  message: { ...typography.body, color: c.textSecondary },
  time: { ...typography.caption, color: c.textMuted },
}));

interface NotificationRowProps {
  notification: AppNotification;
  onPress: (id: string) => void;
}

/** One notification row. Memoised so marking one read only redraws that row. */
const NotificationRow = memo(function NotificationRow({ notification, onPress }: NotificationRowProps) {
  const { colors } = useTheme();
  const styles = useStyles();
  const visual = visualFor(notification.kind, colors);
  const time = formatRelativeTime(notification.createdAt);

  const handlePress = useCallback(() => onPress(notification.id), [onPress, notification.id]);

  return (
    <Touchable
      accessibilityRole="button"
      accessibilityLabel={`${notification.title}. ${notification.message}. ${time}${
        notification.read ? '' : '. Unread'
      }`}
      accessibilityState={{ selected: !notification.read }}
      haptic="light"
      scaleTo={0.99}
      onPress={handlePress}
      style={[styles.item, notification.read ? null : styles.itemUnread]}
    >
      <View style={[styles.icon, { backgroundColor: visual.tint }]}>
        <Ionicons name={visual.icon} size={18} color={visual.color} />
      </View>
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>
            {notification.title}
          </Text>
          {notification.read ? null : <View style={styles.dot} />}
        </View>
        <Text style={styles.message} numberOfLines={2}>
          {notification.message}
        </Text>
        <Text style={styles.time}>{time}</Text>
      </View>
    </Touchable>
  );
});

export default function NotificationsScreen() {
  const { colors } = useTheme();
  const styles = useStyles();
  const { enabled, setEnabled } = useToggleNotifications();

  const notifications = useNotificationsStore((state) => state.notifications);
  const unread = useNotificationsStore((state) => state.unreadCount());
  const markAsRead = useNotificationsStore((state) => state.markAsRead);
  const markAllAsRead = useNotificationsStore((state) => state.markAllAsRead);

  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <View style={styles.root}>
      <Header
        title="Notifications"
        showBack
        actions={[
          {
            icon: 'settings-outline',
            label: settingsOpen ? 'Hide notification settings' : 'Notification settings',
            onPress: () => setSettingsOpen((open) => !open),
          },
        ]}
      />

      <ScreenScroll>
        {settingsOpen ? <NotificationToggle /> : null}

        {!enabled ? (
          <View style={styles.banner}>
            <Ionicons name="notifications-off-outline" size={22} color={colors.textMuted} />
            <View style={styles.bannerText}>
              <Text style={styles.bannerTitle}>Notifications are turned off</Text>
              <Text style={styles.bannerMessage}>
                Turn them on to get alerts for low stock, orders and daily sales.
              </Text>
            </View>
            <Button label="Turn on" size="sm" onPress={() => void setEnabled(true)} />
          </View>
        ) : null}

        {notifications.length === 0 ? (
          <EmptyState
            title="No notifications yet"
            message="Alerts about stock, orders and sales will appear here."
            icon="notifications-outline"
          />
        ) : (
          <>
            {unread > 0 ? (
              <View style={styles.toolbar}>
                <Text style={styles.toolbarText}>
                  {unread} unread notification{unread === 1 ? '' : 's'}
                </Text>
                <Button label="Mark all as read" variant="ghost" size="sm" onPress={markAllAsRead} />
              </View>
            ) : null}

            <View style={styles.list}>
              {notifications.map((notification) => (
                <NotificationRow key={notification.id} notification={notification} onPress={markAsRead} />
              ))}
            </View>
          </>
        )}
      </ScreenScroll>
    </View>
  );
}
