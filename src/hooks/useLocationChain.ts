import { useCallback, useEffect, useState } from 'react';

import { toMessage } from '@/api/errors';
import { fetchCountries, fetchDistricts, fetchRegions, fetchWards } from '@/api/lookups';
import type { Country, District, Region, Ward } from '@/api/types';

export interface LocationSelection {
  countryId: number | null;
  regionId: number | null;
  districtId: number | null;
  wardId: number | null;
}

export interface LocationChain extends LocationSelection {
  countries: Country[];
  regions: Region[];
  districts: District[];
  wards: Ward[];

  isLoadingCountries: boolean;
  isLoadingRegions: boolean;
  isLoadingDistricts: boolean;
  isLoadingWards: boolean;

  /** Non-fatal lookup problem, shown above the form. */
  error: string | null;

  setCountry: (id: number) => void;
  setRegion: (id: number) => void;
  setDistrict: (id: number) => void;
  setWard: (id: number) => void;
  /** Applies an existing selection, e.g. when editing a shop. */
  reset: (selection: LocationSelection) => void;
  /** Re-runs the failed lookup so the error banner can offer a retry. */
  retry: () => void;
}

const EMPTY: LocationSelection = { countryId: null, regionId: null, districtId: null, wardId: null };

/**
 * Drives the four dependent lookup dropdowns.
 *
 * Selecting a new country clears and reloads regions (and everything below);
 * the same applies down the chain. Each level only loads once its parent is set.
 */
export function useLocationChain(initial: LocationSelection = EMPTY): LocationChain {
  const [selection, setSelection] = useState<LocationSelection>(initial);
  const [countries, setCountries] = useState<Country[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  const [isLoadingCountries, setIsLoadingCountries] = useState(true);
  const [isLoadingRegions, setIsLoadingRegions] = useState(false);
  const [isLoadingDistricts, setIsLoadingDistricts] = useState(false);
  const [isLoadingWards, setIsLoadingWards] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countriesAttempt, setCountriesAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setIsLoadingCountries(true);
    fetchCountries()
      .then((list) => {
        if (cancelled) return;
        setCountries(list);
        setError(null);
      })
      .catch((caught: unknown) => {
        if (!cancelled) setError(toMessage(caught, 'Could not load countries.'));
      })
      .finally(() => {
        if (!cancelled) setIsLoadingCountries(false);
      });
    return () => {
      cancelled = true;
    };
  }, [countriesAttempt]);

  useEffect(() => {
    if (selection.countryId === null) {
      setRegions([]);
      return;
    }
    let cancelled = false;
    setIsLoadingRegions(true);
    fetchRegions(selection.countryId)
      .then((list) => {
        if (!cancelled) setRegions(list);
      })
      .catch((caught: unknown) => {
        if (!cancelled) setError(toMessage(caught, 'Could not load regions.'));
      })
      .finally(() => {
        if (!cancelled) setIsLoadingRegions(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selection.countryId]);

  useEffect(() => {
    if (selection.regionId === null) {
      setDistricts([]);
      return;
    }
    let cancelled = false;
    setIsLoadingDistricts(true);
    fetchDistricts(selection.regionId)
      .then((list) => {
        if (!cancelled) setDistricts(list);
      })
      .catch((caught: unknown) => {
        if (!cancelled) setError(toMessage(caught, 'Could not load districts.'));
      })
      .finally(() => {
        if (!cancelled) setIsLoadingDistricts(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selection.regionId]);

  useEffect(() => {
    if (selection.districtId === null) {
      setWards([]);
      return;
    }
    let cancelled = false;
    setIsLoadingWards(true);
    fetchWards(selection.districtId)
      .then((list) => {
        if (!cancelled) setWards(list);
      })
      .catch((caught: unknown) => {
        if (!cancelled) setError(toMessage(caught, 'Could not load wards.'));
      })
      .finally(() => {
        if (!cancelled) setIsLoadingWards(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selection.districtId]);

  /** Changing a level clears every level beneath it. */
  const setCountry = useCallback((countryId: number) => {
    setSelection({ countryId, regionId: null, districtId: null, wardId: null });
    setRegions([]);
    setDistricts([]);
    setWards([]);
  }, []);

  const setRegion = useCallback((regionId: number) => {
    setSelection((current) => ({ ...current, regionId, districtId: null, wardId: null }));
    setDistricts([]);
    setWards([]);
  }, []);

  const setDistrict = useCallback((districtId: number) => {
    setSelection((current) => ({ ...current, districtId, wardId: null }));
    setWards([]);
  }, []);

  const setWard = useCallback((wardId: number) => {
    setSelection((current) => ({ ...current, wardId }));
  }, []);

  const reset = useCallback((next: LocationSelection) => {
    setSelection(next);
  }, []);

  const retry = useCallback(() => setCountriesAttempt((attempt) => attempt + 1), []);

  return {
    ...selection,
    countries,
    regions,
    districts,
    wards,
    isLoadingCountries,
    isLoadingRegions,
    isLoadingDistricts,
    isLoadingWards,
    error,
    setCountry,
    setRegion,
    setDistrict,
    setWard,
    reset,
    retry,
  };
}