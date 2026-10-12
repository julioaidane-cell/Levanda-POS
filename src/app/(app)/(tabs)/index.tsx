import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { Text, View } from 'react-native';

import { Badge, Card, EmptyState, ErrorView, FAB, ListItem, ScreenHeader, ScreenScroll, Section, StatTile } from '@/components/';
import { fetchProducts } from '@/api/products';
import type { ProductListPayload } from '@/api/types';
import { useAsyncResource } from '@/hooks/useAsyncResource';
import { SkeletonList } from '@/components/Loader';
import { useActiveShop, useShopStore } from '@/store/shopStore';
import { makeStyles, radius, spacing, typography, useTheme } from '@/theme';
import { formatCurrency, formatCurrencyCompact, formatNumber } from '@/utils/format';

export default function DashboardScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useStyles();

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
  const sell = useCallback(() => router.push('/sell'), [router]);

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
      <ScreenHeader />

      <ScreenScroll onRefresh={onRefresh} refreshing={products.isRefreshing} withFAB>
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
                icon={<Ionicons name="storefront-outline" size={16} color={colors.primary} />}
              />
              <StatTile
                label="Products"
                value={products.isLoading ? '—' : formatNumber(products.data?.total_available_products ?? 0)}
                icon={<Ionicons name="cube-outline" size={16} color={colors.textSecondary} />}
              />
            </View>
            <View style={styles.tileRow}>
              <StatTile
                label="Stock on hand"
                value={products.isLoading ? '—' : formatNumber(products.data?.total_quantity ?? 0)}
                tone="success"
                icon={<Ionicons name="layers-outline" size={16} color={colors.success} />}
              />
              <StatTile
                label="Retail value"
                value={products.isLoading ? '—' : formatCurrencyCompact(stockValue)}
                tone="warning"
                icon={<Ionicons name="cash-outline" size={16} color={colors.warning} />}
              />
            </View>

            {lowStock.length > 0 ? (
              <Section title="Needs attention">
                <View style={styles.alert}>
                  <View style={styles.alertIcon}>
                    <Ionicons name="warning-outline" size={18} color={colors.warning} />
                  </View>
                  <Text style={styles.alertText}>
                    {lowStock.length} product{lowStock.length === 1 ? '' : 's'} at or below the minimum stock level.
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color={colors.textDisabled} />
                </View>
              </Section>
            ) : null}

            <Section title="Recently added" caption="Newest products in the active shop.">
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
                  <View style={[styles.actionIcon, { backgroundColor: colors.primaryTint }]}>
                    <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
                  </View>
                  <Text style={styles.actionLabel}>New shop</Text>
                  <Badge label="Manage" tone="neutral" />
                </Card>
                <Card onPress={() => router.push('/products/create')} style={styles.actionCard}>
                  <View style={[styles.actionIcon, { backgroundColor: colors.primaryTint }]}>
                    <Ionicons name="cube-outline" size={20} color={colors.primary} />
                  </View>
                  <Text style={styles.actionLabel}>New product</Text>
                  <Badge label="Inventory" tone="neutral" />
                </Card>
              </View>
            </Section>
          </>
        ) : null}
      </ScreenScroll>

      <FAB icon="cart-outline" label="Sell Products" accessibilityLabel="Sell products" onPress={sell} />
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  root: { flex: 1, backgroundColor: c.background },
  tileRow: { flexDirection: 'row', gap: spacing.md },
  list: { gap: spacing.sm },
  productIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: c.primaryTint,
  },
  alert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: c.warningTint,
    borderWidth: 1,
    borderColor: c.warningTint,
  },
  alertIcon: {
    width: 34,
    height: 34,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: c.surface,
  },
  alertText: { ...typography.body, color: c.text, flex: 1 },
  actionRow: { flexDirection: 'row', gap: spacing.md },
  actionCard: { flex: 1, gap: spacing.sm },
  actionIcon: { width: 40, height: 40, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  actionLabel: { ...typography.subheading, color: c.text },
}));
