import { request } from './client';
import type { Shop, ShopDetail, ShopDetailResponse, ShopPayload } from './types';

/**
 * Shops are all Bearer-protected.
 *
 * VERIFIED AGAINST THE LIVE API — the assignment brief specified `PUT` for the
 * update endpoint, but the server answers `PUT /api/shops/{id}` with
 * `405 Unsupported method for accessing the resource`. `PATCH /api/shops/{id}`
 * is the method that actually works and returns the updated shop. This is the
 * single place the update verb is defined.
 */

export async function fetchShops(): Promise<Shop[]> {
  return request<Shop[]>({ method: 'GET', url: '/shops' });
}

export async function fetchShop(id: number): Promise<ShopDetail> {
  const payload = await request<ShopDetailResponse>({ method: 'GET', url: `/shops/${id}` });
  return payload.shop;
}

export async function createShop(payload: ShopPayload): Promise<Shop> {
  return request<Shop>({ method: 'POST', url: '/shops', data: payload });
}

/**
 * Updates a shop.
 *
 * TODO: confirm endpoint with backend — the brief documents `PUT /api/shops/{id}`
 * but that verb is rejected with 405; `PATCH` is what the running API accepts.
 */
export async function updateShop(id: number, payload: ShopPayload): Promise<Shop> {
  return request<Shop>({ method: 'PATCH', url: `/shops/${id}`, data: payload });
}

export async function deleteShop(id: number): Promise<void> {
  await request<null>({ method: 'DELETE', url: `/shops/${id}` });
}