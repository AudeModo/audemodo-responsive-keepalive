import { useRef, useSyncExternalStore } from 'react';
import { createMediaQueryStore, type MediaQueryStore } from './createMediaQueryStore';

/**
 * Returns the variant whose media query currently matches — the *raw* result with
 * no switch policies applied. SSR-safe via `useSyncExternalStore`.
 *
 * This is the observation primitive that the public `useMediaVariant` builds on
 * (the latter adds anti-thrash and IME handling on top). The store is cached and
 * only rebuilt when the queries or fallback actually change, keeping `subscribe`
 * stable across renders even though callers usually pass a fresh `queries` object.
 */
export function useMatchedVariant<K extends string>(queries: Record<K, string>, fallback: K): K {
  const cacheKey = `${JSON.stringify(queries)}\u0000${fallback}`;
  const cache = useRef<{ key: string; store: MediaQueryStore<K> } | null>(null);

  if (cache.current === null || cache.current.key !== cacheKey) {
    cache.current = { key: cacheKey, store: createMediaQueryStore(queries, fallback) };
  }

  const { store } = cache.current;
  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
}
