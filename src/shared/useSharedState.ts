import { useCallback, useContext, useRef, useSyncExternalStore } from 'react';

import { SharedStateContext } from './SharedStateScope';

export type SetSharedState<T> = (next: T | ((prev: T) => T)) => void;

/**
 * A `useState`-shaped hook whose state is shared by key across every call site in
 * the same scope. Declare it independently inside sibling components (e.g. a
 * Mobile and a Desktop layout) and writes from one are reflected in the others —
 * no lifting required. Must be used within `<Responsive>` or `<SharedStateScope>`.
 *
 * Because the store lives in the scope (a stable ancestor), the value also
 * survives `strategy="swap"` and keep-alive switches. Use the **same key and the
 * same initial value** at every call site; the first present value wins.
 *
 * @example
 * // inside both MobileLayout and DesktopLayout, with no parent state:
 * const [query, setQuery] = useSharedState('search', '');
 */
export function useSharedState<T>(key: string, initialValue: T): [T, SetSharedState<T>] {
  const store = useContext(SharedStateContext);
  if (store === null) {
    throw new Error(
      '[responsive-keepalive] useSharedState must be used within <Responsive> or <SharedStateScope>.',
    );
  }

  const initialRef = useRef(initialValue); // stable initial across renders

  const subscribe = useCallback(
    (onChange: () => void) => store.subscribe(key, onChange),
    [store, key],
  );
  const getSnapshot = useCallback(
    (): T => (store.has(key) ? (store.get(key) as T) : initialRef.current),
    [store, key],
  );

  const value = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const setValue = useCallback<SetSharedState<T>>(
    (next) => {
      const prev = store.has(key) ? (store.get(key) as T) : initialRef.current;
      const resolved = typeof next === 'function' ? (next as (p: T) => T)(prev) : next;
      store.set(key, resolved);
    },
    [store, key],
  );

  return [value, setValue];
}
