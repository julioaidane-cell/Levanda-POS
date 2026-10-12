import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';

import { Avatar, Button, Card, ListItem, NotificationToggle, ScreenHeader, ScreenScroll, Section } from '@/components/';
import { useActiveShop, useShopStore } from '@/store/shopStore';
import { useAuthStore } from '@/store/authStore';
import { makeStyles, radius, spacing, typography, useTheme } from '@/theme';
import { joinLocation } from '@/utils/format';

export default function MoreScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useStyles();

  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const activeShop = useActiveShop();
  const shops = useShopStore((state) => state.shops);
  const setActiveShop = useShopStore((state) => state.setActiveShop);

  const modules: {
    title: string;
    subtitle: string;
    icon: keyof typeof Ionicons.glyphMap;
    href: '/suppliers' | '/customers';
  }[] = [
    {
      title: 'Suppliers',
      subtitle: 'Who supplies your inventory',
      icon: 'bus-outline',
      href: '/suppliers',
    },
    {
      title: 'Customers',
      subtitle: 'Your customer directory',
      icon: 'people-outline',
      href: '/customers',
    },
  ];

  return (
    <View style={styles.root}>
      <ScreenHeader showTabs={false} />

      <ScreenScroll>
        <Card style={styles.profile}>
          <Avatar name={user?.name ?? user?.username} size={54} />
          <View style={styles.profileText}>
            <Text style={styles.profileName} numberOfLines={1}>
              {user?.name ?? user?.username ?? 'Signed in'}
            </Text>
            <Text style={styles.profileMeta} numberOfLines={1}>
              {user?.username ? `@${user.username}` : ''}
              {user?.phone ? ` · ${user.phone}` : ''}
            </Text>
          </View>
        </Card>

        <Section title="Notifications">
          <NotificationToggle />
        </Section>

        <Section title="Modules">
          <View style={styles.list}>
            {modules.map((module) => (
              <ListItem
                key={module.title}
                title={module.title}
                subtitle={module.subtitle}
                showChevron
                onPress={() => router.push(module.href)}
                leading={
                  <View style={styles.moduleIcon}>
                    <Ionicons name={module.icon} size={18} color={colors.primaryDark} />
                  </View>
                }
              />
            ))}
          </View>
        </Section>

        <Section title={`Your shops (${shops.length})`}>
          <View style={styles.list}>
            {shops.map((shop) => (
              <ListItem
                key={shop.id}
                title={shop.name}
                subtitle={joinLocation([shop.ward_name, shop.district_name]) || 'Location not set'}
                isActive={shop.id === activeShop?.id}
                onPress={() => void setActiveShop(shop.id)}
                leading={
                  <View style={styles.moduleIcon}>
                    <Ionicons name="storefront-outline" size={18} color={colors.primaryDark} />
                  </View>
                }
              />
            ))}
          </View>
          {shops.length === 0 ? (
            <Card>
              <Text style={styles.emptyShops}>You have no shops yet. Create one to manage products.</Text>
            </Card>
          ) : null}
        </Section>

        <Button
          label="Log out"
          onPress={() => void logout()}
          variant="secondary"
          fullWidth
          icon="log-out-outline"
          style={styles.logout}
        />
        <Text style={styles.version}>Levanda POS · v1.0.0</Text>
      </ScreenScroll>
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  root: { flex: 1, backgroundColor: c.background },
  profile: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  profileText: { flex: 1, gap: 2 },
  profileName: { ...typography.heading, color: c.text },
  profileMeta: { ...typography.caption, color: c.textMuted },
  list: { gap: spacing.sm },
  moduleIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: c.primaryTint,
  },
  emptyShops: { ...typography.body, color: c.textMuted, textAlign: 'center' },
  logout: { marginTop: spacing.md },
  version: { ...typography.caption, color: c.textMuted, textAlign: 'center' },
}));
