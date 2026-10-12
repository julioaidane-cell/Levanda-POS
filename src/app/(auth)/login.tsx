import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import { Link, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button, Card, ErrorView, Input } from '@/components/';
import { isApiError } from '@/api/errors';
import { useAuthStore } from '@/store/authStore';
import { makeStyles, primaryScale, radius, spacing, typography, useTheme } from '@/theme';
import { applyServerErrors } from '@/utils/formErrors';

const loginSchema = z.object({
  username: z.string().trim().min(1, 'Enter your username'),
  password: z.string().min(1, 'Enter your password'),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useStyles();
  const login = useAuthStore((state) => state.login);
  const isSubmitting = useAuthStore((state) => state.isSubmitting);
  const bannerError = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);

  const { control, handleSubmit, setError } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' },
    mode: 'onSubmit',
  });

  const onSubmit = handleSubmit(async (values) => {
    clearError();
    try {
      await login({ username: values.username, password: values.password });
      router.replace('/(app)/(tabs)');
    } catch (error) {
      applyServerErrors(error, setError);
    }
  });

  const showBanner = isApiError(bannerError) && !bannerError.isValidation;

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          bounces={false}
        >
          <LinearGradient
            colors={[primaryScale[800], colors.chrome]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.hero, { paddingTop: insets.top + spacing.xxxl }]}
          >
            <View style={styles.brandRow}>
              <View style={styles.brandMark}>
                <Ionicons name="storefront" size={20} color={colors.onPrimary} />
              </View>
              <Text style={styles.brand}>Levanda POS</Text>
            </View>
            <Text style={styles.heroTitle}>Welcome back</Text>
            <Text style={styles.heroSubtitle}>Sign in to manage your shops and products.</Text>
          </LinearGradient>

          <View style={styles.body}>
            <Card style={styles.card} flat>
              {showBanner && bannerError ? <ErrorView error={bannerError} compact /> : null}

              <Controller
                control={control}
                name="username"
                render={({ field: { onChange, onBlur, value }, fieldState }) => (
                  <Input
                    label="Username"
                    icon="person-outline"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={fieldState.error?.message}
                    autoCapitalize="none"
                    autoCorrect={false}
                    textContentType="username"
                    returnKeyType="next"
                    required
                  />
                )}
              />

              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value }, fieldState }) => (
                  <Input
                    label="Password"
                    icon="lock-closed-outline"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={fieldState.error?.message}
                    secureTextEntry
                    textContentType="password"
                    returnKeyType="go"
                    onSubmitEditing={onSubmit}
                    required
                  />
                )}
              />

              <Button
                label="Sign in"
                onPress={onSubmit}
                loading={isSubmitting}
                size="lg"
                fullWidth
                icon="log-in-outline"
                style={styles.submit}
              />
            </Card>

            <View style={styles.footer}>
              <Text style={styles.footerText}>New to Levanda POS? </Text>
              <Link href="/(auth)/register" asChild>
                <Pressable accessibilityRole="link" hitSlop={8}>
                  <Text style={styles.footerLink}>Create an account</Text>
                </Pressable>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  root: { flex: 1, backgroundColor: c.background },
  flex: { flex: 1 },
  content: { flexGrow: 1 },
  hero: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.giant,
    gap: spacing.sm,
    borderBottomLeftRadius: radius.xxl,
    borderBottomRightRadius: radius.xxl,
    overflow: 'hidden',
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.lg },
  brandMark: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: c.onChromeWash,
  },
  brand: { ...typography.heading, color: c.onChrome },
  heroTitle: { ...typography.display, color: c.onChrome },
  heroSubtitle: { ...typography.body, color: c.onChromeMuted },
  body: { flex: 1, justifyContent: 'space-between', padding: spacing.lg, gap: spacing.lg },
  card: { marginTop: -spacing.giant, gap: spacing.lg },
  submit: { marginTop: spacing.xs },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  footerText: { ...typography.body, color: c.textMuted },
  footerLink: { ...typography.bodyStrong, color: c.primaryDark },
}));
