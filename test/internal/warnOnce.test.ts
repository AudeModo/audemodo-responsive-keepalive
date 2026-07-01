import { afterEach, describe, expect, it, vi } from 'vitest';

import { resetWarnings, warnOnce } from '../../src/internal/warnOnce';

afterEach(() => {
  resetWarnings();
  vi.restoreAllMocks();
});

describe('warnOnce', () => {
  it('emits each distinct message only once', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    warnOnce('hello');
    warnOnce('hello');
    warnOnce('world');
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('resetWarnings lets a previously-seen message warn again', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    warnOnce('dup');
    warnOnce('dup');
    resetWarnings();
    warnOnce('dup');
    expect(spy).toHaveBeenCalledTimes(2);
  });
});
