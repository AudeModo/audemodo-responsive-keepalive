import { afterEach, describe, expect, it, vi } from 'vitest';
import { useRef } from 'react';
import { act, cleanup, render, screen } from '@testing-library/react';
import { useContainerVariant } from '../../src/container/useContainerVariant';
import { MockResizeObserver, fireResize, resetResizeObservers } from '../helpers';

function Probe({ ssr, settleMs = 0 }: { ssr?: 'stack' | 'row'; settleMs?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const variant = useContainerVariant(ref, { stack: 0, row: 480 }, { ssr, settleMs });
  return (
    <div ref={ref} data-testid="v">
      {variant}
    </div>
  );
}
const cur = () => screen.getByTestId('v').textContent;

afterEach(() => {
  cleanup();
  resetResizeObservers();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('useContainerVariant', () => {
  it('returns the floor variant before measurement when no ssr is given', () => {
    vi.stubGlobal('ResizeObserver', MockResizeObserver);
    render(<Probe />);
    expect(cur()).toBe('stack');
  });

  it('returns the ssr variant before measurement, overriding the floor', () => {
    vi.stubGlobal('ResizeObserver', MockResizeObserver);
    render(<Probe ssr="row" />);
    expect(cur()).toBe('row');
  });

  it('updates the variant when the container width crosses a threshold', () => {
    vi.stubGlobal('ResizeObserver', MockResizeObserver);
    render(<Probe ssr="stack" />);
    act(() => fireResize(600));
    expect(cur()).toBe('row');
    act(() => fireResize(300));
    expect(cur()).toBe('stack');
  });

  it('applies settleMs so a transient width change does not commit', () => {
    vi.useFakeTimers();
    vi.stubGlobal('ResizeObserver', MockResizeObserver);
    render(<Probe ssr="stack" settleMs={120} />);
    act(() => fireResize(600));
    expect(cur()).toBe('stack');
    act(() => vi.advanceTimersByTime(120));
    expect(cur()).toBe('row');
  });
});
