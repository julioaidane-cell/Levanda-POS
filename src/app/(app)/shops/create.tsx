import { useRouter } from 'expo-router';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';

import { Header, ShopForm } from '@/components/';
import { useShopStore } from '@/store/shopStore';
import { colors, layout, spacing } from '@/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CreateShopScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const create = useShopStore((state) => state.create);
  const isSubmitting = useShopStore((state) => state.isSubmitting);
  const error = useShopStore((state) => state.error);

  const onSubmit = async (payload: Parameters<typeof create>[0]) => {
    await create(payload);
    router.back();
  };

  return (
    <View style={styles.root}>
      <View style={{ paddingTop: insets.top }}>
        <Header title="New shop" subtitle="Add a branch or a new location" showBack />
      </View>
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

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  content: { padding: layout.screenPadding, paddingBottom: spacing.huge },
});