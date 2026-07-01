// @vitest-environment jsdom
import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useResponsiveValue } from '../../src/media/useResponsiveValue';
import { makeMatchMedia } from '../helpers';

const Q = { mobile: '(max-width:600px)', desktop: '(min-width:601px)' };

function Probe() {
  const cols = useResponsiveValue(Q, { mobile: 1, desktop: 3 }, { ssr: 'mobile' });
  return <span data-testid="v">{cols}</span>;
}
const cur = () => screen.getByTestId('v').textContent;

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('useResponsiveValue', () => {
  it('returns the value for the matching query', () => {
    const { mm, set } = makeMatchMedia();
    vi.stubGlobal('matchMedia', mm);
    act(() => set({ '(min-width:601px)': true }));
    render(<Probe />);
    expect(cur()).toBe('3');
  });

  it('falls back to the ssr value when nothing matches', () => {
    const { mm } = makeMatchMedia();
    vi.stubGlobal('matchMedia', mm);
    render(<Probe />);
    expect(cur()).toBe('1');
  });

  it('uses the first key as the fallback when no ssr is given', () => {
    const { mm } = makeMatchMedia();
    vi.stubGlobal('matchMedia', mm);
    function NoSsr() {
      return <span data-testid="v">{useResponsiveValue(Q, { mobile: 1, desktop: 3 })}</span>;
    }
    render(<NoSsr />);
    expect(cur()).toBe('1');
  });

  it('reacts to media changes', () => {
    const { mm, set } = makeMatchMedia();
    vi.stubGlobal('matchMedia', mm);
    act(() => set({ '(max-width:600px)': true }));
    render(<Probe />);
    expect(cur()).toBe('1');
    act(() => set({ '(min-width:601px)': true }));
    expect(cur()).toBe('3');
  });

  it('accepts integer breakpoints', () => {
    const { mm, set } = makeMatchMedia();
    vi.stubGlobal('matchMedia', mm);
    function Int() {
      return (
        <span data-testid="v">
          {useResponsiveValue(
            { mobile: 0, desktop: 768 },
            { mobile: 1, desktop: 3 },
            { ssr: 'mobile' },
          )}
        </span>
      );
    }
    act(() => set({ '(min-width: 768px)': true }));
    render(<Int />);
    expect(cur()).toBe('3');
  });
});
