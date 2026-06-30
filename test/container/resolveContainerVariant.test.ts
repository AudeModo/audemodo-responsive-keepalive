import { describe, expect, it } from 'vitest';
import { resolveContainerVariant } from '../../src/container/resolveContainerVariant';

const bp = { stack: 0, row: 480, wide: 960 };

describe('resolveContainerVariant (pure)', () => {
  it('picks the greatest threshold not exceeding the width', () => {
    expect(resolveContainerVariant(500, bp)).toBe('row');
    expect(resolveContainerVariant(960, bp)).toBe('wide');
    expect(resolveContainerVariant(959, bp)).toBe('row');
  });

  it('uses the floor variant below all thresholds', () => {
    expect(resolveContainerVariant(100, bp)).toBe('stack');
    expect(resolveContainerVariant(0, bp)).toBe('stack');
  });

  it('handles unordered breakpoint maps', () => {
    expect(resolveContainerVariant(700, { wide: 960, stack: 0, row: 480 })).toBe('row');
  });

  it('throws on empty breakpoints', () => {
    expect(() => resolveContainerVariant(100, {} as Record<string, number>)).toThrow();
  });
});
