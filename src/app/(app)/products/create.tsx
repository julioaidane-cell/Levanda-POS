import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';

import { EmptyState, Header, ProductForm, useToast } from '@/components/';
import { createProduct } from '@/api/products';
import { toMessage } from '@/api/errors';
import { useActiveShop } from '@/store/shopStore';
import { layout, makeStyles, spacing } from '@/theme';

export default function CreateProductScreen() {
  const router = useRouter();
  const styles = useStyles();
  const activeShop = useActiveShop();
  const toast = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const onSubmit = async (payload: Parameters<typeof createProduct>[1]) => {
    if (activeShop === null) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await createProduct(activeShop.id, payload);
      toast.success('Product created');
      router.back();
    } catch (caught) {
      setError(caught ?? new Error(toMessage(caught)));
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.root}>
      <Header title="New product" subtitle={activeShop?.name ?? 'No active shop'} showBack />

      {activeShop === null ? (
        <View style={styles.centered}>
          <EmptyState
            title="No active shop"
            message="Pick a shop before adding products."
            icon="storefront-outline"
            actionLabel="Go to shops"
            onAction={() => router.replace('/shops')}
          />
        </View>
      ) : (
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            style={styles.flex}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
          >
            <ProductForm
              shopId={activeShop.id}
              submitLabel="Create product"
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
