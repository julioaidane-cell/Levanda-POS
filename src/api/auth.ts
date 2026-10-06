import { request } from './client';
import type { LoginPayload, LoginResponse, RegisterPayload, RegisterResponse } from './types';

/**
 * Registers a business account.
 *
 * Response shape verified against the live API: `{ token, user, company,
 * assigned_shops, assigned_stores, assigned_microfinances, assigned_restaurants }`.
 * There is **no** `shop` key; see `pickNewestAssignedShop` in the auth store.
 */
export async function register(payload: RegisterPayload): Promise<RegisterResponse> {
  return request<RegisterResponse>({ method: 'POST', url: '/auth/register', data: payload });
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  return request<LoginResponse>({ method: 'POST', url: '/auth/login', data: payload });
}

/**
 * Ends the server session. Callers must clear local state regardless of the
 * result, so this never throws.
 */
export async function logout(): Promise<void> {
  await request<null>({ method: 'POST', url: '/auth/logout' });
}