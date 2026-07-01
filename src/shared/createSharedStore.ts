/** A keyed value store with per-key subscriptions. React-free and unit-testable. */
export interface SharedStore {
  has(key: string): boolean;
  get(key: string): unknown;
  set(key: string, value: unknown): void;
  subscribe(key: string, listener: () => void): () => void;
}

export function createSharedStore(): SharedStore {
  const values = new Map<string, unknown>();
  const listeners = new Map<string, Set<() => void>>();

  return {
    has: (key) => values.has(key),
    get: (key) => values.get(key),
    set: (key, value) => {
      values.set(key, value);
      const subs = listeners.get(key);
      if (subs) for (const listener of subs) listener();
    },
    subscribe: (key, listener) => {
      let subs = listeners.get(key);
      if (!subs) {
        subs = new Set();
        listeners.set(key, subs);
      }
      subs.add(listener);
      return () => {
        const current = listeners.get(key);
        if (!current) return;
        current.delete(listener);
        if (current.size === 0) listeners.delete(key);
      };
    },
  };
}
