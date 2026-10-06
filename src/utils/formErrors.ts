import type { FieldValues, UseFormSetError } from 'react-hook-form';

import { isApiError } from '@/api/errors';

/**
 * Pushes a 422's per-field messages onto the matching React Hook Form inputs.
 * Fields absent from the schema are ignored — those are surfaced by the
 * screen's banner instead.
 */
export function applyServerErrors<TFieldValues extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<TFieldValues>,
): void {
  if (!isApiError(error)) return;

  for (const [field, message] of Object.entries(error.flatFieldErrors)) {
    setError(field as never, { type: 'server', message });
  }
}