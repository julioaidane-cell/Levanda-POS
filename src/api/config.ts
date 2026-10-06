/**
 * Runtime API configuration.
 *
 * The base URL is read from the EXPO_PUBLIC_API_BASE_URL environment variable
 * (see `.env.example`) so it is never hardcoded in a screen or committed.
 */

const RAW_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

function resolveBaseUrl(): string {
  if (!RAW_BASE_URL || RAW_BASE_URL.trim().length === 0) {
    // Fail loudly and early rather than issuing requests to a wrong origin.
    throw new Error(
      'EXPO_PUBLIC_API_BASE_URL is not set. Copy .env.example to .env and set it to your API root (e.g. http://host:8080).',
    );
  }
  const trimmed = RAW_BASE_URL.trim().replace(/\/+$/, '');
  if (!/^https?:\/\//.test(trimmed)) {
    throw new Error(`EXPO_PUBLIC_API_BASE_URL must start with http:// or https:// (received "${RAW_BASE_URL}").`);
  }
  return trimmed;
}

export const API_BASE_URL = resolveBaseUrl();

/** Every documented endpoint is prefixed with `/api`. */
export const API_PREFIX = '/api';

export const apiUrl = (path: string): string => `${API_BASE_URL}${API_PREFIX}${path}`;

export const REQUEST_TIMEOUT_MS = 20000;