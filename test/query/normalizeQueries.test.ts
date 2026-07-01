import { describe, expect, it } from 'vitest';

import { normalizeQueries } from '../../src/query/normalizeQueries';

describe('normalizeQueries', () => {
  it('converts integer breakpoints to mobile-first bands', () => {
    expect(normalizeQueries({ mobile: 0, desktop: 768 })).toEqual({
      mobile: '(max-width: 767px)',
      desktop: '(min-width: 768px)',
    });
  });

  it('passes raw media-query strings through unchanged (same reference)', () => {
    const q = { portrait: '(orientation: portrait)', landscape: '(orientation: landscape)' };
    expect(normalizeQueries(q)).toBe(q);
  });

  it('throws on a mix of integers and query strings', () => {
    expect(() => normalizeQueries({ a: 0, b: '(min-width: 1px)' } as never)).toThrow(/mix/i);
  });

  it('validates integers through breakpointsToQueries (rejects fractional)', () => {
    expect(() => normalizeQueries({ mobile: 0, desktop: 768.5 })).toThrow(/integer/i);
  });
});
