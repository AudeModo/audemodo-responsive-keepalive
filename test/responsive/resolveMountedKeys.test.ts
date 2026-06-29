import { describe, expect, it } from 'vitest';
import { resolveMountedKeys } from '../../src/responsive/resolveMountedKeys';

const keys = ['mobile', 'desktop'] as const;

describe('resolveMountedKeys (pure)', () => {
  it('eager returns all keys regardless of activation', () => {
    expect(resolveMountedKeys(keys, 'eager', new Set())).toEqual(['mobile', 'desktop']);
  });

  it('lazy returns only activated keys', () => {
    expect(resolveMountedKeys(keys, 'lazy', new Set(['desktop']))).toEqual(['desktop']);
  });

  it('lazy preserves the original key order', () => {
    expect(resolveMountedKeys(keys, 'lazy', new Set(['desktop', 'mobile']))).toEqual([
      'mobile',
      'desktop',
    ]);
  });

  it('lazy with nothing activated returns empty', () => {
    expect(resolveMountedKeys(keys, 'lazy', new Set())).toEqual([]);
  });
});
