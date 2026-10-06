import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Badge, Card, EmptyState, ErrorView, Header, ListItem, ScreenScroll, Section, StatTile } from '@/components/';
import { fetchProducts } from '@/api/products';
import type { ProductListPayload } from '@/api/types';
import { useAsyncResource } from '@/hooks/useAsyncResource';
import { SkeletonList } from '@/components/Loader';
import { useActiveShop, useShopStore } from '@/store/shopStore';
import { colors, radius, spacing, typography } from '@/theme';
import { formatCurrency, formatNumber } from '@/utils/format';

export default function DashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const activeShop = useActiveShop();
  const shops = useShopStore((state) => state.shops);
  const shopsStatus = useShopStore((state) => state.status);
  const shopsError = useShopStore((state) => state.error);
  const refreshShops = useShopStore((state) => state.refresh);

  // "No shops yet" is only shown once a load has actually succeeded, so the
  // empty state never flashes while the first request is still in flight.
  const shopsLoaded = shopsStatus === 'ready' || shopsStatus === 'error';

  // Keyed on the shop id so the list refetches whenever the active shop changes.
  const activeShopId = useMemo(() => activeShop?.id ?? null, [activeShop]);
  const products = useAsyncResource<ProductListPayload | null>(
    async () => (activeShopId === null ? null : fetchProducts(activeShopId)),
    [activeShopId],
  );

  const onRefresh = useCallback(async () => {
    await Promise.all([refreshShops(), products.refresh()]);
  }, [refreshShops, products]);

  // Silent refetch on focus, so a product added on another screen shows up here.
  useFocusEffect(
    useCallback(() => {
      if (products.data === null) return;
      void products.refresh();
    }, [products.data, products.refresh]),
  );

  const addShop = useCallback(() => router.push('/shops/create'), [router]);
  const manageShops = useCallback(() => router.push('/shops'), [router]);

  const list = products.data?.products ?? [];
  const lowStock = list.filter((product) => {
    const quantity = Number.parseFloat(product.quantity ?? '0');
    const minimum = Number.parseFloat(product.min_stock_level ?? '');
    return Number.isFinite(minimum) && quantity <= minimum;
  });

  const stockValue = list.reduce(
    (total, product) =>
      total + Number.parseFloat(product.quantity ?? '0') * Number.parseFloat(product.retail_price ?? '0'),
    0,
  );

  return (
    <View style={styles.root}>
      <View style={{ paddingTop: insets.top }}>
        <Header
          title="Dashboard"
          subtitle={activeShop?.name ?? 'No active shop'}
          showShopSwitcher
          onAddShop={addShop}
          onManageShops={manageShops}
          actions={[{ icon: 'log-out-outline', label: 'Log out', onPress: () => router.push('/more') }]}
        />
      </View>

      <ScreenScroll onRefresh={onRefresh} refreshing={products.isRefreshing}>
        {shopsStatus === 'loading' && shops.length === 0 ? <SkeletonList count={3} /> : null}

        {shopsStatus === 'error' && shops.length === 0 ? (
          <ErrorView
            error={new Error(shopsError ?? 'Could not load your shops.')}
            onRetry={() => void refreshShops().catch(() => undefined)}
          />
        ) : null}

        {shopsLoaded && shops.length === 0 ? (
          <Card>
            <EmptyState
              title="No shops yet"
              message="Create your first shop to start adding products."
              icon="storefront-outline"
              actionLabel="Create shop"
              onAction={addShop}
            />
          </Card>
        ) : null}

        {shops.length > 0 ? (
          <>
            <View style={styles.tileRow}>
              <StatTile
                label="Shops"
                value={formatNumber(shops.length)}
                tone="primary"
                icon={<Ionicons name="storefront-outline" size={13} color={colors.primary} />}
              />
              <StatTile
                label="Products"
                value={products.isLoading ? '—' : formatNumber(products.data?.total_available_products ?? 0)}
                icon={<Ionicons name="cube-outline" size={13} color={colors.textMuted} />}
              />
            </View>
            <View style={styles.tileRow}>
              <StatTile
                label="Stock on hand"
                value={products.isLoading ? '—' : formatNumber(products.data?.total_quantity ?? 0)}
                tone="success"
                icon={<Ionicons name="layers-outline" size={13} color={colors.success} />}
              />
              <StatTile
                label="Retail value"
                value={products.isLoading ? '—' : formatCurrency(stockValue)}
                tone="warning"
                icon={<Ionicons name="cash-outline" size={13} color={colors.warning} />}
              />
            </View>

            {lowStock.length > 0 ? (
              <Section title="Needs attention">
                <Card>
                  <View style={styles.alertRow}>
                    <Ionicons name="warning-outline" size={18} color={colors.warning} />
                    <Text style={styles.alertText}>
                      {lowStock.length} product{lowStock.length === 1 ? '' : 's'} at or below the minimum stock level.
                    </Text>
                  </View>
                </Card>
              </Section>
            ) : null}

            <Section
              title="Recently added"
              caption="Newest products in the active shop."
            >
              {products.isLoading ? (
                <SkeletonList count={3} />
              ) : products.error ? (
                <ErrorView error={products.error} onRetry={products.load} />
              ) : list.length === 0 ? (
                <Card>
                  <EmptyState
                    title="No products yet"
                    message="Add your first product to start tracking stock."
                    icon="cube-outline"
                    actionLabel="Add product"
                    onAction={() => router.push('/products/create')}
                  />
                </Card>
              ) : (
                <View style={styles.list}>
                  {list.slice(0, 4).map((product) => (
                    <ListItem
                      key={product.id}
                      title={product.name}
                      subtitle={product.product_category_name ?? 'Uncategorised'}
                      meta={formatCurrency(product.retail_price)}
                      metaCaption={`${formatNumber(product.quantity)} in stock`}
                      showChevron
                      onPress={() => router.push(`/products/${product.id}`)}
                      leading={
                        <View style={styles.productIcon}>
                          <Ionicons name="cube-outline" size={17} color={colors.primaryDark} />
                        </View>
                      }
                    />
                  ))}
                </View>
              )}
            </Section>

            <Section title="Quick actions">
              <View style={styles.actionRow}>
                <Card onPress={addShop} style={styles.actionCard}>
                  <Ionicons name="add-circle-outline" size={22} color={colors.primary} />
                  <Text style={styles.actionLabel}>New shop</Text>
                  <Badge label="Manage" tone="neutral" />
                </Card>
                <Card onPress={() => router.push('/products/create')} style={styles.actionCard}>
                  <Ionicons name="cube-outline" size={22} color={colors.primary} />
                  <Text style={styles.actionLabel}>New product</Text>
                  <Badge label="Inventory" tone="neutral" />
                </Card>
              </View>
            </Section>
          </>
        ) : null}
      </ScreenScroll>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  tileRow: { flexDirection: 'row', gap: spacing.md },
  list: { gap: spacing.sm },
  productIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryTint,
  },
  alertRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  alertText: { ...typography.body, color: colors.text, flex: 1 },
  actionRow: { flexDirection: 'row', gap: spacing.md },
  actionCard: { flex: 1, gap: spacing.sm },
  actionLabel: { ...typography.subheading, color: colors.text },
});