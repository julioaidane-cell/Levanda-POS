import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/inter';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider as NavigationThemeProvider, type Theme } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo } from 'react';
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
  const { colors, isDark } = useTheme();
  const status = useAuthStore((state) => state.status);

  // Hand the active palette to Expo Router so default screens, headers and
  // transition surfaces never flash the wrong colour.
  const navigationTheme = useMemo<Theme>(() => {
    const base = isDark ? DarkTheme : DefaultTheme;
    return {
      ...base,
      dark: isDark,
      colors: {
        ...base.colors,
        primary: colors.primary,
        background: colors.background,
        card: colors.surface,
        text: colors.text,
        border: colors.border,
        notification: colors.danger,
      },
    };
  }, [isDark, colors]);

  return (
    <NavigationThemeProvider value={navigationTheme}>
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        {status === 'idle' || status === 'loading' ? (
          <View style={[styles.splash, { backgroundColor: colors.background }]}>
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
    </NavigationThemeProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  splash: { flex: 1, justifyContent: 'center' },
});
