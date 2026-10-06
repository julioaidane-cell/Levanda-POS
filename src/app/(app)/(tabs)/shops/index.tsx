import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ConfirmDialog, EmptyState, ErrorView, Header, ListItem, ScreenScroll } from '@/components/';
import { SkeletonList } from '@/components/Loader';
import { useShopStore } from '@/store/shopStore';
import { colors, radius, spacing, typography } from '@/theme';
import { joinLocation } from '@/utils/format';

export default function ShopsListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const shops = useShopStore((state) => state.shops);
  const status = useShopStore((state) => state.status);
  const error = useShopStore((state) => state.error);
  const activeShopId = useShopStore((state) => state.activeShopId);
  const refresh = useShopStore((state) => state.refresh);
  const setActiveShop = useShopStore((state) => state.setActiveShop);
  const remove = useShopStore((state) => state.remove);

  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  // Reload on every focus so a shop created on another screen appears here.
  useFocusEffect(
    useCallback(() => {
      // The signed-in layout already loads shops on first mount; skipping the
      // initial `idle` state here avoids firing the same request twice.
      if (useShopStore.getState().status === 'idle') return;
      void useShopStore.getState().refresh().catch(() => undefined);
    }, []),
  );

  const pendingShop = shops.find((shop) => shop.id === pendingDeleteId) ?? null;

  const confirmDelete = useCallback(async () => {
    if (pendingDeleteId === null) return;
    try {
      await remove(pendingDeleteId);
    } catch {
      // The store already surfaces the message.
    } finally {
      setPendingDeleteId(null);
    }
  }, [pendingDeleteId, remove]);

  return (
    <View style={styles.root}>
      <View style={{ paddingTop: insets.top }}>
        <Header
          title="Shops"
          subtitle={`${shops.length} shop${shops.length === 1 ? '' : 's'} available`}
          showShopSwitcher
          onAddShop={() => router.push('/shops/create')}
          actions={[{ icon: 'add', label: 'Add shop', onPress: () => router.push('/shops/create') }]}
        />
      </View>

      <ScreenScroll onRefresh={() => void refresh().catch(() => undefined)} refreshing={status === 'loading' && shops.length > 0}>
        {error && status === 'error' ? <ErrorView error={error} onRetry={() => void refresh().catch(() => undefined)} /> : null}

        {status === 'loading' && shops.length === 0 ? (
          <SkeletonList count={4} />
        ) : shops.length === 0 ? (
          <EmptyState
            title="No shops yet"
            message="Create a shop to organise your products and locations."
            icon="storefront-outline"
            actionLabel="Create shop"
            onAction={() => router.push('/shops/create')}
          />
        ) : (
          <View style={styles.list}>
            {shops.map((shop) => (
              <View key={shop.id} style={styles.itemWrap}>
                <ListItem
                  title={shop.name}
                  subtitle={joinLocation([shop.ward_name, shop.district_name]) || 'Location not set'}
                  isActive={shop.id === activeShopId}
                  badge={shop.id === activeShopId ? { label: 'Active', tone: 'primary' } : undefined}
                  onPress={() => void setActiveShop(shop.id)}
                  leading={
                    <View style={styles.icon}>
                      <Ionicons name="storefront" size={18} color={colors.primaryDark} />
                    </View>
                  }
                />
                <View style={styles.itemActions}>
                  <Text style={styles.hint}>Tap to make active</Text>
                  <View style={styles.actionButtons}>
                    <IconAction
                      icon="create-outline"
                      label="Edit"
                      onPress={() => router.push(`/shops/${shop.id}/edit`)}
                    />
                    <IconAction
                      icon="trash-outline"
                      label="Delete"
                      tone="danger"
                      onPress={() => setPendingDeleteId(shop.id)}
                    />
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        <Text style={styles.footnote}>
          Products are always scoped to the active shop. Use the switcher in the header to change it.
        </Text>
      </ScreenScroll>

      <ConfirmDialog
        visible={pendingShop !== null}
        title="Delete shop?"
        message={
          pendingShop
            ? `"${pendingShop.name}" and its product list will be removed. This cannot be undone.`
            : ''
        }
        confirmLabel="Delete"
        destructive
        loading={status === 'loading'}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setPendingDeleteId(null)}
      />
    </View>
  );
}

interface IconActionProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  tone?: 'default' | 'danger';
}

function IconAction({ icon, label, onPress, tone = 'default' }: IconActionProps) {
  const color = tone === 'danger' ? colors.danger : colors.textSecondary;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={6}
      style={({ pressed }) => [styles.iconAction, pressed && styles.pressed]}
    >
      <Ionicons name={icon} size={15} color={color} />
      <Text style={[styles.iconActionLabel, { color }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  list: { gap: spacing.lg },
  itemWrap: { gap: spacing.xs },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xs,
  },
  hint: { ...typography.caption, color: colors.textMuted },
  actionButtons: { flexDirection: 'row', gap: spacing.sm },
  iconAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconActionLabel: { ...typography.caption, fontWeight: '600' },
  pressed: { opacity: 0.6 },
  icon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryTint,
  },
  footnote: { ...typography.caption, color: colors.textMuted, textAlign: 'center', marginTop: spacing.sm },
});