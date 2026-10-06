import { request } from './client';
import type {
  ProductCategory,
  ProductCreated,
  ProductDetail,
  ProductListPayload,
  ProductPayload,
  ProductShowPayload,
} from './types';

/**
 * Products live under the shop they belong to.
 *
 * VERIFIED AGAINST THE LIVE API — the brief documented a flat `/api/products`
 * collection, but that path answers `404 Resource not found`. The working
 * routes are shop-scoped:
 *   GET    /api/shops/{shopId}/products
 *   POST   /api/shops/{shopId}/products
 *   GET    /api/shops/{shopId}/products/{productId}
 *   DELETE /api/shops/{shopId}/products/{productId}
 *
 * Because scoping happens in the path (not a `shop_id` parameter), this module
 * is the one and only place a shop id is turned into a product URL.
 */
const productsPath = (shopId: number): string => `/shops/${shopId}/products`;

export async function fetchProducts(shopId: number): Promise<ProductListPayload> {
  return request<ProductListPayload>({ method: 'GET', url: productsPath(shopId) });
}

export async function fetchProduct(shopId: number, productId: number): Promise<ProductDetail | null> {
  const payload = await request<ProductShowPayload>({
    method: 'GET',
    url: `${productsPath(shopId)}/${productId}`,
  });
  // `product` is null when the id does not belong to the shop.
  return payload.product;
}

export async function createProduct(shopId: number, payload: ProductPayload): Promise<ProductCreated> {
  return request<ProductCreated>({ method: 'POST', url: productsPath(shopId), data: payload });
}

export async function deleteProduct(shopId: number, productId: number): Promise<void> {
  await request<null>({ method: 'DELETE', url: `${productsPath(shopId)}/${productId}` });
}

/**
 * Product categories are gated behind a per-company feature flag and answer
 * `403` ("Product categories are disabled for this company") when disabled.
 * Callers treat a 403 as "unavailable" and continue without a category.
 *
 * TODO: confirm endpoint with backend — not documented in the assignment brief.
 */
export async function fetchProductCategories(shopId: number): Promise<ProductCategory[]> {
  return request<ProductCategory[]>({ method: 'GET', url: `${productsPath(shopId)}/categories` });
}