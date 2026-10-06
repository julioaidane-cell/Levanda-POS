import { useCallback, useEffect, useRef, useState } from 'react';

export interface AsyncState<T> {
  data: T | null;
  error: unknown;
  isLoading: boolean;
  /** True during a background refresh while data is already on screen. */
  isRefreshing: boolean;
}

export interface UseAsyncResource<T> extends AsyncState<T> {
  /** Loads for the first time. */
  load: () => Promise<void>;
  /** Re-fetches and surfaces the spinner (pull-to-refresh). */
  refresh: () => Promise<void>;
  /** Replaces the data locally, e.g. after a mutation. */
  setData: (next: T | null) => void;
}

/**
 * Minimal data-fetching hook: tracks loading/error/data, cancels results from
 * stale requests, and never rejects (errors are surfaced through state).
 */
export function useAsyncResource<T>(loader: () => Promise<T>, deps: readonly unknown[]): UseAsyncResource<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const mounted = useRef(true);
  const requestId = useRef(0);
  const loaderRef = useRef(loader);
  loaderRef.current = loader;

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const run = useCallback(async (mode: 'initial' | 'refresh') => {
    const id = ++requestId.current;
    if (mode === 'refresh') setIsRefreshing(true);
    else setIsLoading(true);
    setError(null);

    try {
      const result = await loaderRef.current();
      // Ignore results from a request that has already been superseded.
      if (!mounted.current || id !== requestId.current) return;
      setData(result);
    } catch (caught) {
      if (!mounted.current || id !== requestId.current) return;
      setError(caught);
    } finally {
      if (mounted.current && id === requestId.current) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    void run('initial');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return {
    data,
    error,
    isLoading,
    isRefreshing,
    load: useCallback(() => run('initial'), [run]),
    refresh: useCallback(() => run('refresh'), [run]),
    setData: useCallback((next: T | null) => setData(next), []),
  };
}