import { describe, expect, it } from 'vitest';
import { renderVariant } from '../../src/responsive/renderVariant';

describe('renderVariant (pure)', () => {
  it('calls the function form to produce a node', () => {
    let calls = 0;
    const value = renderVariant(() => {
      calls += 1;
      return 'made';
    });
    expect(value).toBe('made');
    expect(calls).toBe(1);
  });

  it('passes a non-function node through unchanged (no call)', () => {
    expect(renderVariant('node')).toBe('node');
    expect(renderVariant(42)).toBe(42);
    expect(renderVariant(null)).toBeNull();
  });
});
