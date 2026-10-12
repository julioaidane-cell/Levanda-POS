import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import { Link, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { Controller, useController, useForm } from 'react-hook-form';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { z } from 'zod';

import { Button, Chip, ErrorView, Input, Section, Select } from '@/components/';
import type { RegisterPayload } from '@/api/types';
import { isApiError } from '@/api/errors';
import { useLocationChain } from '@/hooks/useLocationChain';
import { useAuthStore } from '@/store/authStore';
import { useShopStore } from '@/store/shopStore';
import { makeStyles, primaryScale, radius, spacing, typography, useTheme } from '@/theme';
import { applyServerErrors } from '@/utils/formErrors';

/** The assignment fixes the account type to a shop registration. */
const BUSINESS_TYPE = 'shop';

const registerSchema = z
  .object({
    business_name: z.string().trim().min(2, 'Enter your business name'),
    username: z.string().trim().min(3, 'Username must be at least 3 characters'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Confirm your password'),
    phone: z.string().trim().regex(/^\d{6,15}$/, 'Enter a valid phone number'),
    business_location: z.string().trim().min(2, 'Describe your business location'),
    country_id: z.number().nullable(),
    region_id: z.number().nullable(),
    district_id: z.number().nullable(),
    ward_id: z.number().nullable(),
  })
  .superRefine((values, ctx) => {
    // Presence checks live here so the inferred types stay `number | null`.
    const required: [keyof typeof values, string][] = [
      ['country_id', 'Select a country'],
      ['region_id', 'Select a region'],
      ['district_id', 'Select a district'],
      ['ward_id', 'Select a ward'],
    ];
    for (const [field, message] of required) {
      if (values[field] === null) {
        ctx.addIssue({ code: 'custom', message, path: [field] });
      }
    }
    if (values.password !== values.confirmPassword) {
      ctx.addIssue({ code: 'custom', message: 'Passwords do not match', path: ['confirmPassword'] });
    }
  });

type RegisterValues = z.infer<typeof registerSchema>;

/** Reached only after validation, so every id is present. */
function toLocationIds(values: RegisterValues): Pick<RegisterPayload, 'country_id' | 'region_id' | 'district_id' | 'ward_id'> {
  return {
    country_id: values.country_id ?? 0,
    region_id: values.region_id ?? 0,
    district_id: values.district_id ?? 0,
    ward_id: values.ward_id ?? 0,
  };
}

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useStyles();
  const registerAccount = useAuthStore((state) => state.register);
  const isSubmitting = useAuthStore((state) => state.isSubmitting);
  const bannerError = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);
  const adoptShop = useShopStore((state) => state.adoptShop);

  const location = useLocationChain();

  const { control, handleSubmit, setError, watch } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    mode: 'onSubmit',
    defaultValues: {
      business_name: '',
      username: '',
      password: '',
      confirmPassword: '',
      phone: '',
      business_location: '',
      country_id: null,
      region_id: null,
      district_id: null,
      ward_id: null,
    },
  });

  // The selected country supplies the dialling code, so "255" is never hardcoded.
  const selectedCountry = location.countries.find((country) => country.id === location.countryId) ?? null;
  const phonecode = selectedCountry?.dial_code ?? '';

  // Location dropdowns keep their selection state in `useLocationChain` while
  // these controllers mirror the values into the form for validation/submission.
  const countryField = useController({ control, name: 'country_id' });
  const regionField = useController({ control, name: 'region_id' });
  const districtField = useController({ control, name: 'district_id' });
  const wardField = useController({ control, name: 'ward_id' });

  const onSubmit = handleSubmit(async (values) => {
    clearError();
    const payload: RegisterPayload = {
      business_type: BUSINESS_TYPE,
      business_name: values.business_name,
      username: values.username,
      password: values.password,
      phonecode,
      phone: values.phone,
      ...toLocationIds(values),
      business_location: values.business_location,
    };

    try {
      const { newShopId } = await registerAccount(payload);
      // Prefer the shop created during registration over any pre-existing one.
      await adoptShop(newShopId);
      router.replace('/(app)/(tabs)');
    } catch (error) {
      applyServerErrors(error, setError);
    }
  });

  const showBanner = isApiError(bannerError) && !bannerError.isValidation;
  const phoneValue = watch('phone');

  return (
    <View style={styles.root}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <LinearGradient
            colors={[primaryScale[800], colors.chrome]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.hero, { paddingTop: insets.top + spacing.xxl }]}
          >
            <View style={styles.brandRow}>
              <View style={styles.brandMark}>
                <Ionicons name="storefront" size={18} color={colors.onPrimary} />
              </View>
              <Text style={styles.brand}>Levanda POS</Text>
            </View>
            <Text style={styles.heroTitle}>Create your account</Text>
            <Text style={styles.heroSubtitle}>
              Register your business to start selling with Levanda POS.
            </Text>
          </LinearGradient>

          <View style={styles.form}>
            <Chip label="Account type: Shop" icon="storefront-outline" active />

            {showBanner && bannerError ? <ErrorView error={bannerError} compact /> : null}
            {location.error ? (
              <ErrorView error={new Error(location.error)} compact retryLabel="Retry" onRetry={location.retry} />
            ) : null}

            <Section title="Business" inCard>
              <Controller
                control={control}
                name="business_name"
                render={({ field: { onChange, onBlur, value }, fieldState }) => (
                  <Input
                    label="Business name"
                    icon="business-outline"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={fieldState.error?.message}
                    placeholder="e.g. Kanzu Mini Mart"
                    required
                  />
                )}
              />
              <Controller
                control={control}
                name="business_location"
                render={({ field: { onChange, onBlur, value }, fieldState }) => (
                  <Input
                    label="Business location"
                    icon="location-outline"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={fieldState.error?.message}
                    placeholder="Street, landmark"
                    required
                  />
                )}
              />
            </Section>

            <Section title="Sign-in details" inCard>
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
                    required
                  />
                )}
              />
              <Controller
                control={control}
                name="confirmPassword"
                render={({ field: { onChange, onBlur, value }, fieldState }) => (
                  <Input
                    label="Confirm password"
                    icon="shield-checkmark-outline"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={fieldState.error?.message}
                    secureTextEntry
                    required
                  />
                )}
              />
            </Section>

            <Section title="Contact" inCard>
              <View style={styles.phoneRow}>
                <View style={styles.phoneCodeBox}>
                  <Text style={styles.phoneCodeLabel}>Code</Text>
                  <Text style={styles.phoneCodeValue}>{phonecode || '—'}</Text>
                </View>
                <Controller
                  control={control}
                  name="phone"
                  render={({ field: { onChange, onBlur, value }, fieldState }) => (
                    <Input
                      containerStyle={styles.phoneInput}
                      label="Phone number"
                      icon="call-outline"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={fieldState.error?.message}
                      keyboardType="phone-pad"
                      placeholder={phonecode ? 'e.g. 755123456' : 'Select a country first'}
                      editable={phonecode.length > 0}
                      required
                    />
                  )}
                />
              </View>
              {phoneValue.length > 0 && phonecode.length > 0 ? (
                <Text style={styles.phonePreview}>
                  {phonecode}
                  {phoneValue}
                </Text>
              ) : null}
            </Section>

            <Section title="Location" caption="Used for reporting and tax regions." inCard>
              <Select
                label="Country"
                required
                searchable
                placeholder="Select country"
                value={location.countryId}
                loading={location.isLoadingCountries}
                error={countryField.fieldState.error?.message}
                options={location.countries.map((country) => ({
                  label: country.name,
                  value: country.id,
                  meta: `+${country.dial_code}`,
                }))}
                onChange={(id) => {
                  location.setCountry(id);
                  countryField.field.onChange(id);
                }}
              />
              <Select
                label="Region"
                required
                searchable
                placeholder={location.countryId === null ? 'Select a country first' : 'Select region'}
                disabled={location.countryId === null}
                value={location.regionId}
                loading={location.isLoadingRegions}
                error={regionField.fieldState.error?.message}
                options={location.regions.map((region) => ({ label: region.name, value: region.id }))}
                onChange={(id) => {
                  location.setRegion(id);
                  regionField.field.onChange(id);
                }}
              />
              <Select
                label="District"
                required
                searchable
                placeholder={location.regionId === null ? 'Select a region first' : 'Select district'}
                disabled={location.regionId === null}
                value={location.districtId}
                loading={location.isLoadingDistricts}
                error={districtField.fieldState.error?.message}
                options={location.districts.map((district) => ({ label: district.name, value: district.id }))}
                onChange={(id) => {
                  location.setDistrict(id);
                  districtField.field.onChange(id);
                }}
              />
              <Select
                label="Ward"
                required
                searchable
                placeholder={location.districtId === null ? 'Select a district first' : 'Select ward'}
                disabled={location.districtId === null}
                value={location.wardId}
                loading={location.isLoadingWards}
                error={wardField.fieldState.error?.message}
                options={location.wards.map((ward) => ({ label: ward.name, value: ward.id }))}
                onChange={(id) => {
                  location.setWard(id);
                  wardField.field.onChange(id);
                }}
              />
            </Section>

            <Button
              label="Create account"
              onPress={onSubmit}
              loading={isSubmitting}
              size="lg"
              fullWidth
              icon="checkmark-circle-outline"
            />

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already registered? </Text>
              <Link href="/(auth)/login" asChild>
                <Pressable accessibilityRole="link" hitSlop={8}>
                  <Text style={styles.footerLink}>Sign in</Text>
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
  content: { paddingBottom: spacing.huge },
  hero: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
    gap: spacing.xs,
    borderBottomLeftRadius: radius.xxl,
    borderBottomRightRadius: radius.xxl,
    overflow: 'hidden',
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  brandMark: {
    width: 34,
    height: 34,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  brand: { ...typography.subheading, color: '#FFFFFF' },
  heroTitle: { ...typography.title, color: '#FFFFFF' },
  heroSubtitle: { ...typography.body, color: 'rgba(255,255,255,0.72)' },
  form: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, gap: spacing.lg },
  phoneRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  phoneCodeBox: {
    width: 86,
    gap: 2,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    backgroundColor: c.surfaceMuted,
    borderWidth: 1,
    borderColor: c.border,
  },
  phoneCodeLabel: { ...typography.caption, color: c.textMuted },
  phoneCodeValue: { ...typography.bodyStrong, color: c.text },
  phoneInput: { flex: 1 },
  phonePreview: { ...typography.caption, color: c.primaryDark, marginTop: -spacing.sm },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingTop: spacing.sm },
  footerText: { ...typography.body, color: c.textMuted },
  footerLink: { ...typography.bodyStrong, color: c.primaryDark },
}));
