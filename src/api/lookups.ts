import { request } from './client';
import type { Country, Currency, District, Region, Ward } from './types';

/**
 * Public lookup endpoints used by the chained country → region → district →
 * ward pickers. All are GET, unauthenticated, and return `{ data: [...] }`.
 */

export async function fetchCountries(): Promise<Country[]> {
  return request<Country[]>({ method: 'GET', url: '/countries' });
}

export async function fetchRegions(countryId: number): Promise<Region[]> {
  return request<Region[]>({ method: 'GET', url: '/regions', params: { country_id: countryId } });
}

export async function fetchDistricts(regionId: number): Promise<District[]> {
  return request<District[]>({ method: 'GET', url: '/districts', params: { region_id: regionId } });
}

export async function fetchWards(districtId: number): Promise<Ward[]> {
  return request<Ward[]>({ method: 'GET', url: '/wards', params: { district_id: districtId } });
}

export async function fetchCurrencies(): Promise<Currency[]> {
  return request<Currency[]>({ method: 'GET', url: '/currencies' });
}