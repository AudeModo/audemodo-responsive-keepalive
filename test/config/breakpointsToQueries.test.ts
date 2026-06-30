import { describe, expect, it } from 'vitest';
import { breakpointsToQueries } from '../../src/config/breakpointsToQueries';

describe('breakpointsToQueries (pure)', () => {
  it('passes media-query strings through unchanged', () => {
    const q = breakpointsToQueries({ desktop: '(min-width: 760px)', mobile: '(max-width: 759px)' });
    expect(q).toEqual({ desktop: '(min-width: 760px)', mobile: '(max-width: 759px)' });
  });

  it('derives non-overlapping mobile-first bands from numeric thresholds', () => {
    const q = breakpointsToQueries({ desktop: 1024, mobile: 0, tablet: 768 });
    expect(q.mobile).toBe('(max-width: 767px)');
    expect(q.tablet).toBe('(min-width: 768px) and (max-width: 1023px)');
    expect(q.desktop).toBe('(min-width: 1024px)');
  });

  it('orders numeric result keys floor-first (default ssr becomes the floor)', () => {
    const q = breakpointsToQueries({ desktop: 760, mobile: 0 });
    expect(Object.keys(q)).toEqual(['mobile', 'desktop']);
  });

  it('supports a non-zero floor (leaving a deliberate gap below it)', () => {
    const q = breakpointsToQueries({ small: 320, large: 960 });
    expect(q.small).toBe('(min-width: 320px) and (max-width: 959px)');
    expect(q.large).toBe('(min-width: 960px)');
  });

  it('throws on a mix of numbers and strings', () => {
    expect(() => breakpointsToQueries({ a: 0, b: '(min-width: 10px)' } as never)).toThrow();
  });
});
