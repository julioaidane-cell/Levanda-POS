/**
 * In-memory bearer token cache.
 *
 * The token is persisted in expo-secure-store by the auth store and mirrored
 * here so the axios request interceptor stays synchronous. Keeping this in its
 * own module also prevents a circular import between the client and the store.
 */

let cachedToken: string | null = null;

export function getToken(): string | null {
  return cachedToken;
}

export function setToken(token: string | null): void {
  cachedToken = token;
}