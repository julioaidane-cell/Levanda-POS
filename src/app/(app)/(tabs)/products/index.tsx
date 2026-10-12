import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { View } from 'react-native';

import { EmptyState, ErrorView, FAB, ListItem, ScreenHeader, ScreenScroll, Section, StatTile } from '@/components/';
import { SkeletonList } from '@/components/Loader';
import { fetchProducts } from '@/api/products';
import type { ProductListPayload } from '@/api/types';
import { useAsyncResource } from '@/hooks/useAsyncResource';
import { useActiveShop, useShopStore } from '@/store/shopStore';
import { makeStyles, radius, spacing, useTheme } from '@/theme';
import { formatCurrency, formatNumber } from '@/utils/format';

export default function ProductsListScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useStyles();

  const activeShop = useActiveShop();
  const refreshShops = useShopStore((state) => state.refresh);
  // Guards the "select a shop" prompt until the shop list has actually loaded.
  const shopsStatus = useShopStore((state) => state.status);
  const shopsLoaded = shopsStatus === 'ready' || shopsStatus === 'error';

  // The list is keyed on the active shop id, so switching shops refetches.
  const activeShopId = useMemo(() => activeShop?.id ?? null, [activeShop]);
  const products = useAsyncResource<ProductListPayload | null>(
    async () => (activeShopId === null ? null : fetchProducts(activeShopId)),
    [activeShopId],
  );

  const onRefresh = useCallback(async () => {
    await Promise.all([refreshShops(), products.refresh()]);
  }, [refreshShops, products]);

  // Silent refetch on focus so a product created or deleted elsewhere appears.
  useFocusEffect(
    useCallback(() => {
      if (products.data === null) return;
      void products.refresh();
    }, [products.data, products.refresh]),
  );

  const list = products.data?.products ?? [];

  return (
    <View style={styles.root}>
      <ScreenHeader />

      <ScreenScroll onRefresh={onRefresh} refreshing={products.isRefreshing} withFAB>
        {activeShopId === null && shopsLoaded ? (
          <EmptyState
            title="Select a shop first"
            message="Products belong to a shop. Pick or create one to continue."
            icon="storefront-outline"
            actionLabel="Create shop"
            onAction={() => router.push('/shops/create')}
          />
        ) : null}

        {activeShopId === null && !shopsLoaded ? <SkeletonList count={5} /> : null}

        {activeShopId !== null ? (
          <>
            <View style={styles.tileRow}>
              <StatTile
                label="Products"
                value={products.isLoading ? '—' : formatNumber(products.data?.total_available_products ?? 0)}
                tone="primary"
                icon={<Ionicons name="cube-outline" size={16} color={colors.primary} />}
              />
              <StatTile
                label="Units in stock"
                value={products.isLoading ? '—' : formatNumber(products.data?.total_quantity ?? 0)}
                icon={<Ionicons name="layers-outline" size={16} color={colors.textSecondary} />}
              />
            </View>

            {products.isLoading ? (
              <SkeletonList count={5} />
            ) : products.error ? (
              <ErrorView error={products.error} onRetry={products.load} />
            ) : list.length === 0 ? (
              <EmptyState
                title="No products in this shop"
                message="Add your first product to start tracking stock and prices."
                icon="cube-outline"
                actionLabel="Add product"
                onAction={() => router.push('/products/create')}
              />
            ) : (
              <Section title={`${list.length} product${list.length === 1 ? '' : 's'}`}>
                <View style={styles.list}>
                  {list.map((product) => {
                    const quantity = Number.parseFloat(product.quantity ?? '0');
                    const minimum = Number.parseFloat(product.min_stock_level ?? '');
                    const isLow = Number.isFinite(minimum) && quantity <= minimum;
                    return (
                      <ListItem
                        key={product.id}
                        title={product.name}
                        subtitle={product.product_category_name ?? 'Uncategorised'}
                        meta={formatCurrency(product.retail_price)}
                        metaCaption={`${formatNumber(product.quantity)} in stock`}
                        badge={isLow ? { label: 'Low stock', tone: 'warning' } : undefined}
                        showChevron
                        onPress={() => router.push(`/products/${product.id}`)}
                        leading={
                          <View style={styles.icon}>
                            <Ionicons name="cube-outline" size={17} color={colors.primaryDark} />
                          </View>
                        }
                      />
                    );
                  })}
                </View>
              </Section>
            )}
          </>
        ) : null}
      </ScreenScroll>

      {activeShopId !== null ? (
        <FAB
          icon="add"
          label="Add product"
          accessibilityLabel="Add product"
          onPress={() => router.push('/products/create')}
        />
      ) : null}
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  root: { flex: 1, backgroundColor: c.background },
  tileRow: { flexDirection: 'row', gap: spacing.md },
  list: { gap: spacing.sm },
  icon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: c.primaryTint,
  },
}));
