import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Loader } from '@/components/Loader';
import { useAuthStore } from '@/store/authStore';
import { colors } from '@/theme';

/**
 * Root layout. Owns the session bootstrap and renders either the auth stack or
 * the app stack — unauthenticated users never see the app, and vice versa.
 */
export default function RootLayout() {
  const status = useAuthStore((state) => state.status);
  const bootstrap = useAuthStore((state) => state.bootstrap);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  return (
    <SafeAreaProvider>
      <View style={styles.root}>
        <StatusBar style="light" />
        {status === 'idle' || status === 'loading' ? (
          <View style={styles.splash}>
            <Loader label="Starting Levanda POS…" />
          </View>
        ) : (
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.background },
              animation: 'fade',
            }}
          >
            {status === 'authenticated' ? (
              <Stack.Screen name="(app)" />
            ) : (
              <Stack.Screen name="(auth)" />
            )}
          </Stack>
        )}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  splash: { flex: 1, backgroundColor: colors.chrome, justifyContent: 'center' },
});