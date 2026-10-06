/**
 * API payload types.
 *
 * Every shape here was captured from a live response against the documented
 * base URL (see README "API assumptions"). Field names deliberately mirror the
 * backend, including its inconsistencies:
 *  - product list rows use `name`, the product detail payload uses `product_name`
 *  - read endpoints return prices/quantities as decimal strings, writes as numbers
 */

/* ---------------------------------- lookups --------------------------------- */

/** `dial_code` (not `phonecode`) is what the countries endpoint returns. */
export interface Country {
  id: number;
  name: string;
  code: string;
  dial_code: string;
}

export interface Region {
  id: number;
  country_id: number;
  post_code: number | null;
  name: string;
}

export interface District {
  id: number;
  region_id: number;
  post_code: number | null;
  name: string;
}

export interface Ward {
  id: number;
  district_id: number;
  post_code: number | null;
  name: string;
}

export interface Currency {
  id: number;
  name: string;
  code: string;
}

/* ------------------------------------ auth ---------------------------------- */

export interface AuthUser {
  id: number;
  name: string;
  username: string;
  email: string | null;
  phonecode: string;
  phone: string | null;
  gender: string | null;
  address: string | null;
  status: string;
  profile: string | null;
  last_active_at: string | null;
  setup_guide_dismissed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Company {
  id: number;
  name: string;
  dbname: string;
  dbhost: string;
  about: string | null;
  currency_id: number;
  status: string;
  status2: string;
  reminder: string | null;
  country_id: number | null;
  contact_person: number | null;
  folder: string;
  logo: string | null;
  tin: string | null;
  vrn: string | null;
  cashier_stock_approval: boolean | null;
  can_transfer_items: boolean | null;
  has_product_categories: boolean | null;
  created_by: number | null;
  updated_by: number | null;
  deleted_by: number | null;
  created_at: string;
  updated_at: string;
}

/** Shop stub embedded in the register response (`assigned_shops[]`). */
export interface AssignedShop {
  id: number;
  name: string;
  roles: string[];
  status: string;
  location: string | null;
  created_at: string;
  updated_at: string;
}

export interface RegisterPayload {
  business_type: string;
  business_name: string;
  username: string;
  password: string;
  phonecode: string;
  phone: string;
  country_id: number;
  region_id: number;
  district_id: number;
  ward_id: number;
  business_location: string;
}

/**
 * The live register response has no `shop` key. The shop created during
 * registration is derived from the newest entry in `assigned_shops`, because
 * a brand-new company is also handed pre-existing shops.
 */
export interface RegisterResponse {
  token: string;
  user: AuthUser;
  company: Company | null;
  assigned_shops: AssignedShop[];
  assigned_stores: unknown[];
  assigned_microfinances: unknown[];
  assigned_restaurants: unknown[];
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

/* ----------------------------------- shops --------------------------------- */

/** Row shape from `GET /shops`. */
export interface Shop {
  id: number;
  name: string;
  location: string | null;
  status: string | null;
  has_customers: string | null;
  change_s_price: boolean | null;
  company_id: number | null;
  country_id: number | null;
  region_id: number | null;
  district_id: number | null;
  ward_id: number | null;
  my_role: string | null;
  district_name: string | null;
  ward_name: string | null;
}

/** Extra columns only present on `GET /shops/{id}`. */
export interface ShopDetailExtras {
  reminder: string | null;
  sell_order: boolean | null;
  record_prev_sales: boolean | null;
  user_id: number | null;
  created_at: string | null;
  updated_at: string | null;
  country_name: string | null;
  region_name: string | null;
}

export type ShopDetail = Shop & ShopDetailExtras;

export interface ShopDetailResponse {
  shop: ShopDetail;
  assigned: unknown;
  my_role: string | null;
  cashiers: unknown;
  salespersons: unknown;
}

export interface ShopPayload {
  name: string;
  country_id: number;
  region_id: number;
  district_id: number;
  ward_id: number;
}

/* ---------------------------------- products -------------------------------- */

/** Row shape inside the product list payload. */
export interface ProductSummary {
  id: number;
  name: string;
  quantity: string | null;
  image: string | null;
  buying_price: string | null;
  wholesale_price: string | null;
  retail_price: string | null;
  /** Note: this holds the shop *name*, not an id. */
  shop: string | null;
  product_category_id: number | null;
  product_category_name: string | null;
  expire_date: string | null;
  min_stock_level: string | null;
}

export interface ProductListPayload {
  products: ProductSummary[];
  total_available_products: number;
  total_quantity: number;
}

/**
 * Detail payload. The backend names the title `product_name` here and returns
 * `shop_id` holding the *product* id — a known backend quirk we do not rely on.
 */
export interface ProductDetail {
  id: number;
  product_name: string;
  shop_id: number;
  quantity: string | null;
  buying_price: string | null;
  retail_price: string | null;
  product_category_id: number | null;
  product_category_cname: string | null;
  product_image: string | null;
  expire_date: string | null;
  min_stock_level: string | null;
  product_created_at: string | null;
}

export interface ProductShowPayload {
  product: ProductDetail | null;
  products: { id: number; product_name: string }[];
}

/**
 * Create payload. Only `name`, `buying_price`, `retail_price` and `quantity`
 * are validated by the backend; the rest are accepted and optional.
 */
export interface ProductPayload {
  name: string;
  buying_price: number;
  retail_price: number;
  quantity: number;
  barcode?: string | null;
  wholesale_price?: number | null;
  product_category_id?: number | null;
  min_stock_level?: number | null;
  expire_date?: string | null;
}

export interface ProductCreated {
  id: number;
  name: string;
  barcode: string | null;
  buying_price: number;
  wholesale_price: number | null;
  retail_price: number;
  measurement_id: number;
  product_category_id: number;
  status: string;
  min_stock_level: number | null;
  expire_date: string | null;
  company_id: number;
  user_id: number;
  created_at: string;
  updated_at: string;
}

export interface ProductCategory {
  id: number;
  name: string;
}