import { Redirect, Stack } from 'expo-router';
import { useEffect } from 'react';

import { useAuthStore } from '@/store/authStore';
import { useCompanyStore } from '@/store/companyStore';
import { useShopStore } from '@/store/shopStore';
import { useTheme } from '@/theme';

/**
 * Guards the signed-in area. A user without a valid session is redirected to
 * login before any app screen can mount.
 *
 * The shop list is also loaded here: every other screen depends on it, and
 * after registration the shop store already knows which shop to prefer.
 */
export default function AppLayout() {
  const status = useAuthStore((state) => state.status);
  const shopsStatus = useShopStore((state) => state.status);
  const currencyStatus = useCompanyStore((state) => state.status);
  const { colors } = useTheme();

  useEffect(() => {
    if (status !== 'authenticated') return;
    const company = useCompanyStore.getState();

    if (shopsStatus === 'idle') {
      const shops = useShopStore.getState();
      // A failed refresh leaves the store in `error`; screens show a retry button.
      void shops.hydrate().then(() => shops.refresh()).catch(() => undefined);
    }

    if (shopsStatus === 'idle' && currencyStatus === 'idle') {
      void company.hydrate().then(() => useCompanyStore.getState().loadCurrency()).catch(() => undefined);
    }
  }, [status, shopsStatus, currencyStatus]);

  if (status !== 'authenticated') {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
      <Stack.Screen name="shops/create" options={{ presentation: 'modal' }} />
      <Stack.Screen name="shops/[id]/edit" options={{ presentation: 'card' }} />
      <Stack.Screen name="products/create" options={{ presentation: 'modal' }} />
      <Stack.Screen name="products/[id]" options={{ presentation: 'card' }} />
      <Stack.Screen name="customers" />
      <Stack.Screen name="suppliers" />
    </Stack>
  );
}