import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { EmptyState } from './EmptyState';
import { ListItem } from './ListItem';
import { useShopStore } from '@/store/shopStore';
import { colors, elevation, radius, spacing, typography } from '@/theme';
import { joinLocation } from '@/utils/format';

export interface ShopSwitcherProps {
  /** Compact trigger for the app bar; omit to render the trigger-less content. */
  onAddShop: () => void;
  onManageShops?: () => void;
}

/**
 * Bottom-sheet shop switcher. Selecting a shop updates the store, which is the
 * single source of truth for every product request in the app.
 */
export function ShopSwitcher({ onAddShop, onManageShops }: ShopSwitcherProps) {
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
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Active shop: ${activeShop?.name ?? 'none selected'}. Tap to switch shop.`}
        onPress={() => setOpen(true)}
        style={({ pressed }) => [styles.trigger, pressed && styles.triggerPressed]}
      >
        <Ionicons name="storefront-outline" size={14} color={colors.primarySoft} />
        <Text style={styles.triggerText} numberOfLines={1}>
          {activeShop?.name ?? 'Select a shop'}
        </Text>
        <Ionicons name="swap-vertical" size={14} color={colors.primarySoft} />
      </Pressable>

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)} statusBarTranslucent>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)} accessibilityLabel="Close" />
        <View style={styles.sheet}>
          <View style={styles.grabber} />
          <View style={styles.sheetHeader}>
            <View style={styles.sheetHeaderText}>
              <Text style={styles.sheetTitle}>Switch shop</Text>
              <Text style={styles.sheetSubtitle}>Products are scoped to the selected shop.</Text>
            </View>
            <Pressable onPress={() => setOpen(false)} hitSlop={12} accessibilityRole="button" accessibilityLabel="Close">
              <Ionicons name="close" size={22} color={colors.textSecondary} />
            </Pressable>
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
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                setOpen(false);
                onAddShop();
              }}
              style={({ pressed }) => [styles.footerButton, pressed && styles.triggerPressed]}
            >
              <Ionicons name="add-circle-outline" size={18} color={colors.primaryDark} />
              <Text style={styles.footerText}>New shop</Text>
            </Pressable>
            {onManageShops ? (
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  setOpen(false);
                  onManageShops();
                }}
                style={({ pressed }) => [styles.footerButton, pressed && styles.triggerPressed]}
              >
                <Ionicons name="settings-outline" size={18} color={colors.textSecondary} />
                <Text style={[styles.footerText, { color: colors.textSecondary }]}>Manage</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
    maxWidth: '100%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 1,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  triggerPressed: { opacity: 0.75 },
  triggerText: { ...typography.label, color: colors.textInverse, flexShrink: 1 },

  backdrop: { flex: 1, backgroundColor: colors.overlay },
  sheet: {
    maxHeight: '80%',
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    ...elevation.sheet,
  },
  grabber: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.borderStrong,
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
  sheetTitle: { ...typography.title, color: colors.text },
  sheetSubtitle: { ...typography.caption, color: colors.textMuted },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md, gap: spacing.sm },
  shopIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryTint,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  footerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    minHeight: 46,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
  },
  footerText: { ...typography.bodyStrong, color: colors.primaryDark },
});