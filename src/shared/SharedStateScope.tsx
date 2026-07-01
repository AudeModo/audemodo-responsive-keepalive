import { createContext, useRef, type ReactNode } from 'react';
import { createSharedStore, type SharedStore } from './createSharedStore';

export const SharedStateContext = createContext<SharedStore | null>(null);

/**
 * Provides a shared-state store to its subtree, so descendants can synchronize
 * state via `useSharedState` without lifting it to a common parent.
 *
 * One store is created per scope instance (SSR-safe: fresh per render tree, no
 * cross-request leakage). `<Responsive>` mounts a scope automatically, so the
 * common case needs no explicit provider; use this directly to share state
 * between siblings that are not under a `<Responsive>`.
 */
export function SharedStateScope({ children }: { children: ReactNode }) {
  const storeRef = useRef<SharedStore | null>(null);
  if (storeRef.current === null) {
    storeRef.current = createSharedStore();
  }
  return (
    <SharedStateContext.Provider value={storeRef.current}>{children}</SharedStateContext.Provider>
  );
}
