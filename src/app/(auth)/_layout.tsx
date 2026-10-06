import { Redirect, Stack } from 'expo-router';

import { useAuthStore } from '@/store/authStore';
import { colors } from '@/theme';

/** Keeps signed-in users out of the auth screens. */
export default function AuthLayout() {
  const status = useAuthStore((state) => state.status);

  if (status === 'authenticated') {
    return <Redirect href="/(app)/(tabs)" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
    </Stack>
  );
}