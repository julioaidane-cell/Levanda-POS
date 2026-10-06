import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useController, useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button, ErrorView, Input, Section, Select } from '@/components/';
import { isApiError } from '@/api/errors';
import type { ShopPayload } from '@/api/types';
import { useLocationChain, type LocationSelection } from '@/hooks/useLocationChain';
import { colors, spacing, typography } from '@/theme';
import { applyServerErrors } from '@/utils/formErrors';
import { StyleSheet, Text, View } from 'react-native';

const shopSchema = z
  .object({
    name: z.string().trim().min(2, 'Enter a shop name'),
    country_id: z.number().nullable(),
    region_id: z.number().nullable(),
    district_id: z.number().nullable(),
    ward_id: z.number().nullable(),
  })
  .superRefine((values, ctx) => {
    const required: [keyof typeof values, string][] = [
      ['country_id', 'Select a country'],
      ['region_id', 'Select a region'],
      ['district_id', 'Select a district'],
      ['ward_id', 'Select a ward'],
    ];
    for (const [field, message] of required) {
      if (values[field] === null) ctx.addIssue({ code: 'custom', message, path: [field] });
    }
  });

type ShopFormValues = z.infer<typeof shopSchema>;

export interface ShopFormProps {
  /** Prefilled ids when editing an existing shop. */
  initial: LocationSelection & { name?: string };
  submitLabel: string;
  isSubmitting: boolean;
  bannerError: unknown;
  onSubmit: (payload: ShopPayload) => Promise<void>;
  footer?: React.ReactNode;
}

/**
 * Shared create/edit form. Both flows hit the same endpoints, so the location
 * chain and validation live in one place.
 */
export function ShopForm({ initial, submitLabel, isSubmitting, bannerError, onSubmit, footer }: ShopFormProps) {
  const { control, handleSubmit, setError } = useForm<ShopFormValues>({
    resolver: zodResolver(shopSchema),
    mode: 'onSubmit',
    defaultValues: {
      name: initial.name ?? '',
      country_id: initial.countryId,
      region_id: initial.regionId,
      district_id: initial.districtId,
      ward_id: initial.wardId,
    },
  });

  const location = useLocationChain({
    countryId: initial.countryId,
    regionId: initial.regionId,
    districtId: initial.districtId,
    wardId: initial.wardId,
  });

  const countryField = useController({ control, name: 'country_id' });
  const regionField = useController({ control, name: 'region_id' });
  const districtField = useController({ control, name: 'district_id' });
  const wardField = useController({ control, name: 'ward_id' });

  const submit = handleSubmit(async (values) => {
    const payload: ShopPayload = {
      name: values.name,
      country_id: values.country_id ?? 0,
      region_id: values.region_id ?? 0,
      district_id: values.district_id ?? 0,
      ward_id: values.ward_id ?? 0,
    };
    try {
      await onSubmit(payload);
    } catch (error) {
      applyServerErrors(error, setError);
    }
  });

  const showBanner = isApiError(bannerError) && !bannerError.isValidation;

  return (
    <View style={styles.form}>
      {showBanner && bannerError ? <ErrorView error={bannerError} compact /> : null}
      {location.error ? (
        <ErrorView error={new Error(location.error)} compact retryLabel="Retry" onRetry={location.retry} />
      ) : null}

      <Section title="Shop details" inCard>
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, onBlur, value }, fieldState }) => (
            <Input
              label="Shop name"
              icon="storefront-outline"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={fieldState.error?.message}
              placeholder="e.g. Kanzu Mini Mart"
              required
            />
          )}
        />
      </Section>

      <Section title="Location" caption="Choose the area this shop operates in." inCard>
        <Select
          label="Country"
          required
          searchable
          placeholder="Select country"
          value={location.countryId}
          loading={location.isLoadingCountries}
          error={countryField.fieldState.error?.message}
          options={location.countries.map((country) => ({ label: country.name, value: country.id, meta: `+${country.dial_code}` }))}
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

      <Button label={submitLabel} onPress={submit} loading={isSubmitting} size="lg" fullWidth icon="checkmark" />
      {footer}
      <Text style={styles.footnote}>Fields marked with * are required.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: spacing.lg },
  footnote: { ...typography.caption, color: colors.textMuted, textAlign: 'center' },
});