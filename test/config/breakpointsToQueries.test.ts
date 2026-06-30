import { describe, expect, it } from 'vitest';
import { breakpointsToQueries } from '../../src/config/breakpointsToQueries';

describe('breakpointsToQueries (pure, integer-only)', () => {
  it('derives non-overlapping mobile-first bands from integer thresholds', () => {
    const q = breakpointsToQueries({ desktop: 1024, mobile: 0, tablet: 768 });
    expect(q.mobile).toBe('(max-width: 767px)');
    expect(q.tablet).toBe('(min-width: 768px) and (max-width: 1023px)');
    expect(q.desktop).toBe('(min-width: 1024px)');
  });

  it('orders result keys floor-first (default ssr becomes the floor)', () => {
    const q = breakpointsToQueries({ desktop: 760, mobile: 0 });
    expect(Object.keys(q)).toEqual(['mobile', 'desktop']);
    expect(q.mobile).toBe('(max-width: 759px)');
    expect(q.desktop).toBe('(min-width: 760px)');
  });

  it('supports a non-zero floor (leaving a deliberate gap below it)', () => {
    const q = breakpointsToQueries({ small: 320, large: 960 });
    expect(q.small).toBe('(min-width: 320px) and (max-width: 959px)');
    expect(q.large).toBe('(min-width: 960px)');
  });

  it('returns an always-matching query for a single floor-0 breakpoint', () => {
    expect(breakpointsToQueries({ only: 0 })).toEqual({ only: '(min-width: 0px)' });
  });

  it('throws on an empty config', () => {
    expect(() => breakpointsToQueries({} as Record<string, number>)).toThrow();
  });

  it('throws on a non-integer (fractional) value', () => {
    expect(() => breakpointsToQueries({ mobile: 0, desktop: 768.5 })).toThrow(/integer/i);
  });

  it('throws on a negative value', () => {
    expect(() => breakpointsToQueries({ mobile: -1 })).toThrow(/integer/i);
  });
});
