import { useCallback, useContext, useRef, useSyncExternalStore } from 'react';
import { SharedStateContext } from './SharedStateScope';

export type SetSharedState<T> = (next: T | ((prev: T) => T)) => void;

export function useSharedState<T>(key: string, initialValue: T): [T, SetSharedState<T>] {
  const store = useContext(SharedStateContext);
  if (store === null) {
    throw new Error(
      '[responsive-keepalive] useSharedState must be used within <Responsive> or <SharedStateScope>.',
    );
  }

  const initialRef = useRef(initialValue);

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
