import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ShopSwitcher } from './ShopSwitcher';
import { Touchable } from './Touchable';
import { makeStyles, radius, spacing, typography, useTheme } from '@/theme';

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
  /** Adds the top safe-area inset. Disable when the parent already insets. */
  inset?: boolean;
}

const useStyles = makeStyles((c) => ({
  container: {
    backgroundColor: c.headerBackground,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: c.border,
  },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  brandMark: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: c.primary,
  },
  iconButton: { padding: spacing.xs },
  titleWrap: { flex: 1, gap: 1 },
  title: { ...typography.title, color: c.headerText },
  subtitle: { ...typography.caption, color: c.headerSubtext },
  switcherRow: { flexDirection: 'row' },
}));

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
  inset = true,
}: HeaderProps) {
  const { colors } = useTheme();
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const canGoBack = showBack ?? router.canGoBack();

  return (
    <View style={[styles.container, { paddingTop: (inset ? insets.top : 0) + spacing.md }]}>
      <View style={styles.topRow}>
        {canGoBack ? (
          <Touchable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            haptic="light"
            scaleTo={0.9}
            hitSlop={10}
            onPress={() => router.back()}
            style={styles.iconButton}
          >
            <Ionicons name="chevron-back" size={22} color={colors.headerIcon} />
          </Touchable>
        ) : (
          <View style={styles.brandMark}>
            <Ionicons name="storefront" size={15} color={colors.onPrimary} />
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
          <Touchable
            key={action.label}
            accessibilityRole="button"
            accessibilityLabel={action.label}
            haptic="light"
            scaleTo={0.9}
            hitSlop={8}
            onPress={action.onPress}
            style={styles.iconButton}
          >
            <Ionicons name={action.icon} size={20} color={colors.headerIcon} />
          </Touchable>
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
