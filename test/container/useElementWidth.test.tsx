// @vitest-environment jsdom
import { act, cleanup, render, screen } from '@testing-library/react';
import { useRef } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useElementWidth } from '../../src/container/useElementWidth';
import {
  fireResize,
  MockResizeObserver,
  resetResizeObservers,
  resizeDisconnectCount,
} from '../helpers';

function Probe() {
  const ref = useRef<HTMLDivElement>(null);
  const width = useElementWidth(ref);
  return (
    <div ref={ref} data-testid="w">
      {width === null ? 'null' : String(width)}
    </div>
  );
}
const cur = () => screen.getByTestId('w').textContent;

afterEach(() => {
  cleanup();
  resetResizeObservers();
  vi.unstubAllGlobals();
});

describe('useElementWidth', () => {
  it('returns null before the first measurement', () => {
    vi.stubGlobal('ResizeObserver', MockResizeObserver);
    render(<Probe />);
    expect(cur()).toBe('null');
  });

  it('reports the observed content width', () => {
    vi.stubGlobal('ResizeObserver', MockResizeObserver);
    render(<Probe />);
    act(() => fireResize(640));
    expect(cur()).toBe('640');
  });

  it('stays null when ResizeObserver is unavailable (no crash)', () => {
    render(<Probe />);
    expect(cur()).toBe('null');
  });

  it('disconnects the observer on unmount (no leak)', () => {
    vi.stubGlobal('ResizeObserver', MockResizeObserver);
    const { unmount } = render(<Probe />);
    expect(resizeDisconnectCount()).toBe(0);
    unmount();
    expect(resizeDisconnectCount()).toBe(1);
  });
});
