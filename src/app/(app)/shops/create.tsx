import { useRouter } from 'expo-router';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';

import { Header, ShopForm, useToast } from '@/components/';
import { useShopStore } from '@/store/shopStore';
import { layout, makeStyles, spacing } from '@/theme';

export default function CreateShopScreen() {
  const router = useRouter();
  const styles = useStyles();
  const toast = useToast();
  const create = useShopStore((state) => state.create);
  const isSubmitting = useShopStore((state) => state.isSubmitting);
  const error = useShopStore((state) => state.error);

  const onSubmit = async (payload: Parameters<typeof create>[0]) => {
    await create(payload);
    toast.success('Shop created');
    router.back();
  };

  return (
    <View style={styles.root}>
      <Header title="New shop" subtitle="Add a branch or a new location" showBack />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <ShopForm
            initial={{ countryId: null, regionId: null, districtId: null, wardId: null }}
            submitLabel="Create shop"
            isSubmitting={isSubmitting}
            bannerError={error}
            onSubmit={onSubmit}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  root: { flex: 1, backgroundColor: c.background },
  flex: { flex: 1 },
  content: { padding: layout.screenPadding, paddingBottom: spacing.huge },
}));
