import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Badge, Button, Card, ConfirmDialog, ErrorView, Header, Loader, Section } from '@/components/';
import { deleteProduct, fetchProduct } from '@/api/products';
import type { ProductDetail } from '@/api/types';
import { useAsyncResource } from '@/hooks/useAsyncResource';
import { useActiveShop } from '@/store/shopStore';
import { colors, radius, spacing, typography } from '@/theme';
import { formatCurrency, formatDate, formatNumber, toNumber } from '@/utils/format';

export default function ProductDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id?: string }>();
  const productId = Number(params.id);
  const activeShop = useActiveShop();

  const shopId = useMemo(() => activeShop?.id ?? null, [activeShop]);
  const product = useAsyncResource<ProductDetail | null>(
    async () => (shopId === null || !Number.isFinite(productId) ? null : fetchProduct(shopId, productId)),
    [shopId, productId],
  );

  const [confirming, setConfirming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const onDelete = useCallback(async () => {
    if (shopId === null) return;
    setIsDeleting(true);
    try {
      await deleteProduct(shopId, productId);
      setConfirming(false);
      router.back();
    } catch {
      setConfirming(false);
      setIsDeleting(false);
    }
  }, [shopId, productId, router]);

  const detail = product.data;
  // The list endpoint calls it `name`, the detail endpoint calls it `product_name`.
  const title = detail?.product_name ?? '';
  const quantity = toNumber(detail?.quantity);
  const minimum = toNumber(detail?.min_stock_level);
  const isLow = quantity !== null && minimum !== null && quantity <= minimum;
  const margin =
    detail?.buying_price != null && detail?.retail_price != null
      ? toNumber(detail.retail_price)! - toNumber(detail.buying_price)!
      : null;

  if (!Number.isFinite(productId)) {
    return (
      <View style={styles.root}>
        <Header title="Product" showBack />
        <View style={styles.centered}>
          <ErrorView error={new Error('This product link is not valid.')} onRetry={() => router.back()} retryLabel="Go back" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <View style={{ paddingTop: insets.top }}>
        <Header
          title={title || 'Product'}
          subtitle={activeShop?.name}
          showBack
          actions={
            shopId === null
              ? []
              : [{ icon: 'trash-outline', label: 'Delete product', onPress: () => setConfirming(true) }]
          }
        />
      </View>

      {product.isLoading ? (
        <Loader label="Loading product…" full />
      ) : product.error ? (
        <View style={styles.centered}>
          <ErrorView error={product.error} onRetry={product.load} />
        </View>
      ) : detail === null ? (
        <View style={styles.centered}>
          <Card>
            <View style={styles.notFound}>
              <Ionicons name="cube-outline" size={30} color={colors.textMuted} />
              <Text style={styles.notFoundTitle}>Product not found</Text>
              <Text style={styles.notFoundText}>
                It may have been removed, or it belongs to a different shop.
              </Text>
              <Button label="Back to products" onPress={() => router.back()} variant="secondary" size="sm" />
            </View>
          </Card>
        </View>
      ) : (
        <View style={styles.body}>
          <Card style={styles.heroCard}>
            <View style={styles.heroTop}>
              <View style={styles.heroIcon}>
                <Ionicons name="cube" size={24} color={colors.textInverse} />
              </View>
              <View style={styles.heroText}>
                <Text style={styles.heroTitle} numberOfLines={2}>
                  {title}
                </Text>
                <Badge
                  label={detail.product_category_cname ?? 'Uncategorised'}
                  tone={detail.product_category_cname ? 'primary' : 'neutral'}
                />
              </View>
            </View>
            <View style={styles.priceRow}>
              <View style={styles.priceBlock}>
                <Text style={styles.priceLabel}>Retail</Text>
                <Text style={styles.priceValue}>{formatCurrency(detail.retail_price)}</Text>
              </View>
              <View style={styles.priceDivider} />
              <View style={styles.priceBlock}>
                <Text style={styles.priceLabel}>Buying</Text>
                <Text style={styles.priceValue}>{formatCurrency(detail.buying_price)}</Text>
              </View>
            </View>
          </Card>

          <Section title="Stock">
            <Card>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Quantity in stock</Text>
                <Text style={styles.detailValue}>{formatNumber(detail.quantity)}</Text>
              </View>
              <View style={styles.separator} />
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Minimum stock level</Text>
                <Text style={styles.detailValue}>{formatNumber(detail.min_stock_level)}</Text>
              </View>
              <View style={styles.separator} />
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Estimated margin</Text>
                <Text style={[styles.detailValue, margin !== null && margin > 0 && styles.positive]}>
                  {margin === null ? '—' : formatCurrency(margin)}
                </Text>
              </View>
              {isLow ? (
                <View style={styles.alert}>
                  <Ionicons name="warning-outline" size={16} color={colors.warning} />
                  <Text style={styles.alertText}>Stock is at or below the minimum level.</Text>
                </View>
              ) : null}
            </Card>
          </Section>

          <Section title="Details">
            <Card>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Added</Text>
                <Text style={styles.detailValue}>{formatDate(detail.product_created_at)}</Text>
              </View>
              <View style={styles.separator} />
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Expires</Text>
                <Text style={styles.detailValue}>{formatDate(detail.expire_date)}</Text>
              </View>
              <View style={styles.separator} />
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Product ID</Text>
                <Text style={styles.detailValue}>{detail.id}</Text>
              </View>
            </Card>
          </Section>

          <Button
            label="Delete product"
            onPress={() => setConfirming(true)}
            variant="secondary"
            fullWidth
            icon="trash-outline"
          />
        </View>
      )}

      <ConfirmDialog
        visible={confirming}
        title="Delete product?"
        message={title ? `"${title}" will be removed from this shop.` : 'This product will be removed.'}
        confirmLabel="Delete"
        destructive
        loading={isDeleting}
        onConfirm={() => void onDelete()}
        onCancel={() => setConfirming(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, justifyContent: 'center', padding: spacing.lg },
  body: { flex: 1 },
  heroCard: { backgroundColor: colors.chrome, borderColor: colors.chrome, gap: spacing.lg },
  heroTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  heroIcon: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  heroText: { flex: 1, gap: spacing.xs },
  heroTitle: { ...typography.heading, color: colors.textInverse },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  priceBlock: { flex: 1, gap: 2 },
  priceDivider: { width: 1, height: 34, backgroundColor: 'rgba(255,255,255,0.15)' },
  priceLabel: { ...typography.caption, color: colors.chromeMuted },
  priceValue: { ...typography.title, color: colors.textInverse },
  detailRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md, paddingVertical: spacing.sm },
  detailLabel: { ...typography.body, color: colors.textMuted, flexShrink: 1 },
  detailValue: { ...typography.bodyStrong, color: colors.text },
  positive: { color: colors.success },
  separator: { height: 1, backgroundColor: colors.border },
  alert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.warningTint,
  },
  alertText: { ...typography.label, color: colors.warning, flex: 1 },
  notFound: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.lg },
  notFoundTitle: { ...typography.subheading, color: colors.text },
  notFoundText: { ...typography.body, color: colors.textMuted, textAlign: 'center' },
});