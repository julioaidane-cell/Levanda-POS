import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/inter';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Loader } from '@/components/Loader';
import { ToastProvider } from '@/components/Toast';
import { useAuthStore } from '@/store/authStore';
import { ThemeProvider, useTheme } from '@/theme';

// Hold the native splash until the brand font is ready, so text never flashes
// in the platform font before swapping to Inter.
void SplashScreen.preventAutoHideAsync();

/**
 * Root layout. Owns the font + session bootstrap and renders either the auth
 * stack or the app stack — unauthenticated users never see the app, and vice
 * versa.
 */
export default function RootLayout() {
  const bootstrap = useAuthStore((state) => state.bootstrap);
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  const ready = fontsLoaded || fontError !== null;

  useEffect(() => {
    if (ready) void SplashScreen.hideAsync().catch(() => undefined);
  }, [ready]);

  if (!ready) return null;

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <ToastProvider>
          <RootContent />
        </ToastProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

function RootContent() {
  const { colors: theme } = useTheme();
  const status = useAuthStore((state) => state.status);

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <StatusBar style="light" />
      {status === 'idle' || status === 'loading' ? (
        <View style={[styles.splash, { backgroundColor: theme.background }]}>
          <Loader label="Starting Levanda POS…" />
        </View>
      ) : (
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: theme.background },
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
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  splash: { flex: 1, justifyContent: 'center' },
});
