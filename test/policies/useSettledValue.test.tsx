// @vitest-environment jsdom
import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useSettledValue } from '../../src/policies/useSettledValue';

function Probe({ value, settleMs }: { value: string; settleMs: number }) {
  return <span data-testid="v">{useSettledValue(value, settleMs)}</span>;
}
const cur = () => screen.getByTestId('v').textContent;

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('useSettledValue', () => {
  it('settleMs=0 passes the value through immediately', () => {
    const { rerender } = render(<Probe value="a" settleMs={0} />);
    expect(cur()).toBe('a');
    rerender(<Probe value="b" settleMs={0} />);
    expect(cur()).toBe('b');
  });

  it('holds until the value has been stable for settleMs', () => {
    vi.useFakeTimers();
    const { rerender } = render(<Probe value="a" settleMs={100} />);
    rerender(<Probe value="b" settleMs={100} />);
    expect(cur()).toBe('a');
    act(() => vi.advanceTimersByTime(100));
    expect(cur()).toBe('b');
  });

  it('resets the timer on rapid changes (transient values never surface)', () => {
    vi.useFakeTimers();
    const { rerender } = render(<Probe value="a" settleMs={100} />);
    rerender(<Probe value="b" settleMs={100} />);
    act(() => vi.advanceTimersByTime(60));
    rerender(<Probe value="c" settleMs={100} />);
    act(() => vi.advanceTimersByTime(60));
    expect(cur()).toBe('a');
    act(() => vi.advanceTimersByTime(40));
    expect(cur()).toBe('c');
  });
});
