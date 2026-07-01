export interface MediaQueryStore<K extends string> {
  subscribe: (onChange: () => void) => () => void;
  getSnapshot: () => K;
  getServerSnapshot: () => K;
}

/**
 * Pure factory (no React) producing a `useSyncExternalStore`-compatible store that
 * maps a set of media queries to a variant key. The first matching query in object
 * order wins; otherwise `fallback` is returned. Server/SSR always returns `fallback`.
 *
 * Isolating this from React makes the matchMedia logic unit-testable on its own.
 */
export function createMediaQueryStore<K extends string>(
  queries: Record<K, string>,
  fallback: K,
): MediaQueryStore<K> {
  const keys = Object.keys(queries) as K[];

  const subscribe = (onChange: () => void): (() => void) => {
    if (typeof window === 'undefined' || !window.matchMedia) return () => {};
    const lists = keys.map((key) => window.matchMedia(queries[key]));
    for (const list of lists) list.addEventListener('change', onChange);
    return () => {
      for (const list of lists) list.removeEventListener('change', onChange);
    };
  };

  const getSnapshot = (): K => {
    if (typeof window === 'undefined' || !window.matchMedia) return fallback;
    for (const key of keys) {
      if (window.matchMedia(queries[key]).matches) return key;
    }
    return fallback;
  };

  const getServerSnapshot = (): K => fallback;

  return { subscribe, getSnapshot, getServerSnapshot };
}
