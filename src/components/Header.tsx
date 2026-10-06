import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ShopSwitcher } from './ShopSwitcher';
import { colors, radius, spacing, typography } from '@/theme';

export interface HeaderAction {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}

export interface HeaderProps {
  title: string;
  subtitle?: string;
  actions?: HeaderAction[];
  /** Renders the shop switcher pill under the title. */
  showShopSwitcher?: boolean;
  onAddShop?: () => void;
  onManageShops?: () => void;
  /** Hides the back chevron on root tab screens. */
  showBack?: boolean;
}

/**
 * Dark app bar matching the Levanda POS chrome. The back chevron is rendered
 * only when the current route can actually go back.
 */
export function Header({
  title,
  subtitle,
  actions,
  showShopSwitcher,
  onAddShop,
  onManageShops,
  showBack,
}: HeaderProps) {
  const canGoBack = showBack ?? router.canGoBack();

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        {canGoBack ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={() => router.back()}
            hitSlop={10}
            style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
          >
            <Ionicons name="chevron-back" size={22} color={colors.textInverse} />
          </Pressable>
        ) : (
          <View style={styles.brandMark}>
            <Ionicons name="storefront" size={15} color={colors.chrome} />
          </View>
        )}

        <View style={styles.titleWrap}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>

        {actions?.map((action) => (
          <Pressable
            key={action.label}
            accessibilityRole="button"
            accessibilityLabel={action.label}
            onPress={action.onPress}
            hitSlop={8}
            style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
          >
            <Ionicons name={action.icon} size={20} color={colors.textInverse} />
          </Pressable>
        ))}
      </View>

      {showShopSwitcher && onAddShop ? (
        <View style={styles.switcherRow}>
          <ShopSwitcher onAddShop={onAddShop} onManageShops={onManageShops} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.chrome,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  brandMark: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  iconButton: { padding: spacing.xs },
  pressed: { opacity: 0.6 },
  titleWrap: { flex: 1, gap: 1 },
  title: { ...typography.title, color: colors.textInverse },
  subtitle: { ...typography.caption, color: colors.chromeMuted },
  switcherRow: { flexDirection: 'row' },
});