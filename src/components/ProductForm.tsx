import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button, ErrorView, Input, Section, Select } from '@/components/';
import { isApiError } from '@/api/errors';
import { fetchProductCategories } from '@/api/products';
import type { ProductCategory, ProductPayload } from '@/api/types';
import { makeStyles, spacing, typography } from '@/theme';
import { applyServerErrors } from '@/utils/formErrors';
import { Text, View } from 'react-native';
import { useAsyncResource } from '@/hooks/useAsyncResource';
import { useCompanyStore } from '@/store/companyStore';

/** Optional numeric field: empty string means "do not send". */
const optionalNumber = z
  .union([z.literal(''), z.coerce.number().min(0, 'Must be zero or more')])
  .transform((value) => (value === '' ? null : value));

const productSchema = z
  .object({
    name: z.string().trim().min(2, 'Enter a product name'),
    barcode: z.string().trim(),
    buying_price: z.coerce.number().min(0, 'Buying price must be zero or more'),
    wholesale_price: optionalNumber,
    retail_price: z.coerce.number().positive('Retail price must be greater than zero'),
    quantity: z.coerce.number().min(0, 'Quantity must be zero or more'),
    min_stock_level: optionalNumber,
    expire_date: z.string().trim(),
    product_category_id: z.number().nullable(),
  })
  .superRefine((values, ctx) => {
    if (values.retail_price < values.buying_price) {
      ctx.addIssue({
        code: 'custom',
        message: 'Retail price is usually higher than the buying price',
        path: ['retail_price'],
      });
    }
  });

type ProductFormValues = z.input<typeof productSchema>;
type ProductFormOutput = z.output<typeof productSchema>;

export interface ProductFormProps {
  shopId: number;
  submitLabel: string;
  isSubmitting: boolean;
  bannerError: unknown;
  onSubmit: (payload: ProductPayload) => Promise<void>;
  footer?: React.ReactNode;
}

export function ProductForm({ shopId, submitLabel, isSubmitting, bannerError, onSubmit, footer }: ProductFormProps) {
  const styles = useStyles();
  const [showOptional, setShowOptional] = useState(false);

  // Categories are behind a per-company feature flag: `company.has_product_categories`
// skips the request, and a 403 (flag not known yet) degrades to no categories.
const categoriesEnabled = useCompanyStore((state) => state.hasProductCategories);
const categories = useAsyncResource<ProductCategory[] | null>(
  async () => {
    if (categoriesEnabled === false) return null;
    try {
      return await fetchProductCategories(shopId);
    } catch {
      return null;
    }
  },
  [shopId, categoriesEnabled],
);

  const { control, handleSubmit, setError, watch, setValue } = useForm<ProductFormValues, unknown, ProductFormOutput>({
    resolver: zodResolver(productSchema),
    mode: 'onSubmit',
    defaultValues: {
      name: '',
      barcode: '',
      buying_price: '',
      wholesale_price: '',
      retail_price: '',
      quantity: '',
      min_stock_level: '',
      expire_date: '',
      product_category_id: null,
    },
  });

  const selectedCategory = watch('product_category_id');
  const hasCategories = (categories.data ?? []).length > 0;

  const submit = handleSubmit(async (values) => {
    const payload: ProductPayload = {
      name: values.name,
      buying_price: values.buying_price,
      retail_price: values.retail_price,
      quantity: values.quantity,
      barcode: values.barcode.length > 0 ? values.barcode : null,
      wholesale_price: values.wholesale_price,
      min_stock_level: values.min_stock_level,
      expire_date: values.expire_date.length > 0 ? values.expire_date : null,
      product_category_id: values.product_category_id,
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

      <Section title="Product" inCard>
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, onBlur, value }, fieldState }) => (
            <Input
              label="Product name"
              icon="cube-outline"
              value={String(value)}
              onChangeText={onChange}
              onBlur={onBlur}
              error={fieldState.error?.message}
              placeholder="e.g. Cooking Oil 5L"
              required
            />
          )}
        />
        <Controller
          control={control}
          name="barcode"
          render={({ field: { onChange, onBlur, value }, fieldState }) => (
            <Input
              label="Barcode"
              icon="barcode-outline"
              value={String(value)}
              onChangeText={onChange}
              onBlur={onBlur}
              error={fieldState.error?.message}
              autoCapitalize="characters"
              hint="Optional — leave blank if the product has no barcode."
            />
          )}
        />
        {hasCategories ? (
          <Controller
            control={control}
            name="product_category_id"
            render={({ fieldState }) => (
              <Select
                label="Category"
                placeholder="Uncategorised"
                searchable
                value={selectedCategory}
                error={fieldState.error?.message}
                options={(categories.data ?? []).map((category) => ({ label: category.name, value: category.id }))}
                onChange={(id) => setValue('product_category_id', id, { shouldDirty: true })}
              />
            )}
          />
        ) : null}
      </Section>

      <Section title="Pricing" caption="The backend requires buying and retail price." inCard>
        <Controller
          control={control}
          name="buying_price"
          render={({ field: { onChange, onBlur, value }, fieldState }) => (
            <Input
              label="Buying price"
              icon="cash-outline"
              value={String(value)}
              onChangeText={onChange}
              onBlur={onBlur}
              error={fieldState.error?.message}
              keyboardType="decimal-pad"
              placeholder="0.00"
              required
            />
          )}
        />
        <Controller
          control={control}
          name="retail_price"
          render={({ field: { onChange, onBlur, value }, fieldState }) => (
            <Input
              label="Retail price"
              icon="pricetag-outline"
              value={String(value)}
              onChangeText={onChange}
              onBlur={onBlur}
              error={fieldState.error?.message}
              keyboardType="decimal-pad"
              placeholder="0.00"
              required
            />
          )}
        />
        <Controller
          control={control}
          name="wholesale_price"
          render={({ field: { onChange, onBlur, value }, fieldState }) => (
            <Input
              label="Wholesale price"
              icon="cart-outline"
              value={String(value)}
              onChangeText={onChange}
              onBlur={onBlur}
              error={fieldState.error?.message}
              keyboardType="decimal-pad"
              placeholder="Optional"
            />
          )}
        />
      </Section>

      <Section title="Stock" inCard>
        <Controller
          control={control}
          name="quantity"
          render={({ field: { onChange, onBlur, value }, fieldState }) => (
            <Input
              label="Quantity"
              icon="layers-outline"
              value={String(value)}
              onChangeText={onChange}
              onBlur={onBlur}
              error={fieldState.error?.message}
              keyboardType="decimal-pad"
              placeholder="0"
              required
            />
          )}
        />
      </Section>

      <Button
        label={showOptional ? 'Hide optional fields' : 'Show optional fields'}
        onPress={() => setShowOptional((current) => !current)}
        variant="ghost"
        size="sm"
        icon={showOptional ? 'chevron-up' : 'chevron-down'}
      />

      {showOptional ? (
        <Section title="Optional" inCard>
          <Controller
            control={control}
            name="min_stock_level"
            render={({ field: { onChange, onBlur, value }, fieldState }) => (
              <Input
                label="Minimum stock level"
                icon="warning-outline"
                value={String(value)}
                onChangeText={onChange}
                onBlur={onBlur}
                error={fieldState.error?.message}
                keyboardType="decimal-pad"
                placeholder="Alerts when stock falls to this level"
              />
            )}
          />
          <Controller
            control={control}
            name="expire_date"
            render={({ field: { onChange, onBlur, value }, fieldState }) => (
              <Input
                label="Expiry date"
                icon="calendar-outline"
                value={String(value)}
                onChangeText={onChange}
                onBlur={onBlur}
                error={fieldState.error?.message}
                placeholder="YYYY-MM-DD"
                hint="Use YYYY-MM-DD. Leave blank if the product does not expire."
              />
            )}
          />
          {selectedCategory !== null && hasCategories ? (
            <Text style={styles.note}>Category will be saved with this product.</Text>
          ) : null}
        </Section>
      ) : null}

      <Button label={submitLabel} onPress={submit} loading={isSubmitting} size="lg" fullWidth icon="checkmark" />
      {footer}
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  form: { gap: spacing.lg },
  note: { ...typography.caption, color: c.textMuted },
}));