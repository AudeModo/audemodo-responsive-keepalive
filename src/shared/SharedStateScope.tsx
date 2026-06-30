import { createContext, useRef, type ReactNode } from 'react';
import { createSharedStore, type SharedStore } from './createSharedStore';

export const SharedStateContext = createContext<SharedStore | null>(null);

export function SharedStateScope({ children }: { children: ReactNode }) {
  const storeRef = useRef<SharedStore | null>(null);
  if (storeRef.current === null) {
    storeRef.current = createSharedStore();
  }
  return (
    <SharedStateContext.Provider value={storeRef.current}>{children}</SharedStateContext.Provider>
  );
}
