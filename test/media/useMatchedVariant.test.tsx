import { afterEach, describe, expect, it, vi } from 'vitest';
import { useState } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useMatchedVariant } from '../../src/media/useMatchedVariant';

const D = '(min-width:768px)';
const M = '(max-width:767px)';

function countingMatchMedia() {
  let state: Record<string, boolean> = {};
  const listeners = new Set<() => void>();
  let subscribeCalls = 0;
  const mm = (q: string) =>
    ({
      get matches() {
        return !!state[q];
      },
      media: q,
      addEventListener: (_: string, cb: () => void) => {
        subscribeCalls += 1;
        listeners.add(cb);
      },
      removeEventListener: (_: string, cb: () => void) => listeners.delete(cb),
      addListener: () => {},
      removeListener: () => {},
      onchange: null,
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList;
  return {
    mm,
    set: (n: Record<string, boolean>) => {
      state = n;
      listeners.forEach((l) => l());
    },
    subscribeCalls: () => subscribeCalls,
  };
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('useMatchedVariant (store cache)', () => {
  it('keeps a single subscription across re-renders despite a fresh queries object each render', () => {
    const { mm, subscribeCalls } = countingMatchMedia();
    vi.stubGlobal('matchMedia', mm);
    function Harness() {
      const [, force] = useState(0);
      const v = useMatchedVariant<'desktop' | 'mobile'>({ desktop: D, mobile: M }, 'mobile');
      return (
        <button data-testid="b" onClick={() => force((n) => n + 1)}>
          {v}
        </button>
      );
    }
    render(<Harness />);
    const afterMount = subscribeCalls();
    expect(afterMount).toBeGreaterThan(0);
    fireEvent.click(screen.getByTestId('b'));
    fireEvent.click(screen.getByTestId('b'));
    expect(subscribeCalls()).toBe(afterMount);
  });

  it('rebuilds the store (re-subscribes) when the queries actually change', () => {
    const { mm, subscribeCalls } = countingMatchMedia();
    vi.stubGlobal('matchMedia', mm);
    function Harness({ q }: { q: string }) {
      const v = useMatchedVariant({ only: q }, 'only');
      return <span data-testid="v">{v}</span>;
    }
    const { rerender } = render(<Harness q={D} />);
    const afterFirst = subscribeCalls();
    rerender(<Harness q={M} />);
    expect(subscribeCalls()).toBeGreaterThan(afterFirst);
  });
});
