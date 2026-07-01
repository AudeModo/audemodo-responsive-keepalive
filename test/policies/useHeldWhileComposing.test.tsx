// @vitest-environment jsdom
import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { useHeldWhileComposing } from '../../src/policies/useHeldWhileComposing';

function Probe({ value, enabled }: { value: string; enabled: boolean }) {
  return <span data-testid="v">{useHeldWhileComposing(value, enabled)}</span>;
}
const cur = () => screen.getByTestId('v').textContent;

afterEach(() => cleanup());

describe('useHeldWhileComposing', () => {
  it('passes through when disabled', () => {
    const { rerender } = render(<Probe value="a" enabled={false} />);
    rerender(<Probe value="b" enabled={false} />);
    expect(cur()).toBe('b');
  });

  it('holds value changes during composition, applies on compositionend', () => {
    const { rerender } = render(<Probe value="a" enabled />);
    act(() => document.dispatchEvent(new Event('compositionstart')));
    rerender(<Probe value="b" enabled />);
    expect(cur()).toBe('a');
    act(() => document.dispatchEvent(new Event('compositionend')));
    expect(cur()).toBe('b');
  });

  it('applies immediately when not composing', () => {
    const { rerender } = render(<Probe value="a" enabled />);
    rerender(<Probe value="b" enabled />);
    expect(cur()).toBe('b');
  });
});
