// @vitest-environment jsdom
import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useMediaVariant } from '../../src';
import { makeMatchMedia } from '../helpers';

const DESKTOP = '(min-width:768px)';
const MOBILE = '(max-width:767px)';

function Probe(opts: { ssr?: 'desktop' | 'mobile'; settleMs?: number; defer?: boolean }) {
  const v = useMediaVariant(
    { desktop: DESKTOP, mobile: MOBILE },
    { ssr: opts.ssr, settleMs: opts.settleMs, deferWhileComposing: opts.defer },
  );
  return <span data-testid="v">{v}</span>;
}
const cur = () => screen.getByTestId('v').textContent;

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('useMediaVariant', () => {
  it('defaults the fallback to the first query key when ssr is omitted', () => {
    const { mm } = makeMatchMedia();
    vi.stubGlobal('matchMedia', mm);
    render(<Probe />);
    expect(cur()).toBe('desktop');
  });

  it('settleMs suppresses a transient flip shorter than the window (anti-thrash, wired in)', () => {
    vi.useFakeTimers();
    const { mm, set } = makeMatchMedia();
    vi.stubGlobal('matchMedia', mm);
    act(() => set({ [DESKTOP]: true }));
    render(<Probe ssr="mobile" settleMs={150} />);
    expect(cur()).toBe('desktop');
    act(() => set({ [MOBILE]: true }));
    act(() => vi.advanceTimersByTime(100));
    act(() => set({ [DESKTOP]: true }));
    act(() => vi.advanceTimersByTime(300));
    expect(cur()).toBe('desktop');
  });

  it('deferWhileComposing holds a media change during IME composition, applies on compositionend', () => {
    const { mm, set } = makeMatchMedia();
    vi.stubGlobal('matchMedia', mm);
    act(() => set({ [DESKTOP]: true }));
    render(<Probe ssr="mobile" defer />);
    expect(cur()).toBe('desktop');
    act(() => document.dispatchEvent(new Event('compositionstart')));
    act(() => set({ [MOBILE]: true }));
    expect(cur()).toBe('desktop');
    act(() => document.dispatchEvent(new Event('compositionend')));
    expect(cur()).toBe('mobile');
  });

  it('does not defer when deferWhileComposing is omitted (default off)', () => {
    const { mm, set } = makeMatchMedia();
    vi.stubGlobal('matchMedia', mm);
    act(() => set({ [DESKTOP]: true }));
    render(<Probe ssr="mobile" />);
    act(() => document.dispatchEvent(new Event('compositionstart')));
    act(() => set({ [MOBILE]: true }));
    expect(cur()).toBe('mobile');
  });

  it('applies policies outermost-wins: the IME hold outranks a settle that would otherwise commit', () => {
    vi.useFakeTimers();
    const { mm, set } = makeMatchMedia();
    vi.stubGlobal('matchMedia', mm);
    act(() => set({ [DESKTOP]: true }));
    render(<Probe ssr="mobile" settleMs={100} defer />);
    expect(cur()).toBe('desktop');
    act(() => document.dispatchEvent(new Event('compositionstart')));
    act(() => set({ [MOBILE]: true }));
    act(() => vi.advanceTimersByTime(150));
    expect(cur()).toBe('desktop');
    act(() => document.dispatchEvent(new Event('compositionend')));
    expect(cur()).toBe('mobile');
  });

  it('accepts integer breakpoints, deriving the same mobile-first bands', () => {
    const { mm, set } = makeMatchMedia();
    vi.stubGlobal('matchMedia', mm);
    function Int(opts: { ssr?: 'mobile' | 'desktop' }) {
      return (
        <span data-testid="v">
          {useMediaVariant({ mobile: 0, desktop: 768 }, { ssr: opts.ssr })}
        </span>
      );
    }
    act(() => set({ '(min-width: 768px)': true }));
    render(<Int ssr="mobile" />);
    expect(cur()).toBe('desktop');
    act(() => set({ '(max-width: 767px)': true }));
    expect(cur()).toBe('mobile');
  });

  it('defaults the fallback to the floor variant for integer breakpoints', () => {
    const { mm } = makeMatchMedia();
    vi.stubGlobal('matchMedia', mm); // nothing matches, no ssr
    function Int() {
      return <span data-testid="v">{useMediaVariant({ mobile: 0, desktop: 768 })}</span>;
    }
    render(<Int />);
    expect(cur()).toBe('mobile'); // floor-first ordering -> 'mobile'
  });
});
