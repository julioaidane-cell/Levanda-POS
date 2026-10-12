import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Modal, ScrollView, Text, View } from 'react-native';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState } from './EmptyState';
import { ListItem } from './ListItem';
import { Touchable } from './Touchable';
import { useShopStore } from '@/store/shopStore';
import { elevation, makeStyles, radius, spacing, typography, useReduceMotion, useTheme } from '@/theme';
import { joinLocation } from '@/utils/format';

export interface ShopSwitcherProps {
  /** Compact trigger for the app bar; omit to render the trigger-less content. */
  onAddShop: () => void;
  onManageShops?: () => void;
}

const useStyles = makeStyles((c) => ({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
    maxWidth: '100%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 1,
    borderRadius: radius.pill,
    backgroundColor: c.headerPill,
    borderWidth: 1,
    borderColor: c.headerPillBorder,
  },
  triggerText: { ...typography.label, color: c.headerText, flexShrink: 1 },

  backdrop: { flex: 1, backgroundColor: c.overlay },
  modalRoot: { flex: 1, justifyContent: 'flex-end' },
  sheet: {
    maxHeight: '80%',
    backgroundColor: c.background,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    ...elevation.sheet,
  },
  grabber: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: c.borderStrong,
    marginTop: spacing.sm,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  sheetHeaderText: { flex: 1, gap: 2 },
  sheetTitle: { ...typography.title, color: c.text },
  sheetSubtitle: { ...typography.caption, color: c.textMuted },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md, gap: spacing.sm },
  shopIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: c.primaryTint,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: c.border,
    backgroundColor: c.surface,
  },
  footerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    minHeight: 46,
    borderRadius: radius.md,
    backgroundColor: c.surfaceMuted,
  },
  footerText: { ...typography.bodyStrong, color: c.primaryDark },
}));

/**
 * Bottom-sheet shop switcher. Selecting a shop updates the store, which is the
 * single source of truth for every product request in the app.
 */
export function ShopSwitcher({ onAddShop, onManageShops }: ShopSwitcherProps) {
  const { colors } = useTheme();
  const styles = useStyles();
  const reduceMotion = useReduceMotion();
  const insets = useSafeAreaInsets();

  const [open, setOpen] = useState(false);
  const shops = useShopStore((state) => state.shops);
  const activeShopId = useShopStore((state) => state.activeShopId);
  const setActiveShop = useShopStore((state) => state.setActiveShop);

  const activeShop = useMemo(
    () => shops.find((shop) => shop.id === activeShopId) ?? null,
    [shops, activeShopId],
  );

  const handleSelect = (id: number) => {
    setOpen(false);
    void setActiveShop(id);
  };

  return (
    <>
      <Touchable
        accessibilityRole="button"
        accessibilityLabel={`Active shop: ${activeShop?.name ?? 'none selected'}. Tap to switch shop.`}
        accessibilityState={{ expanded: open }}
        haptic="selection"
        scaleTo={0.97}
        onPress={() => setOpen(true)}
        style={styles.trigger}
      >
        <Ionicons name="storefront-outline" size={14} color={colors.primary} />
        <Text style={styles.triggerText} numberOfLines={1}>
          {activeShop?.name ?? 'Select a shop'}
        </Text>
        <Ionicons name="swap-vertical" size={14} color={colors.primary} />
      </Touchable>

      <Modal visible={open} transparent animationType="none" onRequestClose={() => setOpen(false)} statusBarTranslucent>
        <View style={styles.modalRoot}>
          <Animated.View entering={reduceMotion ? undefined : FadeIn.duration(180)} style={styles.backdrop}>
            <Touchable
              accessibilityRole="button"
              accessibilityLabel="Close"
              haptic="none"
              onPress={() => setOpen(false)}
              style={{ flex: 1 }}
            />
          </Animated.View>
          <Animated.View
            entering={reduceMotion ? undefined : SlideInDown.duration(280)}
            style={[styles.sheet, { paddingBottom: insets.bottom }]}
          >
            <View style={styles.grabber} />
            <View style={styles.sheetHeader}>
              <View style={styles.sheetHeaderText}>
                <Text style={styles.sheetTitle}>Switch shop</Text>
                <Text style={styles.sheetSubtitle}>Products are scoped to the selected shop.</Text>
              </View>
              <Touchable
                onPress={() => setOpen(false)}
                hitSlop={12}
                haptic="light"
                scaleTo={0.9}
                accessibilityRole="button"
                accessibilityLabel="Close"
              >
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </Touchable>
            </View>

            {shops.length === 0 ? (
              <EmptyState
                title="No shops yet"
                message="Create your first shop to start managing products."
                icon="storefront-outline"
              />
            ) : (
              <ScrollView contentContainerStyle={styles.list}>
                {shops.map((shop) => (
                  <ListItem
                    key={shop.id}
                    title={shop.name}
                    subtitle={joinLocation([shop.ward_name, shop.district_name]) || 'Location not set'}
                    onPress={() => handleSelect(shop.id)}
                    isActive={shop.id === activeShopId}
                    leading={
                      <View style={styles.shopIcon}>
                        <Ionicons name="storefront" size={18} color={colors.primaryDark} />
                      </View>
                    }
                  />
                ))}
              </ScrollView>
            )}

            <View style={styles.footer}>
              <Touchable
                accessibilityRole="button"
                accessibilityLabel="New shop"
                haptic="light"
                scaleTo={0.98}
                onPress={() => {
                  setOpen(false);
                  onAddShop();
                }}
                style={styles.footerButton}
              >
                <Ionicons name="add-circle-outline" size={18} color={colors.primaryDark} />
                <Text style={styles.footerText}>New shop</Text>
              </Touchable>
              {onManageShops ? (
                <Touchable
                  accessibilityRole="button"
                  accessibilityLabel="Manage shops"
                  haptic="light"
                  scaleTo={0.98}
                  onPress={() => {
                    setOpen(false);
                    onManageShops();
                  }}
                  style={styles.footerButton}
                >
                  <Ionicons name="settings-outline" size={18} color={colors.textSecondary} />
                  <Text style={[styles.footerText, { color: colors.textSecondary }]}>Manage</Text>
                </Touchable>
              ) : null}
            </View>
          </Animated.View>
        </View>
      </Modal>
    </>
  );
}
