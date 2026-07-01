import { describe, expect, it, vi } from 'vitest';

import { createSharedStore } from '../../src/shared/createSharedStore';

describe('createSharedStore (pure)', () => {
  it('stores and retrieves values per key', () => {
    const store = createSharedStore();
    expect(store.has('a')).toBe(false);
    store.set('a', 1);
    expect(store.has('a')).toBe(true);
    expect(store.get('a')).toBe(1);
  });

  it('notifies only subscribers of the written key', () => {
    const store = createSharedStore();
    const a = vi.fn();
    const b = vi.fn();
    store.subscribe('a', a);
    store.subscribe('b', b);
    store.set('a', 1);
    expect(a).toHaveBeenCalledTimes(1);
    expect(b).not.toHaveBeenCalled();
  });

  it('stops notifying after unsubscribe', () => {
    const store = createSharedStore();
    const a = vi.fn();
    const unsubscribe = store.subscribe('a', a);
    store.set('a', 1);
    unsubscribe();
    store.set('a', 2);
    expect(a).toHaveBeenCalledTimes(1);
  });

  it('supports multiple subscribers on one key', () => {
    const store = createSharedStore();
    const a1 = vi.fn();
    const a2 = vi.fn();
    store.subscribe('a', a1);
    store.subscribe('a', a2);
    store.set('a', 1);
    expect(a1).toHaveBeenCalledTimes(1);
    expect(a2).toHaveBeenCalledTimes(1);
  });
});
