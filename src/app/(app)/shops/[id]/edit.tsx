import { useLocalSearchParams, useRouter } from 'expo-router';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';

import { ErrorView, Header, Loader, ShopForm, useToast } from '@/components/';
import { fetchShop } from '@/api/shops';
import type { ShopDetail } from '@/api/types';
import { useAsyncResource } from '@/hooks/useAsyncResource';
import { useShopStore } from '@/store/shopStore';
import { layout, makeStyles, spacing } from '@/theme';

export default function EditShopScreen() {
  const router = useRouter();
  const styles = useStyles();
  const toast = useToast();
  const params = useLocalSearchParams<{ id?: string }>();
  const shopId = Number(params.id);

  const update = useShopStore((state) => state.update);
  const isSubmitting = useShopStore((state) => state.isSubmitting);
  const error = useShopStore((state) => state.error);

  const shop = useAsyncResource<ShopDetail | null>(
    async () => (Number.isFinite(shopId) ? fetchShop(shopId) : null),
    [shopId],
  );

  const onSubmit = async (payload: Parameters<typeof update>[1]) => {
    await update(shopId, payload);
    toast.success('Shop updated');
    router.back();
  };

  if (!Number.isFinite(shopId)) {
    return (
      <View style={styles.root}>
        <Header title="Edit shop" showBack />
        <View style={styles.centered}>
          <ErrorView error={new Error('This shop link is not valid.')} onRetry={() => router.back()} retryLabel="Go back" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <Header title="Edit shop" subtitle={shop.data?.name} showBack />

      {shop.isLoading ? (
        <Loader label="Loading shop…" full />
      ) : shop.error || !shop.data ? (
        <View style={styles.centered}>
          <ErrorView error={shop.error ?? new Error('Shop not found.')} onRetry={shop.load} />
        </View>
      ) : (
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            style={styles.flex}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
          >
            <ShopForm
              initial={{
                name: shop.data.name,
                countryId: shop.data.country_id,
                regionId: shop.data.region_id,
                districtId: shop.data.district_id,
                wardId: shop.data.ward_id,
              }}
              submitLabel="Save changes"
              isSubmitting={isSubmitting}
              bannerError={error}
              onSubmit={onSubmit}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  root: { flex: 1, backgroundColor: c.background },
  flex: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', padding: layout.screenPadding },
  content: { padding: layout.screenPadding, paddingBottom: spacing.huge },
}));
