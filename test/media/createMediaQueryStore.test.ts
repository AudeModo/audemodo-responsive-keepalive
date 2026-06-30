// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createMediaQueryStore } from '../../src/media/createMediaQueryStore';
import { makeMatchMedia } from '../helpers';

const Q = { desktop: '(min-width:768px)', mobile: '(max-width:767px)' };

afterEach(() => vi.unstubAllGlobals());

describe('createMediaQueryStore (pure factory)', () => {
  it('getSnapshot returns the first matching query key', () => {
    const { mm, set } = makeMatchMedia();
    vi.stubGlobal('matchMedia', mm);
    set({ '(min-width:768px)': true });
    expect(createMediaQueryStore(Q, 'mobile').getSnapshot()).toBe('desktop');
  });

  it('getSnapshot falls back when nothing matches', () => {
    const { mm } = makeMatchMedia();
    vi.stubGlobal('matchMedia', mm);
    expect(createMediaQueryStore(Q, 'mobile').getSnapshot()).toBe('mobile');
  });

  it('getServerSnapshot always returns the fallback', () => {
    expect(createMediaQueryStore(Q, 'mobile').getServerSnapshot()).toBe('mobile');
  });

  it('subscribe notifies on change and unsubscribe stops notifications', () => {
    const { mm, set } = makeMatchMedia();
    vi.stubGlobal('matchMedia', mm);
    const store = createMediaQueryStore(Q, 'mobile');
    let calls = 0;
    const unsubscribe = store.subscribe(() => {
      calls += 1;
    });
    set({ '(max-width:767px)': true });
    expect(calls).toBe(1);
    unsubscribe();
    set({ '(min-width:768px)': true });
    expect(calls).toBe(1);
  });
});
