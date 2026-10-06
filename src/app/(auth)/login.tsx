import { Ionicons } from '@expo/vector-icons';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button, ErrorView, Input } from '@/components/';
import { isApiError } from '@/api/errors';
import { useAuthStore } from '@/store/authStore';
import { colors, radius, spacing, typography } from '@/theme';
import { applyServerErrors } from '@/utils/formErrors';

const loginSchema = z.object({
  username: z.string().trim().min(1, 'Enter your username'),
  password: z.string().min(1, 'Enter your password'),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const login = useAuthStore((state) => state.login);
  const isSubmitting = useAuthStore((state) => state.isSubmitting);
  const bannerError = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);

  const [showPassword, setShowPassword] = useState(false);

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
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.hero, { paddingTop: insets.top + spacing.xxl }]}>
        <View style={styles.brandRow}>
          <View style={styles.brandMark}>
            <Ionicons name="storefront" size={20} color={colors.chrome} />
          </View>
          <Text style={styles.brand}>Levanda POS</Text>
        </View>
        <Text style={styles.heroTitle}>Welcome back</Text>
        <Text style={styles.heroSubtitle}>Sign in to manage your shops and products.</Text>
      </View>

      <View style={styles.body}>
        <View style={styles.form}>
          {showBanner && bannerError ? (
            <ErrorView error={bannerError} compact />
          ) : null}

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
              <View>
                <Input
                  label="Password"
                  icon="lock-closed-outline"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={fieldState.error?.message}
                  secureTextEntry={!showPassword}
                  textContentType="password"
                  returnKeyType="go"
                  onSubmitEditing={onSubmit}
                  required
                />
                <Pressable
                  onPress={() => setShowPassword((current) => !current)}
                  hitSlop={10}
                  style={styles.reveal}
                  accessibilityRole="button"
                  accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color={colors.textMuted}
                  />
                </Pressable>
              </View>
            )}
          />

          <Button
            label="Sign in"
            onPress={onSubmit}
            loading={isSubmitting}
            size="lg"
            fullWidth
            icon="log-in-outline"
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>New to Levanda POS? </Text>
          <Link href="/(auth)/register" asChild>
            <Pressable accessibilityRole="link" hitSlop={8}>
              <Text style={styles.footerLink}>Create an account</Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  hero: {
    backgroundColor: colors.chrome,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.sm,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.lg },
  brandMark: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  brand: { ...typography.heading, color: colors.textInverse },
  heroTitle: { ...typography.display, color: colors.textInverse },
  heroSubtitle: { ...typography.body, color: colors.chromeMuted },
  body: { flex: 1, justifyContent: 'space-between', padding: spacing.lg },
  form: { gap: spacing.lg, marginTop: spacing.xl },
  reveal: { position: 'absolute', right: spacing.md, bottom: spacing.md },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  footerText: { ...typography.body, color: colors.textMuted },
  footerLink: { ...typography.bodyStrong, color: colors.primaryDark },
});