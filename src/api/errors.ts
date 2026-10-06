/**
 * Normalised API error used across the app.
 *
 * The backend answers with `{ success, message, errors? }`. Axios transport
 * problems (no connection, timeout, cancellation) are mapped into the same
 * shape so screens only ever handle one error type.
 */

export type ApiErrorKind =
  | 'offline'
  | 'timeout'
  | 'cancelled'
  | 'unauthorized'
  | 'forbidden'
  | 'notFound'
  | 'methodNotAllowed'
  | 'validation'
  | 'conflict'
  | 'server'
  | 'client'
  | 'unknown';

export interface ApiErrorOptions {
  kind: ApiErrorKind;
  message: string;
  status?: number;
  /** Per-field messages from a 422 validation response. */
  fieldErrors?: Record<string, string[]>;
  /** Raw backend message, useful for logs and the error screen's detail row. */
  detail?: string;
}

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status: number | undefined;
  readonly fieldErrors: Record<string, string[]>;
  readonly detail: string | undefined;

  constructor(options: ApiErrorOptions) {
    super(options.message);
    this.name = 'ApiError';
    this.kind = options.kind;
    this.status = options.status;
    this.fieldErrors = options.fieldErrors ?? {};
    this.detail = options.detail;
  }

  /** True when the failure is a field-level problem a form can display inline. */
  get isValidation(): boolean {
    return this.kind === 'validation';
  }

  /** Flatten `{ field: [msg] }` into `{ field: msg }` for React Hook Form. */
  get flatFieldErrors(): Record<string, string> {
    return Object.fromEntries(
      Object.entries(this.fieldErrors).map(([field, messages]) => [field, messages[0] ?? 'Invalid value']),
    );
  }
}

export const isApiError = (value: unknown): value is ApiError => value instanceof ApiError;

/** Best-effort extraction of a human message from an unknown thrown value. */
export function toMessage(value: unknown, fallback = 'Something went wrong.'): string {
  if (isApiError(value)) return value.message;
  if (value instanceof Error && value.message) return value.message;
  if (typeof value === 'string' && value.length > 0) return value;
  return fallback;
}