import { useRef, useSyncExternalStore } from 'react';
import { createMediaQueryStore, type MediaQueryStore } from './createMediaQueryStore';

export function useMatchedVariant<K extends string>(queries: Record<K, string>, fallback: K): K {
  const cacheKey = `${JSON.stringify(queries)}\u0000${fallback}`;
  const cache = useRef<{ key: string; store: MediaQueryStore<K> } | null>(null);

  if (cache.current === null || cache.current.key !== cacheKey) {
    cache.current = { key: cacheKey, store: createMediaQueryStore(queries, fallback) };
  }

  const { store } = cache.current;
  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
}
